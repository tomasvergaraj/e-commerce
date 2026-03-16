import { ChangeEvent, useEffect, useState } from 'react';
import { Crop, Image as ImageIcon, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { uploadApi } from '@/api/services';
import { resolveAssetUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 600;
const BANNER_RATIO = OUTPUT_WIDTH / OUTPUT_HEIGHT;

type CropState = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type SelectedImage = {
  objectUrl: string;
  width: number;
  height: number;
  fileName: string;
  type: string;
};

type BannerImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

function getPlacement(image: SelectedImage, crop: CropState) {
  const coverScale = Math.max(OUTPUT_WIDTH / image.width, OUTPUT_HEIGHT / image.height);
  const scaledWidth = image.width * coverScale * crop.zoom;
  const scaledHeight = image.height * coverScale * crop.zoom;
  const maxOffsetX = Math.max(0, (scaledWidth - OUTPUT_WIDTH) / 2);
  const maxOffsetY = Math.max(0, (scaledHeight - OUTPUT_HEIGHT) / 2);
  const offsetX = Math.min(Math.max(crop.offsetX, -maxOffsetX), maxOffsetX);
  const offsetY = Math.min(Math.max(crop.offsetY, -maxOffsetY), maxOffsetY);

  return {
    scaledWidth,
    scaledHeight,
    offsetX,
    offsetY,
    maxOffsetX,
    maxOffsetY,
    left: (OUTPUT_WIDTH - scaledWidth) / 2 + offsetX,
    top: (OUTPUT_HEIGHT - scaledHeight) / 2 + offsetY,
  };
}

function buildPreviewStyle(image: SelectedImage, crop: CropState) {
  const placement = getPlacement(image, crop);

  return {
    width: `${(placement.scaledWidth / OUTPUT_WIDTH) * 100}%`,
    height: `${(placement.scaledHeight / OUTPUT_HEIGHT) * 100}%`,
    left: `${(placement.left / OUTPUT_WIDTH) * 100}%`,
    top: `${(placement.top / OUTPUT_HEIGHT) * 100}%`,
  };
}

async function readSelectedImage(file: File): Promise<SelectedImage> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      img.src = objectUrl;
    });

    return {
      objectUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
      fileName: file.name.replace(/\.[^.]+$/, '') || 'banner',
      type: file.type || 'image/jpeg',
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function dataUrlToFileName(baseName: string, type: string) {
  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  return `${baseName}-banner.${extension}`;
}

async function createCroppedFile(image: SelectedImage, crop: CropState) {
  const placement = getPlacement(image, crop);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('No se pudo preparar el recorte de la imagen.');
  }

  const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo procesar la imagen para recortarla.'));
    img.src = image.objectUrl;
  });

  context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  context.drawImage(
    loadedImage,
    placement.left,
    placement.top,
    placement.scaledWidth,
    placement.scaledHeight,
  );

  const fileType = image.type === 'image/png' || image.type === 'image/webp' ? image.type : 'image/jpeg';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('No se pudo exportar la imagen recortada.'));
        return;
      }
      resolve(result);
    }, fileType, 0.92);
  });

  return new File([blob], dataUrlToFileName(image.fileName, fileType), { type: fileType });
}

export default function BannerImageUploadField({ value, onChange, disabled = false }: BannerImageUploadFieldProps) {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [crop, setCrop] = useState<CropState>({ zoom: 1, offsetX: 0, offsetY: 0 });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage.objectUrl);
      }
    };
  }, [selectedImage]);

  const replaceSelectedImage = (nextImage: SelectedImage | null) => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.objectUrl);
    }
    setSelectedImage(nextImage);
  };

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const nextImage = await readSelectedImage(file);
      replaceSelectedImage(nextImage);
      setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
    } catch (error: any) {
      toast.error(error.message || 'No se pudo abrir la imagen seleccionada.');
    }
  };

  const handleCropChange = (patch: Partial<CropState>) => {
    if (!selectedImage) return;
    const nextCrop = {
      ...crop,
      ...patch,
    };
    const placement = getPlacement(selectedImage, nextCrop);

    setCrop({
      zoom: nextCrop.zoom,
      offsetX: placement.offsetX,
      offsetY: placement.offsetY,
    });
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const croppedFile = await createCroppedFile(selectedImage, crop);
      const response = await uploadApi.uploadImage(croppedFile);
      const payload = (response as any)?.data || response;
      onChange(payload.url);
      replaceSelectedImage(null);
      setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
      toast.success('Imagen subida. Ahora guarda el banner para aplicar el cambio.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo subir la imagen recortada.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetCrop = () => {
    setCrop({ zoom: 1, offsetX: 0, offsetY: 0 });
  };

  const placement = selectedImage ? getPlacement(selectedImage, crop) : null;
  const previewStyle = selectedImage ? buildPreviewStyle(selectedImage, crop) : null;
  const isSmallImage = selectedImage
    ? selectedImage.width < OUTPUT_WIDTH || selectedImage.height < OUTPUT_HEIGHT
    : false;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/70 dark:bg-gray-900/40 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">Imagen del banner</p>
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: 1920 x 600 px, relacion 16:5. Puedes subir una imagen y recortarla antes de guardarla.
            </p>
          </div>
          <label className={`btn-outline inline-flex items-center gap-2 cursor-pointer ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
            <ImageIcon size={16} />
            Seleccionar imagen
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileSelected}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      </div>

      {selectedImage ? (
        <div className="space-y-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Recorte previo</p>
              <p className="text-xs text-gray-500 mt-1">
                Archivo cargado: {selectedImage.width} x {selectedImage.height} px
              </p>
              {isSmallImage && (
                <p className="text-xs text-amber-600 mt-2">
                  Esta imagen es mas pequena que el tamano recomendado. Puede verse menos nitida.
                </p>
              )}
            </div>
            <button type="button" onClick={() => replaceSelectedImage(null)} className="btn-outline px-3 py-2 text-sm">
              <X size={14} className="inline mr-1" />
              Cancelar archivo
            </button>
          </div>

          <div className="rounded-xl overflow-hidden bg-gray-950">
            <div className="relative aspect-[16/5] w-full">
              {selectedImage && previewStyle && (
                <img
                  src={selectedImage.objectUrl}
                  alt="Vista previa del banner"
                  className="absolute max-w-none select-none pointer-events-none"
                  style={previewStyle}
                />
              )}
              <div className="absolute inset-0 border border-white/15" />
              <div className="absolute inset-y-0 left-1/3 border-l border-white/10" />
              <div className="absolute inset-y-0 left-2/3 border-l border-white/10" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom</label>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.01"
                value={crop.zoom}
                onChange={(event) => handleCropChange({ zoom: Number(event.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">{crop.zoom.toFixed(2)}x</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Desplazamiento horizontal</label>
              <input
                type="range"
                min={placement ? -placement.maxOffsetX : 0}
                max={placement ? placement.maxOffsetX : 0}
                step="1"
                value={crop.offsetX}
                onChange={(event) => handleCropChange({ offsetX: Number(event.target.value) })}
                className="w-full"
                disabled={!placement || placement.maxOffsetX === 0}
              />
              <p className="text-xs text-gray-500 mt-1">
                {placement && placement.maxOffsetX > 0 ? `${Math.round(crop.offsetX)} px` : 'No necesita ajuste horizontal'}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Desplazamiento vertical</label>
              <input
                type="range"
                min={placement ? -placement.maxOffsetY : 0}
                max={placement ? placement.maxOffsetY : 0}
                step="1"
                value={crop.offsetY}
                onChange={(event) => handleCropChange({ offsetY: Number(event.target.value) })}
                className="w-full"
                disabled={!placement || placement.maxOffsetY === 0}
              />
              <p className="text-xs text-gray-500 mt-1">
                {placement && placement.maxOffsetY > 0 ? `${Math.round(crop.offsetY)} px` : 'No necesita ajuste vertical'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleUpload} disabled={isUploading || disabled} className="btn-primary inline-flex items-center gap-2">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Recortar y subir
            </button>
            <button type="button" onClick={resetCrop} disabled={isUploading} className="btn-outline inline-flex items-center gap-2">
              <RefreshCw size={16} />
              Restablecer recorte
            </button>
          </div>
        </div>
      ) : value ? (
        <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="aspect-[16/5] bg-gray-100 dark:bg-gray-800">
            <img src={resolveAssetUrl(value)} alt="Banner seleccionado" className="w-full h-full object-cover" />
          </div>
          <div className="px-4 py-3 text-xs text-gray-500 flex items-center gap-2">
            <Crop size={14} />
            Imagen lista en el formulario. Si deseas recortar nuevamente, sube un nuevo archivo local.
          </div>
        </div>
      ) : null}
    </div>
  );
}
