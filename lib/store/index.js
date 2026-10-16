// Storage adapter used by PortalApp. M2: memory only — the same serialized blob the prototype
// wrote to localStorage ('dg-dd-portal-v1': { cases, users, periods, session }) and the partner
// file contents it wrote to IndexedDB, held for the life of the browser tab and never written to
// browser storage. M5 replaces this with Supabase tables, M6 with Supabase Storage.
let blob = null;
const files = new Map();

export const portalStore = {
  read: () => blob,
  write: (json) => { blob = json; },
  clear: () => { blob = null; },
  putFile: async (id, file) => { files.set(id, file); },
  getFile: async (id) => files.get(id) || null,
  deleteFile: (id) => { files.delete(id); },
};
