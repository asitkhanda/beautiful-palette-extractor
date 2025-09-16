import { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { ColorPalette } from '@/components/ColorPalette';
import { ColorBlindnessSimulator, ColorBlindnessType } from '@/components/ColorBlindnessSimulator';
import { ExportControls } from '@/components/ExportControls';
import { extractColorsFromImage, ColorPalette as ColorPaletteType } from '@/utils/colorExtraction';
import { simulateColorBlindness } from '@/utils/colorBlindness';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [originalColors, setOriginalColors] = useState<string[]>([]);
  const [displayedColors, setDisplayedColors] = useState<string[]>([]);
  const [colorBlindnessType, setColorBlindnessType] = useState<ColorBlindnessType>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handleImageSelect = async (imageUrl: string) => {
    setIsProcessing(true);
    setUploadedImage(imageUrl);
    
    try {
      const palette = await extractColorsFromImage(imageUrl, 8);
      const hexColors = palette.map(p => p.hex);
      setOriginalColors(hexColors);
      setDisplayedColors(hexColors);
      setColorBlindnessType('original');
      
      toast({
        title: "OKLCH Palette generated!",
        description: `Extracted ${palette.length} perceptually uniform colors from your image`,
      });
    } catch (error) {
      toast({
        title: "Error processing image",
        description: "Could not extract colors from the image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleColorBlindnessChange = (type: ColorBlindnessType) => {
    setColorBlindnessType(type);
    const simulatedColors = simulateColorBlindness(originalColors, type);
    setDisplayedColors(simulatedColors);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Compact Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Palette className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-foreground">a11y Palette Extractor</h1>
              <p className="text-xs text-muted-foreground">OKLCH + Accessibility Focused</p>
            </div>
          </div>
        </div>
      </header>

      {/* Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - Controls */}
        <div className="w-1/2 p-6 flex flex-col space-y-6 overflow-y-auto">
          {/* Hero Section */}
          <section className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Perceptually Uniform Colors</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Extract Accessible OKLCH Palettes
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload any image and generate perceptually uniform OKLCH colors with comprehensive accessibility simulation.
            </p>
          </section>

          {/* Image Upload */}
          <section className="flex-shrink-0">
            <ImageUpload onImageSelect={handleImageSelect} />
            {isProcessing && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center space-x-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm">Extracting OKLCH colors...</span>
                </div>
              </div>
            )}
          </section>

          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <section className="flex-shrink-0">
              <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-semibold text-foreground mb-3">Source Image</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded for color extraction" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Color Blindness Simulator */}
          {displayedColors.length > 0 && (
            <section className="flex-shrink-0">
              <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)]">
                <ColorBlindnessSimulator 
                  value={colorBlindnessType} 
                  onChange={handleColorBlindnessChange} 
                />
              </div>
            </section>
          )}

          {/* Export Controls */}
          {displayedColors.length > 0 && (
            <section className="flex-shrink-0">
              <div className="bg-card rounded-lg p-4 shadow-[var(--shadow-card)]">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Export Options</h3>
                <ExportControls colors={displayedColors} />
              </div>
            </section>
          )}
        </div>

        {/* Right Pane - Results */}
        <div className="w-1/2 p-6 border-l border-border/50 flex flex-col">
          {displayedColors.length > 0 ? (
            <div className="flex-1 flex flex-col">
              <ColorPalette colors={displayedColors} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Upload an Image</h3>
                <p className="text-muted-foreground text-sm">
                  Your OKLCH color palette will appear here once you upload and process an image.
                </p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>OKLCH perceptual uniformity</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-accent"></div>
                    <span>9 color blindness simulations</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span>HEX + OKLCH export formats</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;