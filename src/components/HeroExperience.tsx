import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Pause, Play, Plus, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context';
import { ProductImage } from './Image';
import { WhatsAppIcon } from './Layout';
import { readLocal, writeLocal } from '../lib/files';
import { canBuy, whatsappLink } from '../lib/catalog';

export function Hero() {
  const { config, home, format, add } = useStore();
  const root = useRef<HTMLElement>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(() => readLocal('mb-motion-paused', false));
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [added, setAdded] = useState('');
  const motion = !paused && !reduced;
  const picks = home.filter(p => p.active && p.image).slice(0, 3);
  const contact = whatsappLink(config.whatsapp, `Hello ${config.brand}! I'd like to ask about your groceries.`);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'paused';
    writeLocal('mb-motion-paused', paused);
  }, [motion, paused]);

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    let visible = true;
    const draw = () => {
      frame = 0;
      node.style.setProperty('--scene-x', `${x}px`);
      node.style.setProperty('--scene-y', `${y}px`);
    };
    const move = (event: PointerEvent) => {
      if (!motion || event.pointerType === 'touch') return;
      const bounds = node.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width - .5) * 14;
      y = ((event.clientY - bounds.top) / bounds.height - .5) * 10;
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const reset = () => { x = 0; y = 0; if (!frame) frame = requestAnimationFrame(draw); };
    const updateVisibility = () => { node.dataset.visible = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateVisibility(); });
    observer.observe(node);
    reset();
    document.addEventListener('visibilitychange', updateVisibility);
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', reset);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', reset);
    };
  }, [motion]);

  return <section className="daily-hero" ref={root} data-visible="true" data-motion={motion ? 'on' : 'off'} aria-labelledby="daily-hero-title">
    <div className="daily-stage">
      <div className="daily-scene">
        <img className="daily-hero-photo" src={config.hero.image} alt="A paper grocery bag filled with colourful vegetables and bread, with citrus and avocado on the table" width="1536" height="1024" fetchPriority="high" />
      </div>
      <div className="daily-content section-shell">
        <div className="daily-copy">
          <p className="daily-kicker"><span /><span>{config.hero.eyebrow}</span></p>
          <h1 id="daily-hero-title"><span>{config.hero.title}</span><em>{config.hero.italicTitle}</em></h1>
          <p className="daily-description">{config.hero.description}</p>
          <div className="daily-actions">
            <Link to="/shop" className="daily-shop">Explore the shop <span><ArrowUpRight size={22} /></span></Link>
            {contact ? <a className="daily-contact" href={contact} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={19} /> Ask us on WhatsApp</a> : <Link to="/contact" className="daily-contact">Ask us a question <ArrowRight size={17} /></Link>}
          </div>
          <div className="daily-shelf-links"><Link to="/category/vegetables">Fresh produce</Link><span> / </span><Link to="/category/bakery">Daily bread</Link><span> / </span><Link to="/category/pantry">Pantry favourites</Link></div>
        </div>
        <div className="daily-note" aria-hidden="true"><Sprout size={21} /><span>Good food.<br /><em>Everyday joy.</em></span></div>
        <button className="daily-motion" aria-label={paused ? 'Play animation' : 'Pause animation'} aria-pressed={!paused} disabled={reduced} onClick={() => setPaused(value => !value)}>{reduced || paused ? <Play size={14} /> : <Pause size={14} />}<span>{reduced ? 'Reduced motion' : paused ? 'Motion paused' : 'Pause motion'}</span></button>
      </div>
    </div>
    {picks.length > 0 && <div className="daily-picks section-shell">
      <div className="daily-picks-heading"><span>START WITH SOMETHING GOOD</span><h2>A few favourites.</h2><Link to="/shop">Meet the whole market <ArrowRight size={15} /></Link></div>
      {picks.map(product => {
        const variant = product.variants[0];
        const unavailable = !canBuy(variant ?? product);
        return <article className="daily-pick" key={product.id}>
          <Link to={`/product/${product.slug}`}><ProductImage src={product.image} alt={product.title} /><div><span>{product.title}</span><small>{product.unit}</small><strong>{format(product.price)}</strong></div></Link>
          <button className={added === product.id ? 'is-added' : ''} disabled={unavailable} aria-label={unavailable ? `${product.title} is unavailable` : `Add ${product.title} from hero picks`} onClick={() => {
            add(product, variant?.id);
            setAdded(product.id);
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
            feedbackTimer.current = setTimeout(() => setAdded(''), 1600);
          }}>{added === product.id ? <Check size={18} /> : <Plus size={18} />}</button>
        </article>;
      })}
    </div>}
    <span className="sr-only" role="status">{added ? 'Added to your basket.' : ''}</span>
  </section>;
}
