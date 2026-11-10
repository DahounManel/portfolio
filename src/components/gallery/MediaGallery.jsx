import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

export default function MediaGallery({ images = [], title = 'Visual evidence' }) {
  const [active, setActive] = useState(null);
  const media = images.filter(Boolean);

  useEffect(() => {
    if (active === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setActive(null);
      if (event.key === 'ArrowRight') setActive((index) => (index + 1) % media.length);
      if (event.key === 'ArrowLeft') setActive((index) => (index - 1 + media.length) % media.length);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [active, media.length]);

  if (!media.length) return <div className="empty-state">No gallery items have been added yet.</div>;

  return (
    <>
      <div className="media-gallery">
        {media.map((src, index) => (
          <button className={`gallery-tile ${index === 0 ? 'gallery-tile-featured' : ''}`} key={`${src}-${index}`} onClick={() => setActive(index)} aria-label={`View image ${index + 1} of ${title}`}>
            <img src={src} alt={`${title} gallery item ${index + 1}`} loading="lazy" />
            <span className="gallery-zoom"><Expand size={16} /></span>
            <span className="gallery-image-number">{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} role="dialog" aria-modal="true" aria-label="Image viewer">
            <button className="lightbox-close" onClick={() => setActive(null)} aria-label="Close image viewer"><X size={22} /></button>
            <button className="lightbox-nav lightbox-prev" onClick={(event) => { event.stopPropagation(); setActive((active - 1 + media.length) % media.length); }} aria-label="Previous image"><ChevronLeft size={25} /></button>
            <motion.img key={media[active]} src={media[active]} alt={`${title} image ${active + 1}`} initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(event) => event.stopPropagation()} />
            <button className="lightbox-nav lightbox-next" onClick={(event) => { event.stopPropagation(); setActive((active + 1) % media.length); }} aria-label="Next image"><ChevronRight size={25} /></button>
            <div className="lightbox-caption">{title} <span>{String(active + 1).padStart(2, '0')} / {String(media.length).padStart(2, '0')}</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
