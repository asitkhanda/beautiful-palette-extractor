export interface Color {
  r: number;
  g: number;
  b: number;
}

export function extractColorsFromImage(imageUrl: string, numColors: number = 8): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve([]);
        return;
      }
      
      // Resize image for faster processing
      const maxSize = 200;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const colors = extractDominantColors(imageData, numColors);
      
      resolve(colors.map(colorToHex));
    };
    
    img.onerror = () => resolve([]);
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