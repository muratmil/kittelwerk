'use client';
import { useState } from 'react';
import ProductImage from '@/components/atoms/ProductImage';

// Coklu görsel galerisi — product.gallery varsa thumbnail'li galeri,
// yoksa standart ProductImage (hover'da backImage) gösterir.
export default function ProductGallery({ product }) {
  const images = product.gallery;
  const [active, setActive] = useState(0);

  if (!images || images.length < 2) {
    return <ProductImage src={product.image} backSrc={product.backImage} alt={product.name} />;
  }

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden border-2 border-ink bg-paper">
        <img
          src={images[active].src}
          alt={`${product.name} — ${images[active].label}`}
          className="w-full h-full object-contain mix-blend-multiply scale-90 transition-all duration-300"
        />
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setActive(i)}
            title={img.label}
            className={`relative aspect-square overflow-hidden border-2 transition-all bg-paper
              ${active === i ? 'border-tomato shadow-brutalist' : 'border-ink/30 hover:border-ink'}`}
          >
            <img
              src={img.src}
              alt={`${product.name} — ${img.label}`}
              loading="lazy"
              className="w-full h-full object-contain mix-blend-multiply scale-90"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
