import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteProps {
  colors: string[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card rounded-lg p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
          Generated Color Palette
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}