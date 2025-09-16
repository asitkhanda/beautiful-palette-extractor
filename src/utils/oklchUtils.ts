export interface OKLCHColor {
  l: number; // Lightness (0-1)
  c: number; // Chroma (0-0.4)
  h: number; // Hue (0-360)
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// Convert RGB to OKLCH using a simplified implementation
export function rgbToOklch(rgb: RGBColor): OKLCHColor {
  // Normalize RGB values to 0-1
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // Convert to linear RGB
  const rLinear = srgbToLinear(r);
  const gLinear = srgbToLinear(g);
  const bLinear = srgbToLinear(b);

  // Convert to OKLab (simplified transformation matrix)
  const l = 0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear;
  const m = 0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear;
  const s = 0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear;

  // Apply cube root
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // Convert to OKLab
  const oklabL = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const oklabA = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const oklabB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;

  // Convert OKLab to OKLCH
  const lightness = oklabL;
  const chroma = Math.sqrt(oklabA * oklabA + oklabB * oklabB);
  let hue = Math.atan2(oklabB, oklabA) * 180 / Math.PI;
  
  // Normalize hue to 0-360
  if (hue < 0) hue += 360;

  return {
    l: lightness,
    c: chroma,
    h: hue
  };
}

// Convert OKLCH back to RGB
export function oklchToRgb(oklch: OKLCHColor): RGBColor {
  const { l, c, h } = oklch;
  
  // Convert OKLCH to OKLab
  const hueRad = h * Math.PI / 180;
  const oklabL = l;
  const oklabA = c * Math.cos(hueRad);
  const oklabB = c * Math.sin(hueRad);

  // Convert OKLab to linear RGB (inverse transformation)
  const lCube = oklabL + 0.3963377774 * oklabA + 0.2158037573 * oklabB;
  const mCube = oklabL - 0.1055613458 * oklabA - 0.0638541728 * oklabB;
  const sCube = oklabL - 0.0894841775 * oklabA - 1.2914855480 * oklabB;

  const lLinear = lCube * lCube * lCube;
  const mLinear = mCube * mCube * mCube;
  const sLinear = sCube * sCube * sCube;

  const rLinear = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
  const gLinear = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
  const bLinear = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.7076147010 * sLinear;

  // Convert back to sRGB
  const r = linearToSrgb(rLinear);
  const g = linearToSrgb(gLinear);
  const b = linearToSrgb(bLinear);

  return {
    r: Math.round(Math.max(0, Math.min(255, r * 255))),
    g: Math.round(Math.max(0, Math.min(255, g * 255))),
    b: Math.round(Math.max(0, Math.min(255, b * 255)))
  };
}

// Helper functions
function srgbToLinear(val: number): number {
  return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
}

function linearToSrgb(val: number): number {
  return val <= 0.0031308 ? val * 12.92 : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
}

// Convert OKLCH to CSS oklch() string
export function oklchToCss(oklch: OKLCHColor): string {
  return `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
}

// Convert RGB to hex string
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// Parse hex to RGB
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}