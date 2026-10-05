import mark from "@/assets/dypol-logo.png"

export function Logo({ className = "size-8", alt = "" }: { className?: string; alt?: string }) {
  return (
    <img
      src={mark}
      alt={alt}
      width={128}
      height={128}
      draggable={false}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  )
}
