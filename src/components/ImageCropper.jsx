import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function ImageCropper({ image, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl m-4 flex flex-col h-[80vh]">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md text-on-surface">Crop Thumbnail</h3>
          <button onClick={onCancel} type="button" className="text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
        
        <div className="relative flex-1 bg-black/90">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 5}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-low flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-1/2 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">zoom_out</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full accent-primary"
            />
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">zoom_in</span>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-6 py-2.5 bg-surface-container-highest text-on-surface rounded-xl font-label-md font-semibold hover:bg-outline-variant/40 transition-all">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:opacity-90 transition-all shadow-md">
              Save Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Canvas extraction utility
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg', 0.9);
}
