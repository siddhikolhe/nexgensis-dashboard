/**
 * DummyJSON is a fake REST API: POST /products/add, PUT /products/:id and
 * DELETE /products/:id all respond with what LOOKS like a successful save,
 * but nothing is actually written on their server. Refetch the same product
 * and your "edit" is gone.
 *
 * To make the app actually FEEL correct (and to have something concrete to
 * demo), we keep a small "overrides" layer in localStorage:
 *   - added:   products created in this browser, prepended to page 1
 *   - edited:  { [id]: partialChanges } merged onto whatever the API returns
 *   - deleted: [ids] filtered out of every list/detail response
 *
 * This is intentionally simple (no real backend / DB) - it's a documented
 * workaround for a fake API, not a production pattern.
 */

const KEY = "productOverrides";

function readOverrides() {
  if (typeof window === "undefined") return { added: [], edited: {}, deleted: [] };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { added: [], edited: {}, deleted: [] };
  } catch {
    return { added: [], edited: {}, deleted: [] };
  }
}

function writeOverrides(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addLocalProduct(product) {
  const data = readOverrides();
  // Fake API ids collide across "added" products (server always returns the
  // next id after 194), so we give locally-added items a negative id to
  // guarantee they never clash with a real product id.
  const localProduct = { ...product, id: -(Date.now()) , isLocal: true };
  data.added = [localProduct, ...data.added];
  writeOverrides(data);
  return localProduct;
}

export function editLocalProduct(id, changes) {
  const data = readOverrides();
  data.edited[id] = { ...(data.edited[id] || {}), ...changes };
  writeOverrides(data);
}

export function deleteLocalProduct(id) {
  const data = readOverrides();
  if (!data.deleted.includes(id)) data.deleted.push(id);
  writeOverrides(data);
}

export function getAddedProducts() {
  return readOverrides().added;
}

// Applies edits + deletions to a list fetched from the API.
export function applyOverridesToList(products) {
  const { edited, deleted } = readOverrides();
  return products
    .filter((p) => !deleted.includes(p.id))
    .map((p) => (edited[p.id] ? { ...p, ...edited[p.id] } : p));
}

// Applies edits/deletion-check to a single product (details page).
export function applyOverridesToOne(product) {
  const { edited, deleted } = readOverrides();
  if (deleted.includes(product.id)) return null;
  return edited[product.id] ? { ...product, ...edited[product.id] } : product;
}

export function findLocalProduct(id) {
  return readOverrides().added.find((p) => p.id === Number(id)) || null;
}
