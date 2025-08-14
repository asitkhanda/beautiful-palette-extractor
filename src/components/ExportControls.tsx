import { Download, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

  const exportAsFigmaJSON = () => {
    if (colors.length === 0) {
      toast({
        title: "No colors to export",
        description: "Please generate a palette first",
        variant: "destructive",
      });
      return;
    }

    const figmaColors = colors.map((color, index) => ({
      name: `Color ${index + 1}`,
      hex: color,
      rgb: hexToRgb(color),
    }));

    const figmaJSON = {
      name: "Extracted Color Palette",
      description: "Color palette extracted from image",
      colors: figmaColors,
    };

    const blob = new Blob([JSON.stringify(figmaJSON, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-palette.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Figma JSON downloaded!",
      description: "Color palette saved as JSON file",
    });
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0, g: 0, b: 0 };
  };

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        onClick={exportAsHex}
        variant="export"
        size="lg"
        className="min-w-[180px]"
      >
        <Copy className="h-4 w-4" />
        Export as HEX Codes
      </Button>
      <Button
        onClick={exportAsFigmaJSON}
        variant="export"
        size="lg"
        className="min-w-[180px]"
      >
        <Download className="h-4 w-4" />
        Export as Figma JSON
      </Button>
    </div>
  );
}