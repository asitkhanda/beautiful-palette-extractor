import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Copy, Check, Eye, Palette, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// ===== COLOR UTILITIES =====
interface RGB { r: number; g: number; b: number; }
interface OKLCH { l: number; c: number; h: number; }

function srgbToLinear(val: number): number {
  return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
}

function linearToSrgb(val: number): number {
  return val <= 0.0031308 ? val * 12.92 : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
}

function rgbToOklch(rgb: RGB): OKLCH {
  let r = srgbToLinear(rgb.r / 255);
  let g = srgbToLinear(rgb.g / 255);
  let b = srgbToLinear(rgb.b / 255);
  
  let l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  let m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  let s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  
  l_ = Math.cbrt(l_);
  m_ = Math.cbrt(m_);
  s_ = Math.cbrt(s_);
  
  let L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  let a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  let bVal = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  
  let C = Math.sqrt(a * a + bVal * bVal);
  let h = Math.atan2(bVal, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  
  return { l: Math.max(0, Math.min(1, L)), c: Math.max(0, C), h: isNaN(h) ? 0 : h };
}

function rgbToHex(rgb: RGB): string {
  return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`.toUpperCase();
}

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
}

function oklchToCss(oklch: OKLCH): string {
  return `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`;
}

// ===== CVD SIMULATION =====
type CVDType = 'normal' | 'protanopia' | 'protanomaly' | 'deuteranopia' | 'deuteranomaly' | 'tritanopia' | 'tritanomaly' | 'achromatopsia' | 'achromatomaly';

const CVD_MATRICES: Record<Exclude<CVDType, 'achromatomaly'>, number[][]> = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  protanomaly: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  deuteranomaly: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  tritanomaly: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

function simulateCVD(hex: string, type: CVDType): string {
  if (type === 'normal') return hex;
  const rgb = hexToRgb(hex);
  
  // Achromatomaly is partial grayscale (blend 50% with original)
  if (type === 'achromatomaly') {
    const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
    return rgbToHex({
      r: Math.round((rgb.r + gray) / 2),
      g: Math.round((rgb.g + gray) / 2),
      b: Math.round((rgb.b + gray) / 2),
    });
  }
  
  const matrix = CVD_MATRICES[type];
  const r = Math.round(Math.min(255, Math.max(0, matrix[0][0] * rgb.r + matrix[0][1] * rgb.g + matrix[0][2] * rgb.b)));
  const g = Math.round(Math.min(255, Math.max(0, matrix[1][0] * rgb.r + matrix[1][1] * rgb.g + matrix[1][2] * rgb.b)));
  const b = Math.round(Math.min(255, Math.max(0, matrix[2][0] * rgb.r + matrix[2][1] * rgb.g + matrix[2][2] * rgb.b)));
  return rgbToHex({ r, g, b });
}

// ===== CONTRAST CALCULATION (WCAG 2.1) =====
function getLuminance(rgb: RGB): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ===== COLOR EXTRACTION =====
function extractColors(imageData: ImageData, numColors: number = 8): string[] {
  const pixels: RGB[] = [];
  const data = imageData.data;
  const step = Math.max(1, Math.floor(data.length / 4 / 10000));
  
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a > 128) pixels.push({ r, g, b });
  }
  
  // K-means clustering
  let centroids: RGB[] = [];
  for (let i = 0; i < numColors; i++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)] || { r: 128, g: 128, b: 128 });
  }
  
  for (let iter = 0; iter < 20; iter++) {
    const clusters: RGB[][] = Array.from({ length: numColors }, () => []);
    
    for (const pixel of pixels) {
      let minDist = Infinity, closest = 0;
      for (let i = 0; i < centroids.length; i++) {
        const d = Math.pow(pixel.r - centroids[i].r, 2) + Math.pow(pixel.g - centroids[i].g, 2) + Math.pow(pixel.b - centroids[i].b, 2);
        if (d < minDist) { minDist = d; closest = i; }
      }
      clusters[closest].push(pixel);
    }
    
    centroids = clusters.map((cluster, i) => {
      if (cluster.length === 0) return centroids[i];
      const sum = cluster.reduce((acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }), { r: 0, g: 0, b: 0 });
      return { r: Math.round(sum.r / cluster.length), g: Math.round(sum.g / cluster.length), b: Math.round(sum.b / cluster.length) };
    });
  }
  
  return centroids.map(rgbToHex);
}

// ===== MAIN COMPONENT =====
interface PaletteColor {
  hex: string;
  oklch: OKLCH;
  contrastWhite: number;
  contrastBlack: number;
}

const CVD_OPTIONS: { value: CVDType; label: string }[] = [
  { value: 'normal', label: 'Original Palette' },
  { value: 'protanopia', label: 'Protanopia (Red-blind)' },
  { value: 'protanomaly', label: 'Protanomaly (Red-weak)' },
  { value: 'deuteranopia', label: 'Deuteranopia (Green-blind)' },
  { value: 'deuteranomaly', label: 'Deuteranomaly (Green-weak)' },
  { value: 'tritanopia', label: 'Tritanopia (Blue-blind)' },
  { value: 'tritanomaly', label: 'Tritanomaly (Blue-weak)' },
  { value: 'achromatopsia', label: 'Achromatopsia (Complete)' },
  { value: 'achromatomaly', label: 'Achromatomaly (Partial)' },
];

export default function Index() {
  const [image, setImage] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [cvdType, setCvdType] = useState<CVDType>('normal');
  const [selectedColor, setSelectedColor] = useState<PaletteColor | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImage(url);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractColors(imageData, 8);
        
        const paletteColors: PaletteColor[] = colors.map(hex => ({
          hex,
          oklch: rgbToOklch(hexToRgb(hex)),
          contrastWhite: getContrastRatio(hex, '#FFFFFF'),
          contrastBlack: getContrastRatio(hex, '#000000'),
        }));
        
        setPalette(paletteColors);
        setSelectedColor(paletteColors[0] || null);
        toast({ title: 'Palette extracted', description: '8 dominant colors found' });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImage(file);
  }, [processImage]);

  const handleCopy = async (color: PaletteColor, index: number, format: 'hex' | 'oklch') => {
    const text = format === 'hex' ? color.hex : oklchToCss(color.oklch);
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
    toast({ title: 'Copied!', description: text });
  };

  const exportPalette = () => {
    const figmaData = {
      name: 'Accessible Color Palette',
      colors: palette.map((c, i) => ({
        name: `Color ${i + 1}`,
        hex: c.hex,
        oklch: oklchToCss(c.oklch),
        accessibility: {
          contrastWhite: c.contrastWhite.toFixed(2),
          contrastBlack: c.contrastBlack.toFixed(2),
          wcagAALarge: c.contrastWhite >= 3 || c.contrastBlack >= 3,
          wcagAA: c.contrastWhite >= 4.5 || c.contrastBlack >= 4.5,
          wcagAAA: c.contrastWhite >= 7 || c.contrastBlack >= 7,
        },
      })),
    };
    
    const blob = new Blob([JSON.stringify(figmaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figma-palette.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'figma-palette.json downloaded' });
  };

  const displayedPalette = palette.map(c => ({
    ...c,
    displayHex: simulateCVD(c.hex, cvdType),
  }));

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Palette className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-on-surface">Accessible Color Palette Generator</h1>
            <p className="text-sm text-on-surface-variant">OKLCH-based extraction with CVD simulation</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Image Upload */}
        <div className="w-[340px] flex-shrink-0 p-4 flex flex-col gap-4 border-r border-outline-variant bg-surface-container-low">
          <div
            className={`flex-1 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer ${
              isDragging ? 'border-primary bg-primary-container/30' : 'border-outline-variant hover:border-primary/50 bg-surface-container'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Uploaded" className="max-w-full max-h-full object-contain rounded-xl" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-container mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-on-container" />
                </div>
                <p className="text-on-surface font-medium mb-1">Drop image here</p>
                <p className="text-on-surface-variant text-sm">or click to browse</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])} />
          </div>

          {/* Live Preview Card */}
          {selectedColor && (
            <div className="rounded-2xl p-4 surface-2 bg-surface-container" style={{ backgroundColor: simulateCVD(selectedColor.hex, cvdType) }}>
              <p className="text-sm font-medium mb-2" style={{ color: selectedColor.contrastWhite > selectedColor.contrastBlack ? '#FFF' : '#000' }}>
                Live Preview
              </p>
              <div className="rounded-xl p-3 bg-surface-container-lowest">
                <p className="text-sm text-on-surface mb-2">Sample text on white</p>
                <button
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{ backgroundColor: selectedColor.hex, color: selectedColor.contrastWhite > selectedColor.contrastBlack ? '#FFF' : '#000' }}
                >
                  Button Example
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Palette Grid */}
        <div className="flex-1 p-4 flex flex-col min-h-0 bg-surface">
          {palette.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
              {displayedPalette.map((color, i) => (
                <div
                  key={i}
                  className={`rounded-2xl surface-2 flex flex-col overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${
                    selectedColor?.hex === color.hex ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''
                  }`}
                  onClick={() => setSelectedColor(palette[i])}
                >
                  <div className="flex-1 min-h-[80px]" style={{ backgroundColor: color.displayHex }} />
                  <div className="p-3 bg-surface-container-high">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-medium text-on-surface">{color.hex}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopy(color, i, 'hex'); }}
                          className="p-1.5 rounded-lg hover:bg-surface-container-highest transition-colors"
                          title="Copy HEX"
                        >
                          {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-on-surface-variant" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-on-surface-variant mb-2 cursor-pointer hover:text-primary break-all leading-relaxed" onClick={(e) => { e.stopPropagation(); handleCopy(color, i, 'oklch'); }}>{oklchToCss(color.oklch)}</p>
                    <div className="flex gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${color.contrastWhite >= 4.5 ? 'bg-primary-container text-primary-on-container' : 'bg-surface-container text-on-surface-variant'}`}>
                        W:{color.contrastWhite.toFixed(1)}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${color.contrastBlack >= 4.5 ? 'bg-primary-container text-primary-on-container' : 'bg-surface-container text-on-surface-variant'}`}>
                        B:{color.contrastBlack.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
                <p className="text-on-surface-variant">Upload an image to extract colors</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <footer className="flex-shrink-0 px-6 py-3 border-t border-outline-variant bg-surface-container-low">
        <div className="flex items-center justify-between">
          {/* CVD Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">{CVD_OPTIONS.find(o => o.value === cvdType)?.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-surface-container-lowest surface-3 overflow-hidden z-50">
                {CVD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setCvdType(opt.value); setDropdownOpen(false); }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-surface-container transition-colors ${
                      cvdType === opt.value ? 'bg-primary-container text-primary-on-container' : 'text-on-surface'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportPalette}
              disabled={palette.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}