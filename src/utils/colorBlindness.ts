import { ColorBlindnessType } from '@/components/ColorBlindnessSimulator';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function simulateColorBlindness(colors: string[], type: ColorBlindnessType): string[] {
  if (type === 'original') {
    return colors;
  }
  
  return colors.map(color => {
    const rgb = hexToRgb(color);
    const transformed = applyColorBlindnessMatrix(rgb, type);
    return rgbToHex(transformed);
  });
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function applyColorBlindnessMatrix(rgb: RGB, type: ColorBlindnessType): RGB {
  // Convert to linear RGB (0-1 range)
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  let newR: number, newG: number, newB: number;
  
  switch (type) {
    case 'protanopia': // Red-blind
      newR = 0.567 * r + 0.433 * g + 0.000 * b;
      newG = 0.558 * r + 0.442 * g + 0.000 * b;
      newB = 0.000 * r + 0.242 * g + 0.758 * b;
      break;
      
    case 'deuteranopia': // Green-blind
      newR = 0.625 * r + 0.375 * g + 0.000 * b;
      newG = 0.700 * r + 0.300 * g + 0.000 * b;
      newB = 0.000 * r + 0.300 * g + 0.700 * b;
      break;
      
    case 'tritanopia': // Blue-blind
      newR = 0.950 * r + 0.050 * g + 0.000 * b;
      newG = 0.000 * r + 0.433 * g + 0.567 * b;
      newB = 0.000 * r + 0.475 * g + 0.525 * b;
      break;
      
    default:
      newR = r;
      newG = g;
      newB = b;
  }
  
  // Convert back to 0-255 range
  return {
    r: newR * 255,
    g: newG * 255,
    b: newB * 255,
  };
}