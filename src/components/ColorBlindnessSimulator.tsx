import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ColorBlindnessType = 'original' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface ColorBlindnessSimulatorProps {
  value: ColorBlindnessType;
  onChange: (value: ColorBlindnessType) => void;
}

export function ColorBlindnessSimulator({ value, onChange }: ColorBlindnessSimulatorProps) {
  return (
    <div className="w-full max-w-xs">
      <label className="block text-sm font-medium text-foreground mb-2">
        Accessibility View
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select view type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="original">Original Palette</SelectItem>
          <SelectItem value="protanopia">Protanopia Simulation</SelectItem>
          <SelectItem value="deuteranopia">Deuteranopia Simulation</SelectItem>
          <SelectItem value="tritanopia">Tritanopia Simulation</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}