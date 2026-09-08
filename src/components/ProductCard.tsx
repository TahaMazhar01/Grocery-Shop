import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Check, ChevronDown } from 'lucide-react';
import type { Product, SearchItem } from '../types';
import { useStore } from '../context';
import { canBuy, optionFor } from '../lib/catalog';
import { ProductImage } from './Image';
export function ProductCard({ product: p, index = 0 }: { product: Product | SearchItem; index?: number }) {
  const { add, favorites, toggleFavorite, format, meta } = useStore(); const [variant, setVariant] = useState(p.variants[0]?.id ?? ''); const [added, setAdded] = useState(false); const option = optionFor(p,variant || null)!; const available = canBuy(option);
  function addItem() { add(p,variant||null); setAdded(true); setTimeout(()=>setAdded(false),1800); }
  return <article className="product-card" style={{'--card-color':['#f0eee5','#edf0e5','#f0e8dc','#f4efdf'][index%4]} as React.CSSProperties}>
    <div className="product-visual"><Link to={`/product/${p.slug}`} aria-label={`View ${p.title}`}><ProductImage src={option.image || p.image} alt={p.imageAlt || p.title}/></Link><button className={`favorite-button ${favorites.includes(p.id)?'selected':''}`} onClick={()=>toggleFavorite(p.id)} aria-label={`${favorites.includes(p.id)?'Remove':'Save'} ${p.title} ${favorites.includes(p.id)?'from':'to'} favourites`} aria-pressed={favorites.includes(p.id)}><Heart size={18}/></button>{!available && <span className="product-badge">Back another day</span>}{p.featured&&available&&index===0&&<span className="product-badge">A kitchen favourite</span>}</div>
    <div className="product-kicker">{meta.categories.find(c=>c.id===p.category)?.name}</div><Link className="product-title" to={`/product/${p.slug}`}>{p.title}</Link>
    <div className="product-unit">{p.variants.length?<div className="variant-select"><select aria-label={`Pack size for ${p.title}`} value={variant} onChange={e=>setVariant(e.target.value)}>{p.variants.map(v=><option value={v.id} key={v.id}>{v.label}</option>)}</select><ChevronDown size={12}/></div>:p.unit}</div>
    <div className="product-bottom"><span className="product-price">{format(option.price)}{p.compareAtPrice&&p.compareAtPrice>option.price?<del>{format(p.compareAtPrice)}</del>:null}</span><button className={`add-button ${added?'added':''}`} disabled={!available} aria-label={`Add ${p.title} to basket`} onClick={addItem}>{added?<Check size={19}/>:<Plus size={20}/>}</button></div>
  </article>;
}
