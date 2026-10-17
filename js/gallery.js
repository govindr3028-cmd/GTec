/**
 * G-TEC Computer Education - Tripunithura Campus
 * Gallery & Carousel Highlight Data Manager
 * Supports Express REST API with seamless LocalStorage offline fallback & real-time sync.
 */

const DEFAULT_GALLERY_ITEMS = [
  {
    id: "GAL-43644",
    title: "GZoom",
    category: "Campus Life",
    date: "January 2026",
    image: "images/gallery/upload-1792219243642.jpg",
    caption: "Campus activities and live project development at G-TEC Tripunithura.",
    isHighlight: true,
    createdAt: "2026-10-17T06:40:43.644+00:00"
  },
  {
    id: "GAL-1001",
    title: "Annual Tech Hackathon & Coding Conclave",
    category: "Workshops & Tech",
    date: "March 2026",
    image: "images/gallery/tech-hackathon.jpg",
    caption: "Students collaborating on Python Full Stack and AI models in the high-speed campus computer lab.",
    isHighlight: true,
    createdAt: "2026-03-15T10:00:00.000Z"
  },
  {
    id: "GAL-1002",
    title: "Infopark Campus Placement & Offer Letters",
    category: "Placements",
    date: "February 2026",
    image: "images/gallery/placement-day.jpg",
    caption: "Proud graduates celebrating confirmed offer letters from prominent Kochi Infopark and multinational firms.",
    isHighlight: true,
    createdAt: "2026-02-20T11:30:00.000Z"
  },
  {
    id: "GAL-1003",
    title: "Traditional Onam Cultural Celebrations",
    category: "Campus Life",
    date: "September 2025",
    image: "images/gallery/onam-celebration.jpg",
    caption: "Students and faculty coming together in traditional Kasavu attire around an elaborate floral pookkalam.",
    isHighlight: true,
    createdAt: "2025-09-12T09:15:00.000Z"
  },
  {
    id: "GAL-1004",
    title: "Annual Convocation & Merit Award Ceremony",
    category: "Convocations",
    date: "January 2026",
    image: "images/gallery/annual-convocation.jpg",
    caption: "Honoring course toppers, certified accountants, and software engineers with global G-TEC credentials.",
    isHighlight: true,
    createdAt: "2026-01-18T14:00:00.000Z"
  },
  {
    id: "GAL-1005",
    title: "National Quality Education Award",
    category: "Awards & Milestones",
    date: "November 2025",
    image: "images/gallery/excellence-awards.jpg",
    caption: "G-TEC recognized for unmatched excellence in skill development and hands-on professional education.",
    isHighlight: false,
    createdAt: "2025-11-05T16:45:00.000Z"
  },
  {
    id: "GAL-1006",
    title: "Industry Mentor & Corporate Faculty Meet",
    category: "Workshops & Tech",
    date: "December 2025",
    image: "images/gallery/faculty-merit.jpg",
    caption: "Senior technical consultants reviewing emerging AI, SAP FICO, and Revit BIM industry course modules.",
    isHighlight: false,
    createdAt: "2025-12-10T10:30:00.000Z"
  },
  {
    id: "GAL-1007",
    title: "State-of-the-Art Software & BIM Computer Labs",
    category: "Campus Life",
    date: "January 2026",
    image: "images/gallery/smart-classrooms.webp",
    caption: "Spacious, air-conditioned labs equipped with modern workstations and licensed design software.",
    isHighlight: false,
    createdAt: "2026-01-08T08:30:00.000Z"
  }
];

const GtecGallery = {
  storageKey: 'gtec_gallery_items_v2',

  getLocalItems() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    // Initialize with default items
    this.saveLocalItems(DEFAULT_GALLERY_ITEMS);
    return [...DEFAULT_GALLERY_ITEMS];
  },

  saveLocalItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  },

  async fetchApi(endpoint, options = {}) {
    if (typeof window.safeBackendFetch === 'function') {
      return window.safeBackendFetch(endpoint, options);
    }
    const clean = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const port = window.location.port;
    const isLocalDevPort = port && port !== '8080' && port !== '80' && port !== '443';
    const host = window.location.hostname || 'localhost';
    const targetUrl = isLocalDevPort ? `http://${host}:8080${clean}` : clean;

    try {
      const res = await fetch(targetUrl, options);
      if (res && res.ok) return res;
      if (res) return res;
    } catch (e) {}

    if (isLocalDevPort) {
      try {
        const res = await fetch(clean, options);
        if (res) return res;
      } catch (e) {}
    }

    return null;
  },

  async getAll() {
    try {
      const res = await this.fetchApi('/api/gallery', { cache: 'no-cache' });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          this.saveLocalItems(data.items);
          return data.items;
        }
      }
    } catch (e) {
      // Offline or Live Server fallback
    }
    return this.getLocalItems();
  },

  async getHighlights() {
    const all = await this.getAll();
    const highlights = all.filter(item => item.isHighlight === true);
    // If no highlights set, fallback to the first 4 items
    return highlights.length > 0 ? highlights : all.slice(0, 4);
  },

  async add(item) {
    let newItem = null;
    try {
      const res = await this.fetchApi('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.item) {
          newItem = data.item;
        }
      }
    } catch (e) {
      console.warn('Backend add offline fallback:', e);
    }

    if (!newItem) {
      newItem = {
        id: `GAL-${Date.now().toString().slice(-5)}`,
        title: item.title || 'Campus Event',
        category: item.category || 'Campus Life',
        date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        image: item.image,
        caption: item.caption || '',
        isHighlight: item.isHighlight === true || item.isHighlight === 'true',
        createdAt: new Date().toISOString()
      };
    }

    const current = this.getLocalItems();
    current.unshift(newItem);
    this.saveLocalItems(current);
    return newItem;
  },

  async update(id, updates) {
    let updatedItem = null;
    try {
      const res = await this.fetchApi(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.item) {
          updatedItem = data.item;
        }
      }
    } catch (e) {
      console.warn('Backend update offline fallback:', e);
    }

    const current = this.getLocalItems();
    const idx = current.findIndex(i => i.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveLocalItems(current);
      return current[idx];
    }
    return updatedItem;
  },

  async delete(id) {
    try {
      await this.fetchApi(`/api/gallery/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Backend delete offline fallback:', e);
    }

    const current = this.getLocalItems();
    const filtered = current.filter(i => i.id !== id);
    this.saveLocalItems(filtered);
    return true;
  },

  async toggleHighlight(id) {
    const current = this.getLocalItems();
    const item = current.find(i => i.id === id);
    if (!item) return null;
    const newHighlightVal = !item.isHighlight;
    return await this.update(id, { isHighlight: newHighlightVal });
  }
};

window.GtecGallery = GtecGallery;
