export default function ProductImage({ src, alt }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden border-2 border-ink bg-paper group">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain mix-blend-multiply scale-90 group-hover:scale-95 transition-transform duration-500"
      />
    </div>
  );
}
