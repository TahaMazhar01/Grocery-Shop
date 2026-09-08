import { importRows, parseCSV } from './import';
import { validateCatalog } from './catalog';
self.onmessage = ({ data }) => {
  try {
    if (data.type === 'parse') postMessage({ type: 'parsed', ...parseCSV(data.text) });
    if (data.type === 'validate') postMessage({ type: 'validated', report: importRows(data.rows, data.mapping, data.catalog) });
    if (data.type === 'json') { const parsed = JSON.parse(data.text); postMessage({ type: 'json', catalog: validateCatalog(Array.isArray(parsed) ? { ...data.catalog, products: parsed, collections: [] } : parsed) }); }
  } catch (e) { postMessage({ type: 'error', message: e instanceof Error ? e.message : 'Could not read this file.' }); }
};
