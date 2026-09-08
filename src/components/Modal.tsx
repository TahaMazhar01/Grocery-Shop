import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
export function Modal({ open, onClose, title, children, className = '' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null); const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => { const node = ref.current; if (!node) return; if (open && !node.open) { node.showModal(); document.body.style.overflow = 'hidden'; } else if (!open && node.open) { node.close(); document.body.style.overflow = ''; } return () => { document.body.style.overflow = ''; }; }, [open]);
  return <dialog ref={ref} className={`modal ${className}`} onCancel={e => { e.preventDefault(); closeRef.current(); }} onClick={e => { if (e.target === ref.current) { const box = ref.current.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) onClose(); } }} aria-label={title}><div className="modal-heading"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={22}/></button></div>{open&&children}</dialog>;
}
