export default function ProductImage({ src, backSrc, alt }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden border-2 border-ink bg-paper group">
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain mix-blend-multiply scale-90 transition-all duration-500 ${backSrc ? 'group-hover:opacity-0 group-hover:scale-95' : 'group-hover:scale-95'}`}
      />
      {backSrc && (
        <img
          src={backSrc}
          alt={`${alt} Rückseite`}
          className="absolute inset-0 w-full h-full object-contain mix-blend-multiply scale-95 opacity-0 group-hover:opacity-100 transition-all duration-500"
        />
      )}
    </div>
  );
}
