/**
 * G-TEC Computer Education - Tripunithura Campus
 * Core Interactions, Dynamic Components, and Full-Stack APIs
 */

function initAll() {
  initNavbar();
  initMobileExperience();
  initStatsCounters();
  initHeroVideo();
  initHeroEventLinks();
  initHeroGalleryCarousel();
  initCoursesGrid();
  initCourseModal();
  initQuizAdvisor();
  initFaqAccordion();
  initEnquiryModal();
  initContactForms();
  initScrollEffects();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

/* -------------------------------------------------------------
   Navigation & Mobile Menu
------------------------------------------------------------- */
function initNavbar() {
  const header = document.querySelector('.main-header');
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.navbar-nav');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  if (toggleBtn && navMenu) {
    // 1. Mobile Backdrop Dimmer
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      document.body.appendChild(backdrop);
    }

    const updateToggleIcon = (isOpen) => {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        if (isOpen) {
          icon.className = 'fa-solid fa-xmark';
        } else {
          icon.className = 'fa-solid fa-bars';
        }
      }
    };

    const closeMenu = () => {
      navMenu.classList.remove('open');
      backdrop.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      updateToggleIcon(false);
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      navMenu.classList.add('open');
      backdrop.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      updateToggleIcon(true);
      document.body.classList.add('menu-open');
    };

    backdrop.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
    });

    // 2. Close Button inside Mobile Drawer
    if (!navMenu.querySelector('.mobile-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'mobile-close-btn';
      closeBtn.setAttribute('aria-label', 'Close navigation menu');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });
      navMenu.prepend(closeBtn);
    }

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking anywhere outside of the drawer & toggle button
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open')) {
        if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
          closeMenu();
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
      }
    });

    // Close menu on navigation, or toggle dropdowns
    const allLinks = navMenu.querySelectorAll('a.nav-link, a.dropdown-item');
    allLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          if (link.parentElement.classList.contains('has-dropdown')) {
            e.preventDefault();
            e.stopPropagation();
            link.parentElement.classList.toggle('dropdown-open');
          } else {
            closeMenu();
          }
        }
      });
    });
  }
}

/* -------------------------------------------------------------
   Native Mobile App Bottom Bar & Quick Actions
------------------------------------------------------------- */
function initMobileExperience() {
  if (document.querySelector('.mobile-bottom-bar')) return;

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  
  const bottomBar = document.createElement('nav');
  bottomBar.className = 'mobile-bottom-bar';
  bottomBar.setAttribute('aria-label', 'Mobile Quick Actions');
  bottomBar.innerHTML = `
    <a href="/" class="bottom-bar-item ${currentPath === '/' ? 'active' : ''}">
      <i class="fa-solid fa-house"></i>
      <span>Home</span>
    </a>
    <a href="/courses" class="bottom-bar-item ${currentPath.includes('/courses') ? 'active' : ''}">
      <i class="fa-solid fa-book-open"></i>
      <span>Courses</span>
    </a>
    <a href="https://wa.me/918289869975?text=Hi%20G-TEC%20Tripunithura,%20I%20am%20interested%20in%20courses." target="_blank" rel="noopener noreferrer" class="bottom-bar-item whatsapp">
      <i class="fa-brands fa-whatsapp"></i>
      <span>WhatsApp</span>
    </a>
    <a href="tel:+918289869975" class="bottom-bar-item">
      <i class="fa-solid fa-phone"></i>
      <span>Call</span>
    </a>
    <button type="button" class="bottom-bar-item enquiry-btn" onclick="openEnquiryModal('Mobile Bottom Bar')">
      <i class="fa-solid fa-paper-plane"></i>
      <span>Enquire</span>
    </button>
  `;

  document.body.appendChild(bottomBar);
}

/* -------------------------------------------------------------
   Animated Stats Counters
------------------------------------------------------------- */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.counter-val');
  let animated = false;

  const runAnimation = () => {
    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 45));

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        } else {
          el.textContent = current + suffix;
        }
      }, 30);
    });
  };

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          runAnimation();
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }
  } else {
    runAnimation();
  }
}

/* -------------------------------------------------------------
    Hero Event & Examination Links Manager (Above Carousel)
------------------------------------------------------------- */

function getSafeApiUrl(endpoint) {
  const clean = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.protocol === 'file:') {
      return `http://localhost:8080${clean}`;
    }
    const port = window.location.port;
    if (port && port !== '8080' && port !== '80' && port !== '443') {
      const host = window.location.hostname || 'localhost';
      return `http://${host}:8080${clean}`;
    }
  }
  return clean;
}

async function safeBackendFetch(endpoint, options = {}) {
  const targetUrl = getSafeApiUrl(endpoint);

  try {
    const res = await fetch(targetUrl, options);
    if (res && res.ok) return res;
    if (res) return res;
  } catch (e) {
    console.warn('[Network] Direct fetch failed for:', targetUrl);
  }

  // Fallback to relative URL if target was absolute
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    try {
      const clean = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
      const res = await fetch(clean, options);
      if (res) return res;
    } catch (err) {}
  }

  return null;
}
window.safeBackendFetch = safeBackendFetch;
const safeFetchEventApi = safeBackendFetch;

// Global Toast Alert Helper
let gtecToastTimeout = null;
function showGtecToast(message, type = 'success') {
  const toast = document.getElementById('gtecToast');
  const textEl = document.getElementById('gtecToastText');
  const iconEl = document.getElementById('gtecToastIcon');
  if (!toast || !textEl) {
    alert(message);
    return;
  }

  textEl.textContent = message;
  toast.className = `gtec-toast show toast-${type}`;
  if (iconEl) {
    iconEl.className = type === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
  }

  if (gtecToastTimeout) clearTimeout(gtecToastTimeout);
  gtecToastTimeout = setTimeout(() => {
    toast.className = 'gtec-toast';
  }, 4000);
}
window.showGtecToast = showGtecToast;

/* -------------------------------------------------------------
   Hero Event & Examination Links Manager (View-Only Public Display)
   (Links are managed, added & deleted exclusively via the Admin Portal)
------------------------------------------------------------- */
async function initHeroEventLinks() {
  const container = document.getElementById('heroEventLinksBody');
  const countEl = document.getElementById('heroEventLinksCount');
  if (!container) return;

  function renderEventLinks(linksList) {
    const activeLinks = (linksList || []).filter(l => l && l.active !== false);
    if (countEl) countEl.textContent = `${activeLinks.length} Active`;

    if (activeLinks.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 22px 14px; color: var(--text-muted); font-size: 0.85rem; background: #f8fafc; border-radius: var(--radius-md); border: 1px dashed #cbd5e1;">
          <i class="fa-solid fa-calendar-check" style="color: #94a3b8; font-size: 1.6rem; margin-bottom: 8px; display: block;"></i>
          <span style="font-weight: 600; color: #475569;">No active examination or event links right now.</span>
          <p style="font-size: 0.74rem; color: #94a3b8; margin: 4px 0 0;">New examination schedules and placement drives will be announced here.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activeLinks.map(item => {
      const catClass = (item.category || '').toLowerCase().includes('exam') 
        ? 'cat-examination' 
        : ((item.category || '').toLowerCase().includes('event') ? 'cat-event' : 'cat-notice');
        
      const catIcon = (item.category || '').toLowerCase().includes('exam')
        ? 'fa-pen-to-square'
        : ((item.category || '').toLowerCase().includes('event') ? 'fa-calendar-star' : 'fa-bullhorn');

      const cleanTitle = (item.title || '').replace(/"/g, '&quot;');

      return `
        <div class="hero-event-item" id="hero-event-item-${item.id}">
          <div class="hero-event-info">
            <div class="hero-event-tags">
              <span class="hero-event-category-badge ${catClass}">
                <i class="fa-solid ${catIcon}"></i> ${item.category || 'Examination'}
              </span>
              ${item.badgeText ? `
                <span class="hero-event-date">
                  <i class="fa-solid fa-clock"></i> ${item.badgeText}
                </span>
              ` : ''}
            </div>
            <h4 class="hero-event-title" title="${cleanTitle}">
              ${item.title}
            </h4>
            ${item.description ? `<p class="hero-event-desc">${item.description}</p>` : ''}
          </div>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="hero-event-btn" title="Open ${cleanTitle}">
            <span>Open Link</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;
    }).join('');
  }

  // 1. Immediate initial render from cache or fallback scholarship record
  let initialLinks = [];
  const cached = localStorage.getItem('gtec_event_links_cache');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialLinks = parsed.filter(l => l && l.id !== 'EVT-1001' && l.id !== 'EVT-1002');
      }
    } catch (e) {}
  }
  if (initialLinks.length === 0) {
    initialLinks = [{
      id: "EVT-43342",
      title: "G-TEC National Scholarship Exam 2026",
      url: "https://gteceducation.com/scholarship",
      category: "Examination",
      badgeText: "Registrations Open",
      description: "Online scholarship exam with up to 50% fee concession for IT & Accounting.",
      active: true
    }];
  }
  let currentLinksSig = initialLinks.map(l => `${l.id}_${l.title}_${l.active}`).join('|');
  renderEventLinks(initialLinks);

  // 2. Fetch fresh live event links from Supabase Cloud API in background (update only if changed)
  try {
    const res = await safeFetchEventApi('/api/event-links');
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.links)) {
        const fresh = data.links.filter(l => l && l.id !== 'EVT-1001' && l.id !== 'EVT-1002');
        const freshSig = fresh.map(l => `${l.id}_${l.title}_${l.active}`).join('|');
        localStorage.setItem('gtec_event_links_cache', JSON.stringify(fresh));
        if (freshSig !== currentLinksSig) {
          currentLinksSig = freshSig;
          renderEventLinks(fresh);
        }
      }
    }
  } catch (err) {
    console.log('Using local/cached event links...');
  }
}

/* -------------------------------------------------------------
   Hero Gallery Highlights Carousel
------------------------------------------------------------- */
async function initHeroGalleryCarousel() {
  const card = document.getElementById('heroGalleryCard');
  const track = document.getElementById('heroCarouselTrack');
  const prevBtn = document.getElementById('heroCarouselPrev');
  const nextBtn = document.getElementById('heroCarouselNext');
  const progressContainer = document.getElementById('heroNetflixProgress') || document.getElementById('heroCarouselDots');
  const counterEl = document.getElementById('heroCarouselSlideNum');

  if (!card || !track) return;

  let currentIndex = 0;
  let totalSlides = 0;
  const slideDuration = 3500;
  let autoPlayTimer = null;
  let isHovered = false;

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearTimeout(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (totalSlides > 1 && !isHovered) {
      autoPlayTimer = setTimeout(() => {
        updateCarousel(currentIndex + 1, true);
      }, slideDuration);
    }
  }

  function updateCarousel(index, restartTimer = true) {
    if (totalSlides === 0) return;
    currentIndex = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    const slides = track.querySelectorAll('.hero-gallery-slide');
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentIndex);
    });

    if (progressContainer) {
      const segments = progressContainer.querySelectorAll('.netflix-progress-segment');
      segments.forEach((seg, i) => {
        seg.classList.remove('active', 'completed');
        const fill = seg.querySelector('.netflix-progress-fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetWidth;
        }
        if (i < currentIndex) {
          seg.classList.add('completed');
          if (fill) fill.style.animation = '';
        } else if (i === currentIndex) {
          seg.classList.add('active');
          if (fill) fill.style.animation = '';
        }
      });
    }

    if (counterEl) {
      counterEl.textContent = `${currentIndex + 1} / ${totalSlides}`;
    }

    if (restartTimer) {
      startAutoPlay();
    }
  }

  function renderCarousel(items) {
    if (!items || items.length === 0) {
      track.innerHTML = `
        <div class="hero-gallery-loading-placeholder">
          <i class="fa-solid fa-camera"></i> No event highlights yet. Visit our Gallery tab.
        </div>
      `;
      return;
    }

    totalSlides = items.length;
    track.classList.add('netflix-sliding');

    track.innerHTML = items.map((item, idx) => `
      <div class="hero-gallery-slide ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <img src="${item.image}" alt="${(item.title || '').replace(/"/g, '&quot;')}" loading="lazy" onerror="this.src='images/gtec.png'; this.style.objectFit='contain';">
        <div class="hero-gallery-slide-scrim"></div>
        <div class="hero-gallery-slide-meta">
          <span class="hero-gallery-slide-tag"><i class="fa-solid fa-tag"></i> ${item.category}</span>
          <h4 class="hero-gallery-slide-title">${item.title}</h4>
          <div class="hero-gallery-slide-sub">
            <span><i class="fa-regular fa-calendar"></i> ${item.date}</span>
            ${item.caption ? `<span><i class="fa-solid fa-circle-info"></i> ${item.caption.length > 55 ? item.caption.slice(0, 55) + '...' : item.caption}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    if (progressContainer) {
      progressContainer.innerHTML = items.map((_, idx) => `
        <div class="netflix-progress-segment ${idx === 0 ? 'active' : ''}" data-index="${idx}" title="Slide ${idx + 1} of ${items.length}">
          <span class="netflix-progress-fill"></span>
        </div>
      `).join('');
    }

    updateCarousel(0, true);
  }

  // Setup controls once
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      updateCarousel(currentIndex - 1, true);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      updateCarousel(currentIndex + 1, true);
    };
  }

  if (progressContainer) {
    progressContainer.onclick = (e) => {
      const seg = e.target.closest('.netflix-progress-segment');
      if (seg) {
        const idx = parseInt(seg.getAttribute('data-index'), 10);
        updateCarousel(idx, true);
      }
    };
  }

  card.onmouseenter = () => {
    isHovered = true;
    stopAutoPlay();
  };

  card.onmouseleave = () => {
    isHovered = false;
    startAutoPlay();
  };

  let touchStartX = 0;
  let touchEndX = 0;

  card.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  card.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        updateCarousel(currentIndex + 1, true);
      } else {
        updateCarousel(currentIndex - 1, true);
      }
    } else {
      startAutoPlay();
    }
  }, { passive: true });

  // 1. Initial immediate render from local/cached highlights so user NEVER sees stuck loading state
  let initialItems = [];
  if (window.GtecGallery && typeof window.GtecGallery.getLocalItems === 'function') {
    const local = window.GtecGallery.getLocalItems();
    initialItems = local.filter(i => i.isHighlight === true || i.isHighlight === 'true');
    if (initialItems.length === 0) initialItems = local.slice(0, 4);
  }
  if (!initialItems || initialItems.length === 0) {
    if (typeof DEFAULT_GALLERY_ITEMS !== 'undefined') {
      initialItems = DEFAULT_GALLERY_ITEMS.filter(i => i.isHighlight);
    }
  }
  let currentCarouselSig = (initialItems || []).map(i => `${i.id}_${i.title}_${i.image}`).join('|');
  if (initialItems && initialItems.length > 0) {
    renderCarousel(initialItems);
  }

  // 2. Fetch fresh live highlights from Supabase Cloud API in background (update only if changed)
  try {
    if (window.GtecGallery) {
      const freshHighlights = await window.GtecGallery.getHighlights();
      if (freshHighlights && freshHighlights.length > 0) {
        const freshSig = freshHighlights.map(i => `${i.id}_${i.title}_${i.image}`).join('|');
        if (freshSig !== currentCarouselSig) {
          currentCarouselSig = freshSig;
          renderCarousel(freshHighlights);
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching gallery highlights:', err);
  }
}

/* -------------------------------------------------------------
   Courses Rendering, Filtering & Search (Dynamic & Admin Powered)
------------------------------------------------------------- */
async function initCoursesGrid() {
  const container = document.getElementById('coursesContainer');
  if (!container) return;

  const getActiveCourses = () => {
    if (window.coursesData && Array.isArray(window.coursesData) && window.coursesData.length > 0) {
      return window.coursesData;
    }
    if (typeof coursesData !== 'undefined' && Array.isArray(coursesData) && coursesData.length > 0) {
      return coursesData;
    }
    const cached = localStorage.getItem('gtec_courses_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  };

  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('courseSearchInput');
  const heroSearchInput = document.getElementById('heroSearchInput');
  const countBadge = document.getElementById('coursesCount');

  let activeCategory = 'all';
  let searchTerm = '';
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) activeCategory = catParam;
    const searchParam = urlParams.get('search') || urlParams.get('q');
    if (searchParam) {
      searchTerm = searchParam.toLowerCase().trim();
      if (searchInput) searchInput.value = searchParam;
      if (heroSearchInput) heroSearchInput.value = searchParam;
    }
  }

  function syncEnquiryCourseDropdown() {
    const selects = document.querySelectorAll('select[name="course"], #enquiryCourseSelect');
    const courses = getActiveCourses();
    if (!courses || !Array.isArray(courses)) return;
    selects.forEach(sel => {
      const currentVal = sel.value;
      const existingOptions = Array.from(sel.options).map(o => o.value);
      courses.forEach(c => {
        if (!existingOptions.includes(c.title)) {
          const opt = document.createElement('option');
          opt.value = c.title;
          opt.textContent = c.title;
          sel.appendChild(opt);
        }
      });
      if (currentVal) sel.value = currentVal;
    });
  }

  function renderCourses() {
    const list = getActiveCourses();
    let filtered = list.filter(course => {
      const matchesCategory = activeCategory === 'all' || course.category === activeCategory;
      const matchesSearch = !searchTerm || 
        (course.title && course.title.toLowerCase().includes(searchTerm)) || 
        (course.tools && Array.isArray(course.tools) && course.tools.some(t => t.toLowerCase().includes(searchTerm))) ||
        (course.shortDesc && course.shortDesc.toLowerCase().includes(searchTerm));
      return matchesCategory && matchesSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} Programs Available`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <i class="fa-solid fa-graduation-cap" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
          <h4 style="font-size: 1.4rem; color: var(--dark); margin-bottom: 8px;">No matching courses found</h4>
          <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 20px;">
            Can't find what you're looking for? Reach out to our Tripunithura student counsellor directly.
          </p>
          <button class="btn btn-primary" onclick="openEnquiryModal('General Course Enquiry')">Ask Counsellor</button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(course => `
      <div class="course-card" data-id="${course.id}">
        <div class="course-card-corner-shape" aria-hidden="true">
          <svg viewBox="0 0 95 75" width="95" height="75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="56" cy="-5" r="40" fill="var(--gtec-blue, #003D8C)" />
            <circle cx="97" cy="1" r="39" fill="var(--gtec-red, #E51D24)" />
            <circle cx="95" cy="56" r="16" fill="var(--gtec-blue, #003D8C)" />
            <circle cx="66" cy="48" r="12" fill="#FFFFFF" />
          </svg>
        </div>
        <div class="course-card-header">
          <span class="course-category-badge">${course.categoryName || 'Training Program'}</span>
          <h3 class="course-card-title">${course.title}</h3>
          <p class="course-card-desc">${course.shortDesc || ''}</p>
        </div>
        
        <div class="course-meta">
          <div class="course-meta-item">
            <i class="fa-regular fa-clock"></i>
            <span>${(course.duration || '3 Months').split('(')[0]}</span>
          </div>
          <div class="course-meta-item">
            <i class="fa-solid fa-star" style="color: #f59e0b;"></i>
            <span>${course.rating || '4.9'} (${course.reviewsCount || '50'}+)</span>
          </div>
        </div>

        ${course.customFields && Array.isArray(course.customFields) && course.customFields.length > 0 ? `
          <div class="custom-fields-meta-row" style="margin-top: 10px;">
            ${course.customFields.slice(0, 3).map(f => `
              <span class="custom-field-pill" title="${f.label}: ${f.value}">
                <strong>${f.label}:</strong> ${f.value}
              </span>
            `).join('')}
          </div>
        ` : ''}

        <div class="course-tools-wrapper">
          <div class="course-tools-title">Tools & Frameworks</div>
          <div class="tools-pill-group">
            ${(course.tools || []).slice(0, 5).map(tool => `<span class="tool-pill">${tool}</span>`).join('')}
            ${(course.tools || []).length > 5 ? `<span class="tool-pill">+${course.tools.length - 5} more</span>` : ''}
          </div>
        </div>

        <div class="course-card-footer">
          <button class="btn-details" onclick="openCourseDetails('${course.id}')">
            Syllabus & Details <i class="fa-solid fa-arrow-right"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="openEnquiryModal('${(course.title || '').replace(/'/g, "\\'")}')">
            Enquire
          </button>
        </div>
      </div>
    `).join('');
  }

  filterBtns.forEach(btn => {
    if (activeCategory !== 'all' && btn.getAttribute('data-filter') === activeCategory) {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      renderCourses();
    };
  });

  if (searchInput) {
    searchInput.oninput = (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      renderCourses();
    };
  }

  if (heroSearchInput) {
    heroSearchInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchTerm = heroSearchInput.value.toLowerCase().trim();
        const catalogEl = document.getElementById('coursesCatalog');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        if (searchInput) searchInput.value = heroSearchInput.value;
        renderCourses();
      }
    };
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    if (heroSearchBtn) {
      heroSearchBtn.onclick = () => {
        searchTerm = heroSearchInput.value.toLowerCase().trim();
        const catalogEl = document.getElementById('coursesCatalog');
        if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        if (searchInput) searchInput.value = heroSearchInput.value;
        renderCourses();
      };
    }
  }

  // 1. Render immediately so user NEVER sees stuck loading text!
  renderCourses();
  syncEnquiryCourseDropdown();

  // 2. Fetch fresh courses from Supabase Cloud in background (only re-render if data differs)
  try {
    const res = await safeBackendFetch('/api/courses');
    if (res && res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.courses) && data.courses.length > 0) {
        const currentList = getActiveCourses();
        const isIdentical = currentList.length === data.courses.length &&
          currentList.every((c, i) => c.id === data.courses[i].id && c.title === data.courses[i].title);

        window.coursesData = data.courses;
        if (typeof coursesData !== 'undefined') {
          try { coursesData = data.courses; } catch (e) {}
        }
        localStorage.setItem('gtec_courses_cache', JSON.stringify(data.courses));

        if (!isIdentical) {
          renderCourses();
          syncEnquiryCourseDropdown();
        }
      }
    }
  } catch (err) {
    console.warn('Courses API offline, using local catalog...');
  }
}

/* -------------------------------------------------------------
   Course Details Modal
------------------------------------------------------------- */
function initCourseModal() {
  const modal = document.getElementById('courseDetailModal');
  const closeBtn = document.getElementById('closeCourseModal');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

window.openCourseDetails = function(courseId) {
  let allCourses = (window.coursesData && Array.isArray(window.coursesData) && window.coursesData.length > 0)
    ? window.coursesData
    : (typeof coursesData !== 'undefined' && Array.isArray(coursesData) && coursesData.length > 0 ? coursesData : []);
  if (!allCourses || allCourses.length === 0) {
    try {
      const cached = localStorage.getItem('gtec_courses_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) allCourses = parsed;
      }
    } catch (e) {}
  }
  if (!allCourses || allCourses.length === 0) return;
  const course = allCourses.find(c => c.id === courseId);
  if (!course) return;

  const modal = document.getElementById('courseDetailModal');
  const titleEl = document.getElementById('modalCourseTitle');
  const catEl = document.getElementById('modalCourseCategory');
  const descEl = document.getElementById('modalCourseDesc');
  const durationEl = document.getElementById('modalCourseDuration');
  const modeEl = document.getElementById('modalCourseMode');
  const eligEl = document.getElementById('modalCourseElig');
  const syllabusList = document.getElementById('modalCourseSyllabus');
  const toolsList = document.getElementById('modalCourseTools');
  const careersList = document.getElementById('modalCourseCareers');
  const certsList = document.getElementById('modalCourseCerts');
  const whatsappBtn = document.getElementById('modalCourseWhatsapp');
  const enquireBtn = document.getElementById('modalCourseEnquireBtn');

  if (titleEl) titleEl.textContent = course.title;
  if (catEl) catEl.textContent = course.categoryName;
  if (descEl) descEl.textContent = course.description;
  if (durationEl) durationEl.textContent = course.duration;
  if (modeEl) modeEl.textContent = course.mode;
  if (eligEl) eligEl.textContent = course.eligibility;

  if (syllabusList) {
    const list = Array.isArray(course.syllabus) ? course.syllabus : [];
    syllabusList.innerHTML = list.map(mod => `
      <li style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px; font-size: 0.92rem; color: var(--text-main);">
        <i class="fa-solid fa-circle-check" style="color: var(--primary); margin-top: 4px;"></i>
        <span>${mod}</span>
      </li>
    `).join('');
  }

  if (toolsList) {
    const list = Array.isArray(course.tools) ? course.tools : [];
    toolsList.innerHTML = list.map(tool => `
      <span class="tool-pill" style="padding: 5px 12px; font-size: 0.82rem;">${tool}</span>
    `).join('');
  }

  if (careersList) {
    const list = Array.isArray(course.careers) ? course.careers : [];
    careersList.innerHTML = list.map(car => `
      <li style="margin-bottom: 6px; font-size: 0.9rem; color: var(--text-main);">
        <i class="fa-solid fa-briefcase" style="color: var(--secondary); margin-right: 6px;"></i> ${car}
      </li>
    `).join('');
  }

  if (certsList) {
    const list = Array.isArray(course.certifications) ? course.certifications : [];
    certsList.innerHTML = list.map(cert => `
      <span class="badge badge-primary" style="font-size: 0.8rem; margin-right: 6px; margin-bottom: 6px;">${cert}</span>
    `).join('');
  }

  // Render Additional Custom Fields (Added by Admin)
  const customFieldsSec = document.getElementById('modalCourseCustomFieldsSection');
  const customFieldsContainer = document.getElementById('modalCourseCustomFields');
  if (customFieldsSec && customFieldsContainer) {
    if (course.customFields && Array.isArray(course.customFields) && course.customFields.length > 0) {
      customFieldsContainer.innerHTML = course.customFields.map(f => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
          <div style="font-size: 0.72rem; color: #64748b; font-weight: 700; text-transform: uppercase;">${f.label}</div>
          <div style="font-weight: 700; color: #0f172a; font-size: 0.92rem; margin-top: 2px;">${f.value}</div>
        </div>
      `).join('');
      customFieldsSec.style.display = 'block';
    } else {
      customFieldsSec.style.display = 'none';
      customFieldsContainer.innerHTML = '';
    }
  }

  if (whatsappBtn) {
    const text = encodeURIComponent(`Hi G-TEC Tripunithura, I am interested in syllabus and fee details for ${course.title}.`);
    whatsappBtn.href = `https://wa.me/918289869975?text=${text}`;
  }

  if (enquireBtn) {
    enquireBtn.onclick = () => {
      modal.classList.remove('show');
      openEnquiryModal(course.title);
    };
  }

  modal.classList.add('show');
};

/* -------------------------------------------------------------
   Interactive Career Advisor Quiz
------------------------------------------------------------- */
function initQuizAdvisor() {
  const steps = document.querySelectorAll('.quiz-step');
  if (steps.length === 0) return;

  let currentStep = 1;
  let userEducation = '';
  let userGoal = '';

  const showStep = (num) => {
    steps.forEach(s => s.classList.remove('active'));
    const target = document.querySelector(`.quiz-step[data-step="${num}"]`);
    if (target) target.classList.add('active');
  };

  const eduOptions = document.querySelectorAll('.quiz-option-card[data-type="edu"]');
  eduOptions.forEach(card => {
    card.addEventListener('click', () => {
      eduOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      userEducation = card.getAttribute('data-val');
      document.getElementById('quizNext1').disabled = false;
    });
  });

  const next1 = document.getElementById('quizNext1');
  if (next1) {
    next1.addEventListener('click', () => {
      if (!userEducation) return;
      currentStep = 2;
      showStep(2);
    });
  }

  const goalOptions = document.querySelectorAll('.quiz-option-card[data-type="goal"]');
  goalOptions.forEach(card => {
    card.addEventListener('click', () => {
      goalOptions.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      userGoal = card.getAttribute('data-val');
      document.getElementById('quizSubmit').disabled = false;
    });
  });

  const prev2 = document.getElementById('quizPrev2');
  if (prev2) {
    prev2.addEventListener('click', () => {
      currentStep = 1;
      showStep(1);
    });
  }

  const submitQuiz = document.getElementById('quizSubmit');
  if (submitQuiz) {
    submitQuiz.addEventListener('click', async () => {
      if (!userGoal) return;
      
      // Try backend recommendation API
      try {
        const res = await safeBackendFetch('/api/quiz-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ education: userEducation, goal: userGoal })
        });
        if (res && res.ok) {
          const data = await res.json();
          if (data && data.success && data.recommendation) {
            const rec = data.recommendation;
            const titleEl = document.getElementById('quizRecTitle');
            const descEl = document.getElementById('quizRecDesc');
            const enquireBtn = document.getElementById('quizRecEnquireBtn');
            if (titleEl) titleEl.textContent = rec.title;
            if (descEl) descEl.textContent = rec.reason;
            if (enquireBtn) enquireBtn.onclick = () => openEnquiryModal(rec.title);
          } else {
            fallbackRecommendation(userEducation, userGoal);
          }
        } else {
          fallbackRecommendation(userEducation, userGoal);
        }
      } catch (e) {
        fallbackRecommendation(userEducation, userGoal);
      }

      currentStep = 3;
      showStep(3);
    });
  }

  const restartQuiz = document.getElementById('quizRestart');
  if (restartQuiz) {
    restartQuiz.addEventListener('click', () => {
      userEducation = '';
      userGoal = '';
      eduOptions.forEach(c => c.classList.remove('selected'));
      goalOptions.forEach(c => c.classList.remove('selected'));
      if (next1) next1.disabled = true;
      if (submitQuiz) submitQuiz.disabled = true;
      currentStep = 1;
      showStep(1);
    });
  }

  function fallbackRecommendation(edu, goal) {
    let recCourse = "Python Full Stack Development";
    let desc = "Combines high salary potential in Kochi Infopark with strong international demand.";

    if (goal === 'accounting' || edu === 'commerce') {
      recCourse = "DIA - Diploma in International Accounting & SAP FICO";
      desc = "Includes TallyPrime, GST, Gulf VAT, and SAP FICO for immediate placements in Kerala and GCC.";
    } else if (goal === 'creative') {
      recCourse = "UI/UX Design Master & Motion Graphics";
      desc = "High-growth creative career crafting digital apps, Figma prototypes, and branding assets.";
    } else if (goal === 'gulf') {
      if (edu === 'engineering') {
        recCourse = "Master Diploma in Architectural CADD & BIM (Revit)";
        desc = "In tremendous demand for major construction and consultancy firms across GCC and Bangalore.";
      } else {
        recCourse = "Diploma in International Accounting (GCC VAT & TallyPrime)";
        desc = "Guaranteed pathway to Gulf corporate accounting with practical tax compliance.";
      }
    }

    const titleEl = document.getElementById('quizRecTitle');
    const descEl = document.getElementById('quizRecDesc');
    const enquireBtn = document.getElementById('quizRecEnquireBtn');

    if (titleEl) titleEl.textContent = recCourse;
    if (descEl) descEl.textContent = desc;
    if (enquireBtn) {
      enquireBtn.onclick = () => openEnquiryModal(recCourse);
    }
  }
}

/* -------------------------------------------------------------
   FAQ Accordion
------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* -------------------------------------------------------------
   Quick Enquiry Modal
------------------------------------------------------------- */
function initEnquiryModal() {
  const modal = document.getElementById('enquiryModal');
  const closeBtn = document.getElementById('closeEnquiryModal');
  const triggers = document.querySelectorAll('.trigger-enquiry');

  triggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const course = btn.getAttribute('data-course') || 'General Enquiry';
      openEnquiryModal(course);
    });
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }
}

window.openEnquiryModal = function(courseName = '') {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;

  const select = modal.querySelector('#enquiryCourseSelect, select[name="course"]');
  const hiddenInput = modal.querySelector('#modalCourseHidden, input[name="course"]');

  if (hiddenInput && courseName) {
    hiddenInput.value = courseName;
  }

  if (select && courseName) {
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text.toLowerCase().includes(courseName.toLowerCase()) || 
          select.options[i].value.toLowerCase().includes(courseName.toLowerCase())) {
        select.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found && courseName) {
      const opt = new Option(courseName, courseName, true, true);
      select.add(opt);
    }
  }
  modal.classList.add('show');
};

/* -------------------------------------------------------------
   Contact and Enquiry Forms Submission Handlers (Real Backend API)
------------------------------------------------------------- */
function initContactForms() {
  const submitToBackend = async (form, endpoint) => {
    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;
    }

    try {
      const response = await safeBackendFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj)
      });
      if (response && response.ok) {
        const result = await response.json();

        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }

        if (result.success) {
          showSuccessModal(result.message || 'Thank you! Your submission has been received.', result.enquiryId || result.messageId, dataObj);
          form.reset();
          const enquiryModal = document.getElementById('enquiryModal');
          if (enquiryModal) enquiryModal.classList.remove('show');
        } else {
          alert(result.message || 'Submission error. Please try again.');
        }
      } else {
        throw new Error('Network error or server unavailable');
      }
    } catch (err) {
      // Offline fallback
      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
      alert(`Thank you, ${dataObj.name || 'Student'}!\nYour message for ${dataObj.course || 'Admissions'} has been recorded. Our Tripunithura campus advisor will call you at ${dataObj.phone} shortly.`);
      form.reset();
      const enquiryModal = document.getElementById('enquiryModal');
      if (enquiryModal) enquiryModal.classList.remove('show');
    }
  };

  const mainContactForm = document.getElementById('mainContactForm');
  if (mainContactForm) {
    mainContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToBackend(mainContactForm, '/api/enquiries');
    });
  }

  const modalEnquiryForm = document.getElementById('modalEnquiryForm');
  if (modalEnquiryForm) {
    modalEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToBackend(modalEnquiryForm, '/api/enquiries');
    });
  }

  const popupEnquiryForm = document.getElementById('popupEnquiryForm');
  if (popupEnquiryForm && popupEnquiryForm !== modalEnquiryForm) {
    popupEnquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitToBackend(popupEnquiryForm, '/api/enquiries');
    });
  }
}

function showSuccessModal(message, refId, data) {
  let modal = document.getElementById('feedbackModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedbackModal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const waText = encodeURIComponent(`Hi G-TEC Tripunithura, I just submitted an enquiry for ${data.course || 'a course'} (Ref: ${refId || 'N/A'}).`);
  const waUrl = `https://wa.me/918289869975?text=${waText}`;

  modal.innerHTML = `
    <div class="modal-dialog-box" style="max-width: 500px; text-align: center; padding: 35px 25px;">
      <div style="width: 70px; height: 70px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 2.2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3 style="font-size: 1.6rem; color: var(--dark); margin-bottom: 8px;">Enquiry Submitted!</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;">${message}</p>
      
      ${refId ? `
        <div style="background: var(--bg-subtle); padding: 10px 18px; border-radius: 8px; display: inline-block; margin-bottom: 24px; font-family: monospace; font-weight: 700; color: var(--primary);">
          Application Reference: ${refId}
        </div>
      ` : ''}

      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="${waUrl}" target="_blank" class="btn btn-primary" style="background: #25D366; border-color: #25D366;">
          <i class="fa-brands fa-whatsapp"></i> Chat with Counsellor Now
        </a>
        <button onclick="document.getElementById('feedbackModal').classList.remove('show')" class="btn btn-outline">
          Close
        </button>
      </div>
    </div>
  `;

  modal.classList.add('show');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });
}

/* -------------------------------------------------------------
   Scroll Effects & Floating Actions
------------------------------------------------------------- */
function initScrollEffects() {
  const topBtn = document.getElementById('returnToTop');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        topBtn.classList.add('show');
      } else {
        topBtn.classList.remove('show');
      }
    });

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* -------------------------------------------------------------
   Hero Campus Video Player (Autoplay & Continuous Loop)
------------------------------------------------------------- */
function initHeroVideo() {
  const video = document.getElementById('heroVideo');
  const playToggleBtn = document.getElementById('heroVideoPlayToggle');
  const muteToggleBtn = document.getElementById('heroVideoMuteToggle');
  const fullscreenBtn = document.getElementById('heroVideoFullscreen');
  const videoContainer = document.querySelector('.fullscreen-video-media-wrap') || document.querySelector('.hero-fullscreen-video');
  const scrollDownBtn = document.getElementById('scrollDownBtn');
  const rewatchTourBtn = document.getElementById('rewatchTourBtn');

  if (!video) return;

  video.muted = true;
  video.loop = true;

  const applyPlaybackRate = () => {
    try { video.playbackRate = 0.9; } catch (e) {}
  };

  if (video.readyState >= 1) {
    applyPlaybackRate();
  } else {
    video.addEventListener('loadedmetadata', applyPlaybackRate, { once: true });
  }

  // Attempt automatic video playback
  const startAutoplay = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        applyPlaybackRate();
        updatePlayState(true);
      }).catch(err => {
        updatePlayState(false);

        // Resume on any first user gesture on the page
        const resumeOnGesture = () => {
          video.play().then(() => {
            applyPlaybackRate();
            updatePlayState(true);
          }).catch(() => {});
          window.removeEventListener('click', resumeOnGesture);
          window.removeEventListener('touchstart', resumeOnGesture);
          window.removeEventListener('scroll', resumeOnGesture);
        };
        window.addEventListener('click', resumeOnGesture, { once: true, passive: true });
        window.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true });
        window.addEventListener('scroll', resumeOnGesture, { once: true, passive: true });
      });
    }
  };

  startAutoplay();

  function updatePlayState(isPlaying) {
    if (!playToggleBtn) return;
    const icon = playToggleBtn.querySelector('i');
    const label = playToggleBtn.querySelector('.ctrl-label');
    if (isPlaying) {
      if (icon) icon.className = 'fa-solid fa-pause';
      if (label) label.textContent = 'Pause';
      playToggleBtn.setAttribute('aria-label', 'Pause campus video');
      playToggleBtn.setAttribute('title', 'Pause Video');
    } else {
      if (icon) icon.className = 'fa-solid fa-play';
      if (label) label.textContent = 'Play';
      playToggleBtn.setAttribute('aria-label', 'Play campus video');
      playToggleBtn.setAttribute('title', 'Play Video');
    }
  }

  function updateMuteState(isMuted) {
    if (!muteToggleBtn) return;
    const icon = muteToggleBtn.querySelector('i');
    const label = muteToggleBtn.querySelector('.mute-label');
    if (isMuted) {
      if (icon) icon.className = 'fa-solid fa-volume-xmark';
      if (label) label.textContent = 'Muted';
      muteToggleBtn.setAttribute('aria-label', 'Unmute audio');
      muteToggleBtn.setAttribute('title', 'Unmute Audio');
    } else {
      if (icon) icon.className = 'fa-solid fa-volume-high';
      if (label) label.textContent = 'Sound On';
      muteToggleBtn.setAttribute('aria-label', 'Mute audio');
      muteToggleBtn.setAttribute('title', 'Mute Audio');
    }
  }

  if (playToggleBtn) {
    playToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (video.paused) {
        video.play().then(() => updatePlayState(true)).catch(() => {});
      } else {
        video.pause();
        updatePlayState(false);
      }
    });
  }

  if (muteToggleBtn) {
    muteToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      updateMuteState(video.muted);
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
  }

  // Smooth scroll down to overview data when clicking scroll prompt
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const overviewSection = document.getElementById('heroOverview');
      if (overviewSection) {
        overviewSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Smooth scroll back up to video when clicking rewatch button
  if (rewatchTourBtn) {
    rewatchTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSection = document.getElementById('heroVideoSection');
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth' });
        if (video.paused) {
          video.play().catch(() => {});
        }
      }
    });
  }

  // Clicking on the video itself toggles play/pause
  if (videoContainer) {
    videoContainer.addEventListener('click', (e) => {
      if (e.target.closest('.fullscreen-video-controls') || e.target.closest('.fullscreen-scroll-prompt')) return;
      if (video.paused) {
        video.play().then(() => updatePlayState(true)).catch(() => {});
      } else {
        video.pause();
        updatePlayState(false);
      }
    });
  }

  video.addEventListener('play', () => updatePlayState(true));
  video.addEventListener('pause', () => updatePlayState(false));
  video.addEventListener('volumechange', () => updateMuteState(video.muted));
}

