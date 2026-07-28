import React from 'react';
import { Share2 } from 'lucide-react';

const SHARE_TEXT = encodeURIComponent(
  "Je soutiens la campagne de santé  BOUANE Ô DOUMAINTANG (16-23 août 2026, ASSERES). Rejoignez le mouvement :"
);

export default function ShareButton({ url }) {
  const shareUrl = `https://wa.me/?text=${SHARE_TEXT}%20${encodeURIComponent(url || window.location.href)}`;
  return (
    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="share-btn">
      <Share2 size={15} strokeWidth={2.2} /> Partager sur WhatsApp
    </a>
  );
}
