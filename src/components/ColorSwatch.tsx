import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ColorSwatchProps {
  color: string;
  index: number;
}

export function ColorSwatch({ color, index }: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      toast({
        title: "Color copied!",
        description: `${color} copied to clipboard`,
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
        <p className="text-sm font-mono text-foreground font-medium">{color}</p>
        <p className="text-xs text-muted-foreground mt-1">Color {index + 1}</p>
      </div>
    </div>
  );
}