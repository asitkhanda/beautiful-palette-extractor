import { ColorSwatch } from './ColorSwatch';

interface ColorPaletteProps {
  colors: string[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)] flex-1 flex flex-col">
        <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
          Generated OKLCH Palette
        </h2>
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {colors.map((color, index) => (
            <ColorSwatch key={index} color={color} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}