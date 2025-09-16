import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type ColorBlindnessType = 
  | 'original' 
  | 'protanopia' 
  | 'protanomaly'
  | 'deuteranopia' 
  | 'deuteranomaly'
  | 'tritanopia'
  | 'tritanomaly'
  | 'achromatopsia'
  | 'achromatomaly';

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
          <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
          <SelectItem value="protanomaly">Protanomaly (Red-weak)</SelectItem>
          <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
          <SelectItem value="deuteranomaly">Deuteranomaly (Green-weak)</SelectItem>
          <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
          <SelectItem value="tritanomaly">Tritanomaly (Blue-weak)</SelectItem>
          <SelectItem value="achromatopsia">Achromatopsia (Complete)</SelectItem>
          <SelectItem value="achromatomaly">Achromatomaly (Partial)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}