'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageProvider';
import { api } from '@/lib/api';
import {
  Camera, Upload, X, Loader2, ImageIcon, CheckCircle, AlertTriangle,
  Leaf, ChevronRight
} from 'lucide-react';

// Demo images with deterministic results
const DEMO_IMAGES = [
  {
    name: 'Tomato Early Blight',
    nameHi: 'टमाटर अर्ली ब्लाइट',
    description: 'Brown spots with concentric rings on leaves',
    color: '#d97706',
  },
  {
    name: 'Healthy Tomato Plant',
    nameHi: 'स्वस्थ टमाटर का पौधा',
    description: 'Vibrant green foliage, no disease signs',
    color: '#10b981',
  },
  {
    name: 'Powdery Mildew',
    nameHi: 'पाउडरी मिल्ड्यू',
    description: 'White powdery patches on leaf surfaces',
    color: '#8b5cf6',
  },
];

export default function ScanPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    setError(null);
    setSelectedImage(file);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDemoImage = async (index: number) => {
    // Create a demo image blob
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a distinct pattern per demo image for deterministic hashing
      const colors = ['#8B4513', '#228B22', '#DDA0DD'];
      ctx.fillStyle = colors[index];
      ctx.fillRect(0, 0, 400, 400);

      // Add some patterns
      ctx.fillStyle = index === 1 ? '#32CD32' : '#654321';
      for (let i = 0; i < 20; i++) {
        const x = (i * 73 + index * 137) % 380;
        const y = (i * 97 + index * 211) % 380;
        const r = 5 + (i % 10) * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add text label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Demo: ${DEMO_IMAGES[index].name}`, 200, 380);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `demo-${index + 1}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const scanResult = await api.uploadScan(formData);
      setResult(scanResult as unknown as Record<string, unknown>);

      // Navigate to diagnosis page
      const id = (scanResult as unknown as Record<string, string>)._id || (scanResult as unknown as Record<string, string>).id;
      if (id) {
        router.push(`/diagnosis/${id}`);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis failed. Please check that the backend server is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Crop Disease Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload a photo of your crop leaf for AI diagnosis and weather-aware treatment</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone rounded-2xl p-8 text-center transition-all ${
          dragOver ? 'drag-over' : ''
        } ${imagePreview ? 'border-emerald-500/30' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Selected crop image"
                className="max-w-full max-h-80 rounded-xl mx-auto shadow-xl"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedImage?.name} ({(selectedImage?.size || 0 / 1024).toFixed(0)} KB)
            </p>
          </div>
        ) : (
          <div
            className="py-12 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-primary" />
            </div>
            <p className="text-lg font-medium mb-2">Drag and drop your crop leaf image here</p>
            <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP up to 10MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={20} className="text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      {selectedImage && (
        <button
          onClick={analyzeImage}
          disabled={isAnalyzing}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Camera size={24} />
              Analyze Crop Health
            </>
          )}
        </button>
      )}

      {/* Demo Images */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Try Demo Images</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a sample image to test the diagnosis pipeline</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_IMAGES.map((img, i) => (
            <button
              key={i}
              onClick={() => handleDemoImage(i)}
              className="p-4 rounded-xl bg-card border border-border hover:border-emerald-500/30 transition-all text-left card-hover"
            >
              <div className="w-full h-24 rounded-lg mb-3 flex items-center justify-center" style={{ background: `${img.color}22` }}>
                <ImageIcon size={32} style={{ color: img.color }} />
              </div>
              <p className="text-sm font-medium">{language === 'hi' ? img.nameHi : img.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{img.description}</p>
              <div className="flex items-center gap-1 text-xs text-primary mt-2">
                <span>Select</span>
                <ChevronRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Demo notice */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-4 py-2 rounded-full">
          <Leaf size={12} />
          Demo images produce deterministic results for consistent demonstration
        </span>
      </div>
    </div>
  );
}
