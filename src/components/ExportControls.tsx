import { Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { hexToRgb, rgbToOklch, oklchToCss } from '@/utils/oklchUtils';

interface ExportControlsProps {
  colors: string[];
}

export function ExportControls({ colors }: ExportControlsProps) {
  const exportAsHex = async () => {
    if (colors.length === 0) {
      toast({
        title: "No colors to export",
        description: "Please generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const hexString = colors.join(', ');
    try {
      await navigator.clipboard.writeText(hexString);
      toast({
        title: "HEX codes copied!",
        description: "All color codes copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy HEX codes to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportAsOKLCH = async () => {
    if (colors.length === 0) {
      toast({
        title: "No colors to export",
        description: "Please generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const oklchStrings = colors.map(color => {
      const rgb = hexToRgb(color);
      const oklch = rgbToOklch(rgb);
      return oklchToCss(oklch);
    });
    
    const oklchString = oklchStrings.join(', ');
    try {
      await navigator.clipboard.writeText(oklchString);
      toast({
        title: "OKLCH codes copied!",
        description: "All OKLCH color codes copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy OKLCH codes to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportAsDesignJSON = () => {
    if (colors.length === 0) {
      toast({
        title: "No colors to export",
        description: "Please generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const designColors = colors.map((color, index) => {
      const rgb = hexToRgb(color);
      const oklch = rgbToOklch(rgb);
      return {
        name: `Color ${index + 1}`,
        hex: color,
        oklch: oklchToCss(oklch),
        rgb: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b
        },
        figmaRgb: {
          r: rgb.r / 255,
          g: rgb.g / 255,
          b: rgb.b / 255,
        }
      };
    });

    const designJSON = {
      name: "a11y OKLCH Palette",
      description: "Accessible color palette with OKLCH values extracted from image",
      format: "OKLCH + HEX + RGB",
      colors: designColors,
      metadata: {
        extractedAt: new Date().toISOString(),
        totalColors: colors.length,
        colorSpace: "OKLCH"
      }
    };

    const blob = new Blob([JSON.stringify(designJSON, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'a11y-oklch-palette.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Design JSON downloaded!",
      description: "OKLCH palette saved as JSON file",
    });
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button
        onClick={exportAsHex}
        variant="outline"
        size="sm"
        className="min-w-[140px]"
      >
        <Copy className="h-3 w-3" />
        Copy HEX
      </Button>
      <Button
        onClick={exportAsOKLCH}
        variant="outline"
        size="sm"
        className="min-w-[140px]"
      >
        <Copy className="h-3 w-3" />
        Copy OKLCH
      </Button>
      <Button
        onClick={exportAsDesignJSON}
        variant="outline"
        size="sm"
        className="min-w-[140px]"
      >
        <Download className="h-3 w-3" />
        Export JSON
      </Button>
    </div>
  );
}