import { MAX_PHOTO_BYTES } from '../api/client.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_TO_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

function fileExtension(name = '') {
  const parts = name.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function resolveImageMime(file) {
  if (file.type && file.type.startsWith('image/')) return file.type;
  return EXT_TO_MIME[fileExtension(file.name)] || '';
}

/** Compresse et convertit une image avant envoi (réduit les échecs mobile / Render). */
export async function preparePhotoForUpload(file) {
  if (!file) return null;

  const ext = fileExtension(file.name);
  if (ext === 'heic' || ext === 'heif') {
    throw new Error(
      'Photo iPhone (HEIC) non supportée. Paramètres → Appareil photo → Formats → « Plus compatible » (JPG), ou inscrivez-vous sans photo.',
    );
  }

  const mime = resolveImageMime(file);
  if (!mime) {
    throw new Error('Format non reconnu. Utilisez une photo JPG ou PNG.');
  }

  if (!ALLOWED_TYPES.has(mime)) {
    throw new Error('Format non supporté. Utilisez JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error('La photo dépasse 5 Mo. Choisissez une image plus légère.');
  }

  if (mime === 'image/jpeg' && file.size < 800_000) {
    return new File([file], file.name || 'photo.jpg', { type: 'image/jpeg', lastModified: file.lastModified });
  }

  const compressed = await compressToJpeg(file);
  if (compressed.size > MAX_PHOTO_BYTES) {
    throw new Error('La photo est trop lourde après compression (max 5 Mo).');
  }
  return compressed;
}

function compressToJpeg(file, maxWidth = 1280, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Impossible de traiter cette image. Essayez JPG ou PNG.'));
            return;
          }
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
          resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
        },
        'image/jpeg',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossible de lire cette image. Utilisez JPG ou PNG (pas HEIC).'));
    };

    img.src = url;
  });
}
