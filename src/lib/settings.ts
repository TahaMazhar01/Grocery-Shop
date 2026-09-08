import { z } from 'zod';
import type { StoreConfig } from '../types';
export function isHTTPS(value:string){try{const url=new URL(value);return url.protocol==='https:'&&!!url.hostname&&!url.username&&!url.password;}catch{return false;}}
export function isLocalPath(value:string){return /^\/(?!\/)/.test(value)&&!/[\\\s]/.test(value);}
const image=z.string().refine(v=>v===''||isHTTPS(v)||isLocalPath(v),'Use a valid HTTPS URL or a local /images/ path.');
const color=z.string().regex(/^#[a-f\d]{6}$/i);
export const settingsSchema=z.object({
 brand:z.string().trim().min(1).max(100),tagline:z.string(),currency:z.string().regex(/^[A-Z]{3}$/),locale:z.string().min(2),
 whatsapp:z.string().refine(v=>v===''||/^[1-9]\d{6,14}$/.test(v),'Use country code and digits only for WhatsApp.'),email:z.union([z.literal(''),z.email()]),
 serviceArea:z.string(),siteUrl:z.string().refine(v=>v===''||isHTTPS(v),'Website address must be a valid HTTPS URL.'),demo:z.boolean(),announcement:z.string(),deliveryNote:z.string(),
 colors:z.object({green:color,cream:color,accent:color}),fonts:z.object({display:z.string().min(1),body:z.string().min(1)}),
 navigation:z.array(z.object({label:z.string().min(1),href:z.string().refine(isLocalPath,'Navigation links must start with a single /.')})),
 sections:z.object({categories:z.boolean(),featured:z.boolean(),editorial:z.boolean(),collections:z.boolean(),faq:z.boolean()}),
 hero:z.object({eyebrow:z.string(),title:z.string().min(1),italicTitle:z.string(),description:z.string(),image,revealImage:image,editorialImage:image.optional(),brushFadeMs:z.number().min(200).max(6000)}),
});
export function validateSettings(value:unknown):StoreConfig{const parsed=settingsSchema.parse(value);new Intl.NumberFormat(parsed.locale,{style:'currency',currency:parsed.currency}).format(0);if(!parsed.demo&&(!parsed.whatsapp||!parsed.siteUrl||!parsed.serviceArea))throw new Error('Add a WhatsApp number, website address, and confirmed service area before turning off demo mode.');return parsed;}
