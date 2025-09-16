import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { hexToRgb, rgbToOklch, oklchToCss } from '@/utils/oklchUtils';

interface ColorSwatchProps {
  color: string;
  index: number;
}

export function ColorSwatch({ color, index }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);
  const [copyFormat, setCopyFormat] = useState<'hex' | 'oklch'>('hex');

  // Convert hex to OKLCH for display
  const rgb = hexToRgb(color);
  const oklch = rgbToOklch(rgb);
  const oklchString = oklchToCss(oklch);

  const getCurrentValue = () => {
    return copyFormat === 'hex' ? color : oklchString;
  };

  const copyToClipboard = async () => {
    const valueToCopy = getCurrentValue();
    try {
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      toast({
        title: "Color copied!",
        description: `${valueToCopy} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy color to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleFormat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopyFormat(prev => prev === 'hex' ? 'oklch' : 'hex');
  };

  return (
    <div className="group">
      <div
        className="w-full aspect-square rounded-lg shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[var(--shadow-color)] relative overflow-hidden"
        style={{ backgroundColor: color }}
        onClick={copyToClipboard}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <button 
          onClick={toggleFormat}
          className="text-sm font-mono text-foreground font-medium hover:text-primary transition-colors cursor-pointer"
        >
          {getCurrentValue()}
        </button>
        <p className="text-xs text-muted-foreground mt-1">
          Color {index + 1} • Click to toggle {copyFormat === 'hex' ? 'OKLCH' : 'HEX'}
        </p>
      </div>
    </div>
  );
}