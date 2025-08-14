import { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { ColorPalette } from '@/components/ColorPalette';
import { ColorBlindnessSimulator, ColorBlindnessType } from '@/components/ColorBlindnessSimulator';
import { ExportControls } from '@/components/ExportControls';
import { extractColorsFromImage } from '@/utils/colorExtraction';
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
      const colors = await extractColorsFromImage(imageUrl, 8);
      setOriginalColors(colors);
      setDisplayedColors(colors);
      setColorBlindnessType('original');
      
      toast({
        title: "Palette generated!",
        description: `Extracted ${colors.length} colors from your image`,
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-accent">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Color Palette Extractor</h1>
              <p className="text-sm text-muted-foreground">Generate beautiful color palettes from any image</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-primary mb-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">AI-Powered Color Extraction</span>
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Extract Beautiful Color Palettes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload any image and instantly generate a perfect 8-color palette with accessibility features and professional export options.
          </p>
        </section>

        {/* Image Upload */}
        <section>
          <ImageUpload onImageSelect={handleImageSelect} />
          {isProcessing && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center space-x-2 text-primary">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm">Extracting colors...</span>
              </div>
            </div>
          )}
        </section>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <section className="flex justify-center">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold text-foreground mb-3 text-center">Source Image</h3>
              <img
                src={uploadedImage}
                alt="Uploaded image"
                className="w-full rounded-lg shadow-[var(--shadow-card)] max-h-48 object-cover"
              />
            </div>
          </section>
        )}

        {/* Color Blindness Simulator */}
        {originalColors.length > 0 && (
          <section className="flex justify-center">
            <ColorBlindnessSimulator
              value={colorBlindnessType}
              onChange={handleColorBlindnessChange}
            />
          </section>
        )}

        {/* Color Palette */}
        {displayedColors.length > 0 && (
          <section>
            <ColorPalette colors={displayedColors} />
          </section>
        )}

        {/* Export Controls */}
        {originalColors.length > 0 && (
          <section>
            <ExportControls colors={displayedColors} />
          </section>
        )}

        {/* Instructions */}
        {originalColors.length === 0 && !isProcessing && (
          <section className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="font-semibold text-foreground">Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Drop your image or click to select from your device
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="font-semibold text-foreground">Generate Palette</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI extracts 8 dominant colors automatically
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="font-semibold text-foreground">Export & Use</h3>
                <p className="text-sm text-muted-foreground">
                  Copy HEX codes or download Figma-ready JSON
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Built with ❤️ for designers and developers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
