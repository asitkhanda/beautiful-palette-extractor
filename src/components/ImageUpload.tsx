import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
}

export function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelect(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5 shadow-[var(--shadow-glow)]'
            : 'border-border hover:border-primary/50 hover:bg-primary/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            {isDragging ? (
              <ImageIcon className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Upload an Image
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop an image here, or click to select
            </p>
            <Button
              onClick={openFileDialog}
              variant="gradient"
              size="lg"
              className="min-w-[160px]"
            >
              Select Image
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}