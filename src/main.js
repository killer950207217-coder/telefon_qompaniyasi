import { PHONES_CATALOG, formatUZS } from "./data/phones.js";
import { sendOrderToTelegram } from "./telegram.js";

/**
 * ==========================================================================
 * 3D Interactive Smartphone Stage Controller (Mouse + Touch + Inertia)
 * ==========================================================================
 */
class Phone3DStage {
  constructor(viewportEl, assemblyEl, sheenEl, shadowEl, options = {}) {
    this.viewportEl = viewportEl;
    this.assemblyEl = assemblyEl;
    this.sheenEl = sheenEl;
    this.shadowEl = shadowEl;

    this.autoRotate = options.autoRotate ?? true;
    this.rotX = options.initialRotX ?? 8;
    this.rotY = options.initialRotY ?? -22;
    this.targetRotX = this.rotX;
    this.targetRotY = this.rotY;
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.floatPhase = 0;
    this.rafId = null;

    this.bindEvents();
    this.startLoop();
  }

  bindEvents() {
    if (!this.viewportEl) return;

    const onPointerDown = (e) => {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.viewportEl.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.targetRotY += dx * 0.55;
      this.targetRotX = Math.max(-42, Math.min(42, this.targetRotX - dy * 0.45));
    };

    const onPointerUp = (e) => {
      this.isDragging = false;
      this.viewportEl.releasePointerCapture?.(e.pointerId);
    };

    this.viewportEl.addEventListener("pointerdown", onPointerDown);
    this.viewportEl.addEventListener("pointermove", onPointerMove);
    this.viewportEl.addEventListener("pointerup", onPointerUp);
    this.viewportEl.addEventListener("pointercancel", onPointerUp);

    // Keyboard accessibility for 3D rotation
    this.viewportEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.targetRotY -= 25;
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        this.targetRotY += 25;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.targetRotX = Math.min(42, this.targetRotX + 15);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.targetRotX = Math.max(-42, this.targetRotX - 15);
      }
    });
  }

  setAngle(rotX, rotY) {
    this.targetRotX = rotX;
    this.targetRotY = rotY;
  }

  flip180() {
    this.targetRotY += 180;
  }

  setAutoRotate(enabled) {
    this.autoRotate = enabled;
  }

  setFinish(finishId) {
    if (this.assemblyEl) {
      this.assemblyEl.setAttribute("data-finish", finishId);
    }
  }

  startLoop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tick = () => {
      if (this.autoRotate && !this.isDragging && !reducedMotion) {
        this.targetRotY += 0.28;
      }

      // Smooth spring-damping interpolation
      this.rotX += (this.targetRotX - this.rotX) * 0.1;
      this.rotY += (this.targetRotY - this.rotY) * 0.1;
      this.floatPhase += reducedMotion ? 0 : 0.032;

      const floatY = reducedMotion ? 0 : Math.sin(this.floatPhase) * 8;
      const mobileScale = window.innerWidth <= 768 ? 0.88 : 1;

      if (this.assemblyEl) {
        this.assemblyEl.style.transform = `translateY(${floatY.toFixed(2)}px) scale(${mobileScale}) rotateX(${this.rotX.toFixed(2)}deg) rotateY(${this.rotY.toFixed(2)}deg)`;
      }

      if (this.sheenEl) {
        const normalizedY = ((this.rotY % 360) + 360) % 360;
        const shift = ((normalizedY - 180) / 180) * 45;
        this.sheenEl.style.transform = `translateX(${shift.toFixed(1)}%)`;
      }

      if (this.shadowEl) {
        const shadowScale = 1 - floatY * 0.012;
        this.shadowEl.style.transform = `translateX(-50%) scale(${shadowScale.toFixed(3)})`;
      }

      this.rafId = requestAnimationFrame(tick);
    };

    this.rafId = requestAnimationFrame(tick);
  }
}

/**
 * ==========================================================================
 * Application State
 * ==========================================================================
 */
const CART_STORAGE_KEY = "lumen_mobile_cart_v1";

const state = {
  category: "all",
  search: "",
  cart: loadCartFromStorage(),
  inspector: {
    phone: null,
    colorIndex: 0,
    storageIndex: 0,
  },
};

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * ==========================================================================
 * DOM Elements
 * ==========================================================================
 */
const els = {
  // Header & Mobile Nav
  mobileMenuBtn: document.getElementById("mobileMenuBtn"),
  mobileNav: document.getElementById("mobileNav"),
  openCartBtn: document.getElementById("openCartBtn"),
  headerCartCount: document.getElementById("headerCartCount"),

  // Hero 3D Stage
  heroPhoneViewport: document.getElementById("heroPhoneViewport"),
  heroPhone3D: document.getElementById("heroPhone3D"),
  heroGlassSheen: document.getElementById("heroGlassSheen"),
  heroFloorShadow: document.getElementById("heroFloorShadow"),
  heroStageGlow: document.getElementById("heroStageGlow"),
  heroPhoneClock: document.getElementById("heroPhoneClock"),
  flipPhoneBtn: document.getElementById("flipPhoneBtn"),
  autoRotateBtn: document.getElementById("autoRotateBtn"),
  heroInspectBtn: document.getElementById("heroInspectBtn"),
  heroSwatches: document.querySelectorAll(".hero-stage-wrapper .swatch-btn"),

  // Catalog
  productGrid: document.getElementById("productGrid"),
  emptyCatalogState: document.getElementById("emptyCatalogState"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  catalogSearchInput: document.getElementById("catalogSearchInput"),
  filterTabs: document.querySelectorAll(".filter-tab"),

  // 3D Inspector Modal
  inspectorModal: document.getElementById("inspectorModal"),
  closeInspectorBtn: document.getElementById("closeInspectorBtn"),
  mode3dBtn: document.getElementById("mode3dBtn"),
  modePhotoBtn: document.getElementById("modePhotoBtn"),
  inspector3dStage: document.getElementById("inspector3dStage"),
  inspectorPhotoStage: document.getElementById("inspectorPhotoStage"),
  inspectorStudioImg: document.getElementById("inspectorStudioImg"),
  modalPhoneViewport: document.getElementById("modalPhoneViewport"),
  modalPhone3D: document.getElementById("modalPhone3D"),
  modalGlassSheen: document.getElementById("modalGlassSheen"),
  modalScreenImg: document.getElementById("modalScreenImg"),
  modalScreenLabel: document.getElementById("modalScreenLabel"),
  modalBackBrand: document.getElementById("modalBackBrand"),
  angleButtons: document.querySelectorAll(".angle-btn"),
  inspectorMeta: document.getElementById("inspectorMeta"),
  inspectorTitle: document.getElementById("inspectorTitle"),
  inspectorPrice: document.getElementById("inspectorPrice"),
  inspectorDesc: document.getElementById("inspectorDesc"),
  inspectorSelectedColorName: document.getElementById("inspectorSelectedColorName"),
  inspectorColorOptions: document.getElementById("inspectorColorOptions"),
  inspectorStorageOptions: document.getElementById("inspectorStorageOptions"),
  inspectorSpecsList: document.getElementById("inspectorSpecsList"),
  inspectorAddCartBtn: document.getElementById("inspectorAddCartBtn"),
  inspectorBuyNowBtn: document.getElementById("inspectorBuyNowBtn"),

  // Cart & Telegram Checkout Drawer
  cartDrawerBackdrop: document.getElementById("cartDrawerBackdrop"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  cartItemsSection: document.getElementById("cartItemsSection"),
  cartEmptyState: document.getElementById("cartEmptyState"),
  browseFromEmptyBtn: document.getElementById("browseFromEmptyBtn"),
  checkoutForm: document.getElementById("checkoutForm"),
  cartTotalDisplay: document.getElementById("cartTotalDisplay"),
  customerName: document.getElementById("customerName"),
  customerPhone: document.getElementById("customerPhone"),
  customerRegion: document.getElementById("customerRegion"),
  paymentMethod: document.getElementById("paymentMethod"),
  customerAddress: document.getElementById("customerAddress"),
  customerNote: document.getElementById("customerNote"),
  checkoutError: document.getElementById("checkoutError"),
  submitOrderBtn: document.getElementById("submitOrderBtn"),
  orderSuccessBox: document.getElementById("orderSuccessBox"),
  successOrderNumber: document.getElementById("successOrderNumber"),
  successReceipt: document.getElementById("successReceipt"),
  newOrderBtn: document.getElementById("newOrderBtn"),

  // Toast
  toastNotification: document.getElementById("toastNotification"),
};

/**
 * ==========================================================================
 * Initialize 3D Stages
 * ==========================================================================
 */
const heroStage = new Phone3DStage(
  els.heroPhoneViewport,
  els.heroPhone3D,
  els.heroGlassSheen,
  els.heroFloorShadow,
  { autoRotate: true, initialRotX: 8, initialRotY: -22 }
);

const modalStage = new Phone3DStage(
  els.modalPhoneViewport,
  els.modalPhone3D,
  els.modalGlassSheen,
  null,
  { autoRotate: false, initialRotX: 10, initialRotY: -25 }
);

const GLOW_COLORS = {
  titanium: "rgba(185, 178, 165, 0.24)",
  obsidian: "rgba(96, 165, 250, 0.20)",
  cobalt: "rgba(37, 99, 235, 0.34)",
  champagne: "rgba(212, 175, 55, 0.28)",
};

// Update live clock on the 3D Hero phone screen
function updateHeroClock() {
  if (!els.heroPhoneClock) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  els.heroPhoneClock.textContent = `${hh}:${mm}`;
}
updateHeroClock();
setInterval(updateHeroClock, 30000);

// Hero 3D controls
els.heroSwatches.forEach((btn) => {
  btn.addEventListener("click", () => {
    const finish = btn.dataset.finish;
    els.heroSwatches.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    heroStage.setFinish(finish);
    if (els.heroStageGlow && GLOW_COLORS[finish]) {
      els.heroStageGlow.style.background = `radial-gradient(circle, ${GLOW_COLORS[finish]} 0%, transparent 70%)`;
    }
  });
});

els.flipPhoneBtn?.addEventListener("click", () => {
  heroStage.setAutoRotate(false);
  els.autoRotateBtn?.classList.remove("is-active");
  els.autoRotateBtn?.setAttribute("aria-pressed", "false");
  heroStage.flip180();
});

els.autoRotateBtn?.addEventListener("click", () => {
  const next = !heroStage.autoRotate;
  heroStage.setAutoRotate(next);
  els.autoRotateBtn.classList.toggle("is-active", next);
  els.autoRotateBtn.setAttribute("aria-pressed", String(next));
});

els.heroInspectBtn?.addEventListener("click", () => {
  openInspector(PHONES_CATALOG[0].id);
});

/**
 * ==========================================================================
 * Toast Helper
 * ==========================================================================
 */
let toastTimer = null;
function showToast(message) {
  if (!els.toastNotification) return;
  els.toastNotification.textContent = message;
  els.toastNotification.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toastNotification.hidden = true;
  }, 2800);
}

/**
 * ==========================================================================
 * Mobile Navigation
 * ==========================================================================
 */
els.mobileMenuBtn?.addEventListener("click", () => {
  const isHidden = els.mobileNav.hidden;
  els.mobileNav.hidden = !isHidden;
  els.mobileMenuBtn.setAttribute("aria-expanded", String(isHidden));
});

document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    els.mobileNav.hidden = true;
    els.mobileMenuBtn.setAttribute("aria-expanded", "false");
  });
});

/**
 * ==========================================================================
 * Catalog Rendering & 3D Card Tilt Engine
 * ==========================================================================
 */
function attach3DTilt(card) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || window.matchMedia("(hover: none)").matches) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    const rotY = (px - 0.5) * 12;
    const rotX = (0.5 - py) * 10;

    card.style.setProperty("--mouse-x", `${(px * 100).toFixed(1)}%`);
    card.style.setProperty("--mouse-y", `${(py * 100).toFixed(1)}%`);
    card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0px)";
  });
}

function renderCatalog() {
  const query = state.search.trim().toLowerCase();
  const filtered = PHONES_CATALOG.filter((phone) => {
    const matchesCategory = state.category === "all" || phone.category === state.category;
    const matchesSearch =
      !query ||
      phone.name.toLowerCase().includes(query) ||
      phone.brand.toLowerCase().includes(query) ||
      phone.shortSpec.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  els.productGrid.innerHTML = "";
  els.emptyCatalogState.hidden = filtered.length > 0;

  filtered.forEach((phone) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="card-sheen" aria-hidden="true"></div>
      <div class="card-media">
        <img
          src="${phone.image}"
          alt="${phone.name}"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <div class="card-media-fallback" hidden>
          <span>${phone.name}</span>
        </div>
      </div>
      <div class="card-body">
        <p class="card-meta">${phone.brand} · ${phone.category}</p>
        <h3 class="card-title">${phone.name}</h3>
        <p class="card-specs-line">${phone.shortSpec}</p>
        <div class="card-footer-row">
          <span class="card-price tabular-nums">${formatUZS(phone.basePrice)}</span>
          <div class="card-actions">
            <button type="button" class="btn-card-3d" data-action="inspect" data-id="${phone.id}">
              3D Ko'rish
            </button>
            <button type="button" class="btn-card-add" data-action="add" data-id="${phone.id}">
              Savatga
            </button>
          </div>
        </div>
      </div>
    `;

    // Zero-Broken-Image fallback handler
    const img = card.querySelector("img");
    const fallback = card.querySelector(".card-media-fallback");
    img?.addEventListener("error", () => {
      img.hidden = true;
      if (fallback) fallback.hidden = false;
    });

    card.querySelector('[data-action="inspect"]')?.addEventListener("click", () => {
      openInspector(phone.id);
    });

    card.querySelector('[data-action="add"]')?.addEventListener("click", () => {
      addToCart(phone, 0, 0);
      showToast(`${phone.name} savatga qo'shildi`);
    });

    attach3DTilt(card);
    els.productGrid.appendChild(card);
  });
}

els.filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    state.category = tab.dataset.category || "all";
    els.filterTabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle("is-active", active);
      t.setAttribute("aria-selected", String(active));
    });
    renderCatalog();
  });
});

els.catalogSearchInput?.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderCatalog();
});

els.resetFiltersBtn?.addEventListener("click", () => {
  state.category = "all";
  state.search = "";
  if (els.catalogSearchInput) els.catalogSearchInput.value = "";
  els.filterTabs.forEach((t) => {
    const isAll = t.dataset.category === "all";
    t.classList.toggle("is-active", isAll);
    t.setAttribute("aria-selected", String(isAll));
  });
  renderCatalog();
});

/**
 * ==========================================================================
 * Interactive 3D Product Inspector Modal
 * ==========================================================================
 */
function openInspector(phoneId) {
  const phone = PHONES_CATALOG.find((p) => p.id === phoneId);
  if (!phone) return;

  state.inspector = {
    phone,
    colorIndex: 0,
    storageIndex: 0,
  };

  setInspectorMode("3d");
  modalStage.setAngle(10, -25);
  els.angleButtons.forEach((b) => {
    b.classList.toggle("is-active", b.dataset.angle === "hero");
  });

  renderInspectorDetails();
  els.inspectorModal.hidden = false;
  els.inspectorModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeInspector() {
  els.inspectorModal.hidden = true;
  els.inspectorModal.setAttribute("aria-hidden", "true");
  if (els.cartDrawerBackdrop.hidden) {
    document.body.style.overflow = "";
  }
}

function setInspectorMode(mode) {
  const is3D = mode === "3d";
  els.mode3dBtn.classList.toggle("is-active", is3D);
  els.modePhotoBtn.classList.toggle("is-active", !is3D);
  els.inspector3dStage.hidden = !is3D;
  els.inspectorPhotoStage.hidden = is3D;
}

function renderInspectorDetails() {
  const { phone, colorIndex, storageIndex } = state.inspector;
  if (!phone) return;

  const selectedColor = phone.colors[colorIndex];
  const selectedStorage = phone.storages[storageIndex];
  const finalPrice = phone.basePrice + selectedStorage.delta;

  els.inspectorMeta.textContent = `${phone.brand} · ${phone.category} · Sotuvda mavjud`;
  els.inspectorTitle.textContent = phone.name;
  els.inspectorPrice.textContent = formatUZS(finalPrice);
  els.inspectorDesc.textContent = phone.description;
  els.inspectorSelectedColorName.textContent = selectedColor.name;

  // Update 3D model & studio image
  modalStage.setFinish(selectedColor.id);
  els.modalScreenImg.src = phone.image;
  els.modalScreenImg.alt = phone.name;
  els.modalScreenLabel.textContent = phone.name.toUpperCase();
  els.modalBackBrand.textContent = phone.brand;
  els.inspectorStudioImg.src = phone.image;
  els.inspectorStudioImg.alt = phone.name;

  // Color swatches
  els.inspectorColorOptions.innerHTML = "";
  phone.colors.forEach((color, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `swatch-btn ${idx === colorIndex ? "is-active" : ""}`;
    btn.setAttribute("aria-label", color.name);
    btn.title = color.name;
    btn.innerHTML = `<span class="swatch-color" style="background:${color.hex}"></span>`;
    btn.addEventListener("click", () => {
      state.inspector.colorIndex = idx;
      renderInspectorDetails();
    });
    els.inspectorColorOptions.appendChild(btn);
  });

  // Storage buttons
  els.inspectorStorageOptions.innerHTML = "";
  phone.storages.forEach((storage, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `storage-btn ${idx === storageIndex ? "is-active" : ""}`;
    btn.textContent = storage.label;
    btn.addEventListener("click", () => {
      state.inspector.storageIndex = idx;
      renderInspectorDetails();
    });
    els.inspectorStorageOptions.appendChild(btn);
  });

  // Specs table
  els.inspectorSpecsList.innerHTML = "";
  Object.entries(phone.specs).forEach(([key, val]) => {
    const row = document.createElement("div");
    row.className = "spec-row";
    row.innerHTML = `<dt>${key}</dt><dd>${val}</dd>`;
    els.inspectorSpecsList.appendChild(row);
  });
}

els.closeInspectorBtn?.addEventListener("click", closeInspector);
els.inspectorModal?.addEventListener("click", (e) => {
  if (e.target === els.inspectorModal) closeInspector();
});

els.mode3dBtn?.addEventListener("click", () => setInspectorMode("3d"));
els.modePhotoBtn?.addEventListener("click", () => setInspectorMode("photo"));

els.angleButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    els.angleButtons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const angle = btn.dataset.angle;
    if (angle === "front") modalStage.setAngle(0, 0);
    else if (angle === "side") modalStage.setAngle(0, -82);
    else if (angle === "back") modalStage.setAngle(4, 180);
    else modalStage.setAngle(10, -25);
  });
});

els.inspectorAddCartBtn?.addEventListener("click", () => {
  const { phone, colorIndex, storageIndex } = state.inspector;
  if (!phone) return;
  addToCart(phone, colorIndex, storageIndex);
  closeInspector();
  showToast(`${phone.name} savatga qo'shildi`);
});

els.inspectorBuyNowBtn?.addEventListener("click", () => {
  const { phone, colorIndex, storageIndex } = state.inspector;
  if (!phone) return;
  addToCart(phone, colorIndex, storageIndex);
  closeInspector();
  openCartDrawer();
});

/**
 * ==========================================================================
 * Shopping Cart & Telegram Checkout Drawer
 * ==========================================================================
 */
function addToCart(phone, colorIndex = 0, storageIndex = 0) {
  const color = phone.colors[colorIndex] || phone.colors[0];
  const storage = phone.storages[storageIndex] || phone.storages[0];
  const unitPrice = phone.basePrice + storage.delta;
  const key = `${phone.id}__${color.id}__${storage.label}`;

  const existing = state.cart.find((item) => item.key === key);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      key,
      phoneId: phone.id,
      name: phone.name,
      image: phone.image,
      colorId: color.id,
      colorName: color.name,
      storage: storage.label,
      unitPrice,
      quantity: 1,
    });
  }

  saveCartToStorage();
  renderCartUI();
}

function updateCartQuantity(key, delta) {
  const item = state.cart.find((i) => i.key === key);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((i) => i.key !== key);
  }
  saveCartToStorage();
  renderCartUI();
}

function removeFromCart(key) {
  state.cart = state.cart.filter((i) => i.key !== key);
  saveCartToStorage();
  renderCartUI();
}

function getCartTotals() {
  return state.cart.reduce(
    (acc, item) => {
      acc.count += item.quantity;
      acc.amount += item.unitPrice * item.quantity;
      return acc;
    },
    { count: 0, amount: 0 }
  );
}

function renderCartUI() {
  const { count, amount } = getCartTotals();
  els.headerCartCount.textContent = String(count);

  const isEmpty = state.cart.length === 0;
  els.cartEmptyState.hidden = !isEmpty || !els.orderSuccessBox.hidden;
  els.checkoutForm.hidden = isEmpty || !els.orderSuccessBox.hidden;
  els.cartItemsSection.hidden = isEmpty || !els.orderSuccessBox.hidden;

  els.cartItemsSection.innerHTML = "";
  state.cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item-row";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" referrerpolicy="no-referrer" />
      <div class="cart-item-info">
        <div class="cart-item-top">
          <h4 class="cart-item-title">${item.name}</h4>
          <button type="button" class="cart-remove-btn" aria-label="${item.name} o'chirish">O'chirish</button>
        </div>
        <span class="cart-item-variant">${item.colorName} · ${item.storage}</span>
        <div class="cart-item-bottom">
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-op="dec" aria-label="Kamaytirish">-</button>
            <span class="qty-val tabular-nums">${item.quantity}</span>
            <button type="button" class="qty-btn" data-op="inc" aria-label="Ko'paytirish">+</button>
          </div>
          <span class="cart-item-subtotal tabular-nums">${formatUZS(item.unitPrice * item.quantity)}</span>
        </div>
      </div>
    `;

    row.querySelector('[data-op="dec"]')?.addEventListener("click", () => updateCartQuantity(item.key, -1));
    row.querySelector('[data-op="inc"]')?.addEventListener("click", () => updateCartQuantity(item.key, 1));
    row.querySelector(".cart-remove-btn")?.addEventListener("click", () => removeFromCart(item.key));

    els.cartItemsSection.appendChild(row);
  });

  els.cartTotalDisplay.textContent = formatUZS(amount);
}

function openCartDrawer() {
  els.orderSuccessBox.hidden = true;
  els.checkoutError.hidden = true;
  renderCartUI();
  els.cartDrawerBackdrop.hidden = false;
  els.cartDrawerBackdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
  els.cartDrawerBackdrop.hidden = true;
  els.cartDrawerBackdrop.setAttribute("aria-hidden", "true");
  if (els.inspectorModal.hidden) {
    document.body.style.overflow = "";
  }
}

els.openCartBtn?.addEventListener("click", openCartDrawer);
els.closeCartBtn?.addEventListener("click", closeCartDrawer);
els.cartDrawerBackdrop?.addEventListener("click", (e) => {
  if (e.target === els.cartDrawerBackdrop) closeCartDrawer();
});

els.browseFromEmptyBtn?.addEventListener("click", () => {
  closeCartDrawer();
  document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
});

els.newOrderBtn?.addEventListener("click", () => {
  els.orderSuccessBox.hidden = true;
  closeCartDrawer();
});

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!els.inspectorModal.hidden) closeInspector();
    if (!els.cartDrawerBackdrop.hidden) closeCartDrawer();
  }
});

/**
 * ==========================================================================
 * Checkout Form Submission -> Automatic Telegram Channel Dispatch
 * ==========================================================================
 */
function showCheckoutError(msg) {
  els.checkoutError.textContent = msg;
  els.checkoutError.hidden = false;
}

els.checkoutForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  els.checkoutError.hidden = true;

  if (state.cart.length === 0) {
    showCheckoutError("Savatingiz bo'sh. Avval smartfon tanlang.");
    return;
  }

  const name = els.customerName.value.trim();
  const phone = els.customerPhone.value.trim();
  const region = els.customerRegion.value;
  const paymentMethod = els.paymentMethod.value;
  const address = els.customerAddress.value.trim();
  const note = els.customerNote.value.trim();

  if (name.length < 2) {
    showCheckoutError("Iltimos, ism va familiyangizni to'g'ri kiriting.");
    els.customerName.focus();
    return;
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) {
    showCheckoutError("Iltimos, amaldagi telefon raqamingizni kiriting (masalan: +998 90 123 45 67).");
    els.customerPhone.focus();
    return;
  }

  if (address.length < 4) {
    showCheckoutError("Iltimos, yetkazib berish manzilini kiriting.");
    els.customerAddress.focus();
    return;
  }

  const { amount } = getCartTotals();
  const orderId = `LM-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const createdAt = now.toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const orderPayload = {
    orderId,
    createdAt,
    totalAmount: amount,
    items: state.cart.map((item) => ({ ...item })),
    customer: {
      name,
      phone,
      region,
      address,
      paymentMethod,
      note,
    },
  };

  // Loading state
  const originalBtnText = els.submitOrderBtn.textContent;
  els.submitOrderBtn.disabled = true;
  els.submitOrderBtn.textContent = "Telegramga yuborilmoqda...";

  try {
    await sendOrderToTelegram(orderPayload);

    // Clear cart & show receipt
    state.cart = [];
    saveCartToStorage();
    els.checkoutForm.reset();

    els.cartItemsSection.hidden = true;
    els.checkoutForm.hidden = true;
    els.cartEmptyState.hidden = true;
    els.orderSuccessBox.hidden = false;

    els.successOrderNumber.textContent = `Buyurtma #${orderId}`;
    els.successReceipt.innerHTML = `
      <div><strong>Mijoz:</strong> ${name}</div>
      <div><strong>Telefon:</strong> ${phone}</div>
      <div><strong>Manzil:</strong> ${region}, ${address}</div>
      <div><strong>To'lov:</strong> ${paymentMethod}</div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
        <strong>Jami summa:</strong> ${formatUZS(amount)}
      </div>
    `;

    els.headerCartCount.textContent = "0";
    showToast("Buyurtma Telegram kanaliga yuborildi!");
  } catch (err) {
    showCheckoutError(
      `Buyurtmani Telegramga yuborishda xatolik yuz berdi: ${err.message}. Bot kanalga admin qilib qo'shilganini tekshiring.`
    );
  } finally {
    els.submitOrderBtn.disabled = false;
    els.submitOrderBtn.textContent = originalBtnText;
  }
});

// Initial render
renderCatalog();
renderCartUI();
