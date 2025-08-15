export interface Color {
  r: number;
  g: number;
  b: number;
}

export function extractColorsFromImage(imageUrl: string, numColors: number = 8): Promise<string[]> {
  return new Promise((resolve) => {
    console.log('🎨 Starting color extraction for:', imageUrl);
    
    // Security: Input validation
    if (!isValidImageUrl(imageUrl) || numColors < 1 || numColors > 20) {
      console.log('❌ Invalid image URL or numColors:', { imageUrl, numColors });
      resolve([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    // Security: Add timeout for image loading
    const timeoutId = setTimeout(() => {
      console.log('⏰ Image loading timeout');
      resolve([]);
    }, 15000); // 15 second timeout
    
    img.onload = () => {
      clearTimeout(timeoutId);
      console.log('✅ Image loaded successfully:', { width: img.width, height: img.height });
      
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.log('❌ Could not get canvas context');
          resolve([]);
          return;
        }
        
        // Security: Validate image dimensions (increased limit for modern high-res images)
        if (img.width > 16384 || img.height > 16384 || img.width < 1 || img.height < 1) {
          console.log('❌ Invalid image dimensions:', { width: img.width, height: img.height });
          resolve([]);
          return;
        }
        
        // Resize image for faster processing
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        console.log('🖼️ Processing image at size:', { width: canvas.width, height: canvas.height });
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('📊 Got image data, pixels:', imageData.data.length / 4);
        
        const colors = extractDominantColors(imageData, numColors);
        console.log('🎨 Extracted colors:', colors);
        
        const hexColors = colors.map(color => sanitizeHexColor(colorToHex(color)));
        console.log('🎯 Final hex colors:', hexColors);
        
        resolve(hexColors);
      } catch (error) {
        console.log('❌ Error during color extraction:', error);
        resolve([]);
      }
    };
    
    img.onerror = (error) => {
      clearTimeout(timeoutId);
      console.log('❌ Image loading error:', error);
      resolve([]);
    };
    
    img.src = imageUrl;
  });
}

function extractDominantColors(imageData: ImageData, numColors: number): Color[] {
  const pixels: Color[] = [];
  const data = imageData.data;
  
  // Sample pixels (every 4th pixel for performance)
  for (let i = 0; i < data.length; i += 16) {
    pixels.push({
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
    });
  }
  
  // Use K-means clustering to find dominant colors
  return kMeansColors(pixels, numColors);
}

function kMeansColors(pixels: Color[], k: number): Color[] {
  // Initialize centroids randomly
  let centroids: Color[] = [];
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push({ ...randomPixel });
  }
  
  // K-means iterations
  for (let iter = 0; iter < 10; iter++) {
    const clusters: Color[][] = Array(k).fill(null).map(() => []);
    
    // Assign pixels to nearest centroid
    pixels.forEach(pixel => {
      let minDistance = Infinity;
      let closestCentroid = 0;
      
      centroids.forEach((centroid, index) => {
        const distance = colorDistance(pixel, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      
      clusters[closestCentroid].push(pixel);
    });
    
    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0];
      
      const sum = cluster.reduce(
        (acc, color) => ({
          r: acc.r + color.r,
          g: acc.g + color.g,
          b: acc.b + color.b,
        }),
        { r: 0, g: 0, b: 0 }
      );
      
      return {
        r: Math.round(sum.r / cluster.length),
        g: Math.round(sum.g / cluster.length),
        b: Math.round(sum.b / cluster.length),
      };
    });
  }
  
  return centroids;
}

function colorDistance(color1: Color, color2: Color): number {
  return Math.sqrt(
    Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2)
  );
}

function colorToHex(color: Color): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

// Security: Input validation functions
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Check for data URLs (base64 images)
  if (url.startsWith('data:image/')) {
    return /^data:image\/(jpeg|png|gif|webp|bmp);base64,/.test(url);
  }
  
  // For other URLs, basic validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeHexColor(hex: string): string {
  // Security: Validate and sanitize hex color format
  if (!hex || typeof hex !== 'string') return '#000000';
  
  // Remove any non-hex characters except #
  const sanitized = hex.replace(/[^#0-9a-fA-F]/g, '');
  
  // Ensure proper hex format
  if (/^#[0-9a-fA-F]{6}$/.test(sanitized)) {
    return sanitized.toLowerCase();
  }
  
  return '#000000'; // Default fallback
}