import { useEffect, useState } from 'react';
import { Sprout } from 'lucide-react';
export function ProductImage({ src, alt, className = '', eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false); useEffect(() => setFailed(false), [src]);
  return src && !failed ? <img src={src} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" width="600" height="600" onError={() => setFailed(true)}/> : <div className={`image-placeholder ${className}`} role="img" aria-label={`${alt} — photograph coming soon`}><Sprout strokeWidth={1} size={42}/><span>Photo coming soon</span></div>;
}
