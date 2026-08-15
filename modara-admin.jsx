import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Boxes, FolderKanban, Star,
  Percent, Settings, LogOut, Search, Filter, Plus, Pencil, Archive, RotateCcw,
  Trash2, X, ChevronDown, ImagePlus, Check, AlertTriangle, Menu, ArrowLeft,
  Store, ShieldCheck, Info, ChevronRight, CircleAlert
} from "lucide-react";

/* ============================================================
   THEME — MODARA identity, used sparingly on an internal tool
   ============================================================ */
const C = {
  black: "#111111",
  gold: "#D4AF37",
  goldSoft: "#f4e9c9",
  white: "#ffffff",
  gray: "#F8F8F8",
  line: "#e6e3db",
  muted: "#6f6f6c",
  soft: "#8a8a86",
  danger: "#b3382c",
  dangerBg: "#fbeae7",
  ok: "#2f6d4f",
  okBg: "#e9f4ee",
  warn: "#946200",
  warnBg: "#fdf3df",
};

const STORAGE_KEY = "modara_products_v1";
const SEED_FLAG_KEY = "modara_seeded_v1";
const DEMO_PASSCODE = "modara-admin";

/* ============================================================
   OPTION SETS — aligned to the existing storefront's taxonomy
   ============================================================ */
const GENDERS = ["Men", "Women", "Unisex"];
const MOVEMENTS = ["Automatic", "Mechanical", "Quartz", "Chronograph"];
const STYLES = ["Dress", "Business", "Casual", "Sports", "Luxury-Inspired", "Minimalist", "Skeleton"];
const CATEGORIES = ["Watches", "Gift Sets", "Accessories"];
const COLLECTIONS = ["New Arrivals", "Best Sellers", "Gift Sets", "Limited Edition", "Featured Collection"];
const OCCASIONS = ["Office & Business", "Everyday Wear", "Formal Events", "Wedding", "Gift for Him", "Gift for Her", "Weekend Style", "Luxury Statement Pieces"];
const BRANDS = ["MODARA Heritage", "MODARA Signature", "MODARA Essentials"];
const STATUSES = ["published", "draft", "archived"];

/* ============================================================
   HELPERS
   ============================================================ */
const uid = () => "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const nairaFmt = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
const formatNaira = (n) => (n === "" || n === null || n === undefined || isNaN(n) ? "—" : nairaFmt.format(Number(n)));
const dateFmt = (iso) => { try { return new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }); } catch { return "—"; } };

function watchSVG(seed = 0, ring = C.gold) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" fill="#f1efe9"/>
    <circle cx="50" cy="50" r="30" stroke="#111111" stroke-width="2.2"/>
    <circle cx="50" cy="50" r="24" stroke="${ring}" stroke-width="1"/>
    <rect x="42" y="8" width="16" height="12" rx="3" fill="#111111"/>
    <rect x="42" y="80" width="16" height="12" rx="3" fill="#111111"/>
    <line x1="50" y1="50" x2="50" y2="${34 + (seed % 6)}" stroke="#111111" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="50" y1="50" x2="${62 - (seed % 8)}" y2="50" stroke="#111111" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="50" r="2.4" fill="${ring}"/>
    <rect x="30" y="2" width="40" height="6" rx="3" fill="#e8e4d8"/>
    <rect x="30" y="92" width="40" height="6" rx="3" fill="#e8e4d8"/>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function emptySpecs() {
  return { waterResistance: "", caseMaterial: "", strapMaterial: "", crystal: "", caseSize: "", warranty: "" };
}
function emptyFlags() {
  return { bestSeller: false, newArrival: false, limitedEdition: false, featured: false, giftSet: false };
}
function emptyInventory() {
  return { quantity: 0, trackInventory: true, allowBackorder: false, lowStockThreshold: 5 };
}
function blankProduct() {
  return {
    id: null,
    name: "",
    brand: BRANDS[0],
    sku: "",
    description: "",
    shortDescription: "",
    price: "",
    compareAtPrice: "",
    gender: GENDERS[0],
    category: CATEGORIES[0],
    collection: "",
    style: STYLES[0],
    movement: MOVEMENTS[0],
    occasion: "",
    specs: emptySpecs(),
    images: [],
    status: "draft",
    inventory: emptyInventory(),
    flags: emptyFlags(),
    dateAdded: new Date().toISOString(),
    dateUpdated: new Date().toISOString(),
  };
}

function seedProducts() {
  const rows = [
    { name: "Aurelio Automatic", brand: "MODARA Heritage", price: 138000, compareAtPrice: 165000, gender: "Men", style: "Luxury-Inspired", movement: "Automatic", collection: "Best Sellers", occasion: "Office & Business", flags: { bestSeller: true, newArrival: false, limitedEdition: false, featured: true, giftSet: false }, qty: 14 },
    { name: "Verona Chronograph", brand: "MODARA Signature", price: 96500, compareAtPrice: "", gender: "Men", style: "Sports", movement: "Chronograph", collection: "New Arrivals", occasion: "Weekend Style", flags: { bestSeller: false, newArrival: true, limitedEdition: false, featured: false, giftSet: false }, qty: 21 },
    { name: "Lumen Minimalist", brand: "MODARA Essentials", price: 58000, compareAtPrice: "", gender: "Unisex", style: "Minimalist", movement: "Quartz", collection: "", occasion: "Everyday Wear", flags: emptyFlags(), qty: 40 },
    { name: "Sovereign Skeleton", brand: "MODARA Heritage", price: 210000, compareAtPrice: 245000, gender: "Men", style: "Skeleton", movement: "Mechanical", collection: "Limited Edition", occasion: "Luxury Statement Pieces", flags: { bestSeller: false, newArrival: false, limitedEdition: true, featured: true, giftSet: false }, qty: 4 },
    { name: "Draven Quartz", brand: "MODARA Signature", price: 47500, compareAtPrice: "", gender: "Men", style: "Casual", movement: "Quartz", collection: "", occasion: "Everyday Wear", flags: emptyFlags(), qty: 33 },
    { name: "Noir Dress Watch", brand: "MODARA Essentials", price: 72000, compareAtPrice: 89000, gender: "Women", style: "Dress", movement: "Quartz", collection: "", occasion: "Formal Events", flags: emptyFlags(), qty: 18 },
    { name: "Regal Two-Tone", brand: "MODARA Heritage", price: 183000, compareAtPrice: "", gender: "Women", style: "Luxury-Inspired", movement: "Automatic", collection: "Best Sellers", occasion: "Wedding", flags: { bestSeller: true, newArrival: false, limitedEdition: false, featured: false, giftSet: false }, qty: 9 },
    { name: "Cadence Sport", brand: "MODARA Signature", price: 64000, compareAtPrice: "", gender: "Unisex", style: "Sports", movement: "Chronograph", collection: "", occasion: "Weekend Style", flags: emptyFlags(), qty: 26 },
  ];
  return rows.map((r, i) => {
    const p = blankProduct();
    const now = new Date(Date.now() - i * 86400000).toISOString();
    return {
      ...p,
      id: uid(),
      name: r.name,
      brand: r.brand,
      sku: "MOD-" + (1000 + i),
      description: `The ${r.name} pairs a ${r.movement.toLowerCase()} movement with a ${r.style.toLowerCase()} silhouette, hand-selected by MODARA for everyday confidence.`,
      shortDescription: `${r.style} ${r.movement.toLowerCase()} watch, curated by MODARA.`,
      price: r.price,
      compareAtPrice: r.compareAtPrice,
      gender: r.gender,
      category: "Watches",
      collection: r.collection,
      style: r.style,
      movement: r.movement,
      occasion: r.occasion,
      specs: {
        waterResistance: "5 ATM",
        caseMaterial: "Stainless steel",
        strapMaterial: r.style === "Sports" ? "Silicone" : "Genuine leather",
        crystal: "Sapphire-coated mineral glass",
        caseSize: "40mm",
        warranty: "2-year MODARA warranty",
      },
      images: [{ id: uid(), url: watchSVG(i) }],
      status: "published",
      inventory: { quantity: r.qty, trackInventory: true, allowBackorder: false, lowStockThreshold: 5 },
      flags: r.flags,
      dateAdded: now,
      dateUpdated: now,
    };
  });
}

/* ============================================================
   TOASTS
   ============================================================ */
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = "ok") => {
    const id = uid();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72 max-w-[90vw]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-lg shadow-lg px-4 py-3 flex items-start gap-2 text-sm border animate-[fadeIn_.2s_ease]"
          style={{
            background: t.type === "error" ? C.dangerBg : t.type === "warn" ? C.warnBg : C.okBg,
            borderColor: t.type === "error" ? "#e7c3bd" : t.type === "warn" ? "#f0dfae" : "#c9e3d4",
            color: t.type === "error" ? C.danger : t.type === "warn" ? C.warn : C.ok,
          }}
        >
          {t.type === "error" ? <CircleAlert size={16} className="mt-0.5 shrink-0" /> : t.type === "warn" ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0" />}
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
function ConfirmDialog({ open, title, body, confirmLabel, danger, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(17,17,17,0.5)" }} onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: danger ? C.dangerBg : C.warnBg }}>
            <AlertTriangle size={18} style={{ color: danger ? C.danger : C.warn }} />
          </div>
          <h3 className="font-semibold text-base" style={{ color: C.black }}>{title}</h3>
        </div>
        <p className="text-sm mb-6" style={{ color: C.muted }}>{body}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: C.line, color: C.black }}>Cancel</button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: danger ? C.danger : C.black }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function Field({ label, hint, required, children }) {
  return (
    <label className="block mb-4">
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>
        {label} {required && <span style={{ color: C.danger }}>*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-xs mt-1 block" style={{ color: C.soft }}>{hint}</span>}
    </label>
  );
}
const inputCls = "w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2";
function TextInput(props) {
  return <input {...props} className={inputCls} style={{ borderColor: C.line, ...props.style }} onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.line)} />;
}
function TextArea(props) {
  return <textarea {...props} className={inputCls + " resize-none"} style={{ borderColor: C.line, ...props.style }} onFocus={(e) => (e.target.style.borderColor = C.gold)} onBlur={(e) => (e.target.style.borderColor = C.line)} />;
}
function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={inputCls + " appearance-none pr-9 bg-white"} style={{ borderColor: C.line }}>
        {children}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: C.soft }} />
    </div>
  );
}
function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
      <span className="w-9 h-5 rounded-full relative transition-colors shrink-0" style={{ background: checked ? C.black : "#d8d5cd" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? 18 : 2 }} />
      </span>
      {label && <span className="text-sm" style={{ color: C.black }}>{label}</span>}
    </button>
  );
}
function StatusPill({ status }) {
  const map = {
    published: { bg: C.okBg, fg: C.ok, label: "Published" },
    draft: { bg: C.warnBg, fg: C.warn, label: "Draft" },
    archived: { bg: "#efeeec", fg: C.muted, label: "Archived" },
  };
  const s = map[status] || map.draft;
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.fg }}>{s.label}</span>;
}
function StockPill({ product }) {
  const { quantity, trackInventory, allowBackorder } = product.inventory;
  if (!trackInventory) return <span className="text-xs" style={{ color: C.muted }}>Not tracked</span>;
  if (quantity <= 0) {
    return allowBackorder
      ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: C.warnBg, color: C.warn }}>Backorder</span>
      : <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: C.dangerBg, color: C.danger }}>Out of stock</span>;
  }
  if (quantity <= product.inventory.lowStockThreshold) {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: C.warnBg, color: C.warn }}>Low · {quantity}</span>;
  }
  return <span className="text-xs" style={{ color: C.muted }}>{quantity} in stock</span>;
}

/* ============================================================
   PRODUCT FORM (Add / Edit)
   ============================================================ */
function ProductForm({ initial, onCancel, onSave, existingSkus }) {
  const [p, setP] = useState(initial || blankProduct());
  const [errors, setErrors] = useState({});
  const [newImgUrl, setNewImgUrl] = useState("");
  const isEdit = !!initial?.id;

  const set = (key, val) => setP((prev) => ({ ...prev, [key]: val }));
  const setSpec = (key, val) => setP((prev) => ({ ...prev, specs: { ...prev.specs, [key]: val } }));
  const setInv = (key, val) => setP((prev) => ({ ...prev, inventory: { ...prev.inventory, [key]: val } }));
  const setFlag = (key, val) => setP((prev) => ({ ...prev, flags: { ...prev.flags, [key]: val } }));

  function validate() {
    const e = {};
    if (!p.name.trim()) e.name = "Product name is required.";
    if (!p.brand) e.brand = "Choose a brand.";
    if (!p.sku.trim()) e.sku = "A SKU / reference is required.";
    else if (existingSkus.includes(p.sku.trim().toUpperCase()) && p.sku.trim().toUpperCase() !== (initial?.sku || "").toUpperCase()) e.sku = "This SKU is already in use.";
    if (p.price === "" || isNaN(p.price) || Number(p.price) <= 0) e.price = "Enter a valid selling price.";
    if (p.compareAtPrice !== "" && Number(p.compareAtPrice) <= Number(p.price)) e.compareAtPrice = "Compare-at price should be higher than the selling price.";
    if (p.images.length === 0) e.images = "Add at least one product image.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function addImageUrl() {
    if (!newImgUrl.trim()) return;
    setP((prev) => ({ ...prev, images: [...prev.images, { id: uid(), url: newImgUrl.trim() }] }));
    setNewImgUrl("");
  }
  function addPlaceholderImage() {
    setP((prev) => ({ ...prev, images: [...prev.images, { id: uid(), url: watchSVG(prev.images.length) }] }));
  }
  function removeImage(id) {
    setP((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== id) }));
  }
  function moveImage(id, dir) {
    setP((prev) => {
      const idx = prev.images.findIndex((i) => i.id === id);
      const swapWith = idx + dir;
      if (swapWith < 0 || swapWith >= prev.images.length) return prev;
      const arr = [...prev.images];
      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      return { ...prev, images: arr };
    });
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    const finalProduct = {
      ...p,
      sku: p.sku.trim().toUpperCase(),
      slug: p.slug || slugify(p.name),
      dateUpdated: now,
      dateAdded: p.dateAdded || now,
    };
    onSave(finalProduct);
  }

  return (
    <form onSubmit={submit} className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={onCancel} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: C.black }}>{isEdit ? "Edit product" : "Add product"}</h2>
          <p className="text-xs" style={{ color: C.muted }}>{isEdit ? `Editing ${initial.name}` : "New watches are saved as drafts until you publish them."}</p>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl border" style={{ borderColor: C.line, background: C.gray }}>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Status</span>
        <div className="flex gap-1.5">
          {STATUSES.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => set("status", s)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors"
              style={p.status === s ? { background: C.black, color: C.white, borderColor: C.black } : { background: C.white, color: C.muted, borderColor: C.line }}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: C.soft }}>Draft &amp; archived products never appear on the storefront.</span>
      </div>

      {/* Basic info */}
      <SectionCard title="Basic information">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Field label="Product name" required>
            <TextInput value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aurelio Automatic" />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </Field>
          <Field label="Brand" required>
            <Select value={p.brand} onChange={(e) => set("brand", e.target.value)}>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </Select>
            {errors.brand && <ErrorText>{errors.brand}</ErrorText>}
          </Field>
          <Field label="SKU / reference" required hint="Must be unique across the catalog.">
            <TextInput value={p.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. MOD-1042" />
            {errors.sku && <ErrorText>{errors.sku}</ErrorText>}
          </Field>
          <Field label="Short description" hint="Shown on product cards, keep it to one line.">
            <TextInput value={p.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} placeholder="e.g. Automatic dress watch, curated by MODARA" />
          </Field>
        </div>
        <Field label="Full description">
          <TextArea rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the piece — materials, feel, what makes it worth wearing." />
        </Field>
      </SectionCard>

      {/* Pricing */}
      <SectionCard title="Pricing" subtitle="Amounts are in Nigerian Naira (₦).">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Field label="Selling price" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.soft }}>₦</span>
              <input type="number" min="0" value={p.price} onChange={(e) => set("price", e.target.value)} className={inputCls + " pl-7"} style={{ borderColor: C.line }} placeholder="0" />
            </div>
            {errors.price && <ErrorText>{errors.price}</ErrorText>}
          </Field>
          <Field label="Compare-at / original price" hint="Optional — shown crossed out to signal a discount.">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.soft }}>₦</span>
              <input type="number" min="0" value={p.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} className={inputCls + " pl-7"} style={{ borderColor: C.line }} placeholder="Optional" />
            </div>
            {errors.compareAtPrice && <ErrorText>{errors.compareAtPrice}</ErrorText>}
          </Field>
        </div>
      </SectionCard>

      {/* Classification */}
      <SectionCard title="Classification" subtitle="Controls where this watch appears when customers browse the shop.">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Field label="Gender"><Select value={p.gender} onChange={(e) => set("gender", e.target.value)}>{GENDERS.map((g) => <option key={g}>{g}</option>)}</Select></Field>
          <Field label="Category"><Select value={p.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((g) => <option key={g}>{g}</option>)}</Select></Field>
          <Field label="Style"><Select value={p.style} onChange={(e) => set("style", e.target.value)}>{STYLES.map((g) => <option key={g}>{g}</option>)}</Select></Field>
          <Field label="Movement"><Select value={p.movement} onChange={(e) => set("movement", e.target.value)}>{MOVEMENTS.map((g) => <option key={g}>{g}</option>)}</Select></Field>
          <Field label="Collection" hint="Optional grouping, separate from the merchandising flags below.">
            <Select value={p.collection} onChange={(e) => set("collection", e.target.value)}>
              <option value="">No collection</option>
              {COLLECTIONS.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </Field>
          <Field label="Occasion">
            <Select value={p.occasion} onChange={(e) => set("occasion", e.target.value)}>
              <option value="">No occasion tag</option>
              {OCCASIONS.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </Field>
        </div>
      </SectionCard>

      {/* Specs */}
      <SectionCard title="Watch specifications" subtitle="Leave any field blank if it doesn't apply.">
        <div className="grid sm:grid-cols-2 gap-x-6">
          <Field label="Water resistance"><TextInput value={p.specs.waterResistance} onChange={(e) => setSpec("waterResistance", e.target.value)} placeholder="e.g. 5 ATM" /></Field>
          <Field label="Case material"><TextInput value={p.specs.caseMaterial} onChange={(e) => setSpec("caseMaterial", e.target.value)} placeholder="e.g. Stainless steel" /></Field>
          <Field label="Strap material"><TextInput value={p.specs.strapMaterial} onChange={(e) => setSpec("strapMaterial", e.target.value)} placeholder="e.g. Genuine leather" /></Field>
          <Field label="Crystal / glass"><TextInput value={p.specs.crystal} onChange={(e) => setSpec("crystal", e.target.value)} placeholder="e.g. Sapphire-coated mineral" /></Field>
          <Field label="Case size"><TextInput value={p.specs.caseSize} onChange={(e) => setSpec("caseSize", e.target.value)} placeholder="e.g. 40mm" /></Field>
          <Field label="Warranty"><TextInput value={p.specs.warranty} onChange={(e) => setSpec("warranty", e.target.value)} placeholder="e.g. 2-year MODARA warranty" /></Field>
        </div>
      </SectionCard>

      {/* Images */}
      <SectionCard title="Product images" subtitle="The first image is used as the main product image everywhere on the storefront.">
        {errors.images && <ErrorText>{errors.images}</ErrorText>}
        <div className="flex flex-wrap gap-3 mt-2 mb-4">
          {p.images.map((img, i) => (
            <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border group" style={{ borderColor: i === 0 ? C.gold : C.line, borderWidth: i === 0 ? 2 : 1 }}>
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.gold, color: C.black }}>MAIN</span>}
              <button type="button" onClick={() => removeImage(img.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={11} />
              </button>
              <div className="absolute bottom-1 inset-x-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" disabled={i === 0} onClick={() => moveImage(img.id, -1)} className="w-5 h-5 rounded bg-black/70 text-white text-[10px] flex items-center justify-center disabled:opacity-30">‹</button>
                <button type="button" disabled={i === p.images.length - 1} onClick={() => moveImage(img.id, 1)} className="w-5 h-5 rounded bg-black/70 text-white text-[10px] flex items-center justify-center disabled:opacity-30">›</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addPlaceholderImage} className="w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 hover:bg-black/[.03]" style={{ borderColor: C.line, color: C.soft }}>
            <ImagePlus size={18} />
            <span className="text-[10px] font-medium">Generate</span>
          </button>
        </div>
        <div className="flex gap-2">
          <TextInput value={newImgUrl} onChange={(e) => setNewImgUrl(e.target.value)} placeholder="Paste an image URL…" />
          <button type="button" onClick={addImageUrl} className="px-4 rounded-lg text-sm font-semibold border shrink-0" style={{ borderColor: C.line }}>Add</button>
        </div>
        <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: C.soft }}>
          <Info size={13} className="mt-0.5 shrink-0" />
          This prototype stores image URLs, not uploaded files. Connecting real file uploads needs a storage backend — see the note at the bottom of the dashboard.
        </p>
      </SectionCard>

      {/* Inventory */}
      <SectionCard title="Inventory">
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
          <Field label="Stock quantity">
            <TextInput type="number" min="0" value={p.inventory.quantity} onChange={(e) => setInv("quantity", Number(e.target.value))} />
          </Field>
          <Field label="Low-stock threshold" hint="Flags as “Low stock” at or below this number.">
            <TextInput type="number" min="0" value={p.inventory.lowStockThreshold} onChange={(e) => setInv("lowStockThreshold", Number(e.target.value))} />
          </Field>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          <Toggle checked={p.inventory.trackInventory} onChange={(v) => setInv("trackInventory", v)} label="Track inventory for this product" />
          <Toggle checked={p.inventory.allowBackorder} onChange={(v) => setInv("allowBackorder", v)} label="Allow purchase when out of stock" />
        </div>
      </SectionCard>

      {/* Flags */}
      <SectionCard title="Merchandising flags" subtitle="Controls which storefront sections this watch is eligible for.">
        <div className="grid sm:grid-cols-2 gap-3">
          <FlagRow label="Best Seller" checked={p.flags.bestSeller} onChange={(v) => setFlag("bestSeller", v)} />
          <FlagRow label="New Arrival" checked={p.flags.newArrival} onChange={(v) => setFlag("newArrival", v)} />
          <FlagRow label="Limited Edition" checked={p.flags.limitedEdition} onChange={(v) => setFlag("limitedEdition", v)} />
          <FlagRow label="Featured" checked={p.flags.featured} onChange={(v) => setFlag("featured", v)} />
          <FlagRow label="Part of a Gift Set" checked={p.flags.giftSet} onChange={(v) => setFlag("giftSet", v)} />
        </div>
      </SectionCard>

      <div className="flex items-center gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-4 mt-2 border-t" style={{ borderColor: C.line }}>
        <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: C.black }}>
          {isEdit ? "Save changes" : p.status === "published" ? "Publish product" : "Save product"}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg text-sm font-semibold border" style={{ borderColor: C.line, color: C.black }}>Cancel</button>
      </div>
    </form>
  );
}
function SectionCard({ title, subtitle, children }) {
  return (
    <div className="mb-6 p-5 sm:p-6 rounded-xl border bg-white" style={{ borderColor: C.line }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: C.black }}>{title}</h3>
      {subtitle && <p className="text-xs mb-4" style={{ color: C.soft }}>{subtitle}</p>}
      {!subtitle && <div className="mb-1" />}
      <div className="mt-3">{children}</div>
    </div>
  );
}
function ErrorText({ children }) {
  return <span className="text-xs mt-1 flex items-center gap-1" style={{ color: C.danger }}><CircleAlert size={12} />{children}</span>;
}
function FlagRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: C.line }}>
      <span className="text-sm" style={{ color: C.black }}>{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ============================================================
   ADMIN — PRODUCTS LIST
   ============================================================ */
function AdminProducts({ products, onAdd, onEdit, onArchive, onRestore, onDelete }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [brand, setBrand] = useState("all");
  const [gender, setGender] = useState("all");
  const [collection, setCollection] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [confirm, setConfirm] = useState(null); // {type:'archive'|'delete'|'restore', product}

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!(p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))) return false;
      }
      if (status !== "all" && p.status !== status) return false;
      if (brand !== "all" && p.brand !== brand) return false;
      if (gender !== "all" && p.gender !== gender) return false;
      if (collection !== "all" && p.collection !== collection) return false;
      if (stockFilter === "out" && !(p.inventory.trackInventory && p.inventory.quantity <= 0)) return false;
      if (stockFilter === "low" && !(p.inventory.trackInventory && p.inventory.quantity > 0 && p.inventory.quantity <= p.inventory.lowStockThreshold)) return false;
      if (stockFilter === "in" && !(p.inventory.trackInventory && p.inventory.quantity > p.inventory.lowStockThreshold)) return false;
      return true;
    }).sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
  }, [products, query, status, brand, gender, collection, stockFilter]);

  const filtersActive = status !== "all" || brand !== "all" || gender !== "all" || collection !== "all" || stockFilter !== "all" || query.trim();
  function resetFilters() { setQuery(""); setStatus("all"); setBrand("all"); setGender("all"); setCollection("all"); setStockFilter("all"); }

  function runConfirm() {
    if (!confirm) return;
    if (confirm.type === "archive") onArchive(confirm.product.id);
    if (confirm.type === "delete") onDelete(confirm.product.id);
    setConfirm(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: C.black }}>Products</h2>
          <p className="text-xs" style={{ color: C.muted }}>{filtered.length} of {products.length} products</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: C.black }}>
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.soft }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, brand or SKU…" className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm" style={{ borderColor: C.line }} />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: filtersActive ? C.black : C.line, color: C.black }}>
            <Filter size={15} /> Filters {filtersActive && <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.gold }} />}
          </button>
          {filtersActive && <button onClick={resetFilters} className="text-xs font-semibold underline" style={{ color: C.muted }}>Reset</button>}
        </div>
        {showFilters && (
          <div className="grid sm:grid-cols-5 gap-2 p-3 rounded-lg" style={{ background: C.gray }}>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
            </Select>
            <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="all">All brands</option>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </Select>
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="all">All genders</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </Select>
            <Select value={collection} onChange={(e) => setCollection(e.target.value)}>
              <option value="all">All collections</option>
              {COLLECTIONS.map((g) => <option key={g}>{g}</option>)}
            </Select>
            <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="all">Any stock level</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </Select>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "No products yet" : "No products match these filters"}
          body={products.length === 0 ? "Add your first watch to start building the MODARA catalog." : "Try a different search term or reset your filters."}
          action={products.length === 0 ? { label: "Add product", onClick: onAdd } : { label: "Reset filters", onClick: resetFilters }}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl border overflow-hidden" style={{ borderColor: C.line }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: C.gray, color: C.muted }} className="text-left text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Flags</th>
                  <th className="px-4 py-3 font-semibold">Added</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t" style={{ borderColor: C.line }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]?.url || watchSVG(0)} className="w-11 h-11 rounded-lg object-cover border" style={{ borderColor: C.line }} alt="" />
                        <div>
                          <div className="font-medium" style={{ color: C.black }}>{p.name}</div>
                          <div className="text-xs" style={{ color: C.soft }}>{p.brand} · {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatNaira(p.price)}</div>
                      {p.compareAtPrice && <div className="text-xs line-through" style={{ color: C.soft }}>{formatNaira(p.compareAtPrice)}</div>}
                    </td>
                    <td className="px-4 py-3"><StockPill product={p} /></td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.muted }}>{p.gender} · {p.style}</td>
                    <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {p.flags.bestSeller && <MiniTag>Best Seller</MiniTag>}
                        {p.flags.newArrival && <MiniTag>New</MiniTag>}
                        {p.flags.limitedEdition && <MiniTag>Limited</MiniTag>}
                        {p.flags.featured && <MiniTag>Featured</MiniTag>}
                        {p.flags.giftSet && <MiniTag>Gift Set</MiniTag>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: C.muted }}>{dateFmt(p.dateAdded)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconAction title="Edit" onClick={() => onEdit(p)}><Pencil size={15} /></IconAction>
                        {p.status !== "archived" ? (
                          <IconAction title="Archive" onClick={() => setConfirm({ type: "archive", product: p })}><Archive size={15} /></IconAction>
                        ) : (
                          <IconAction title="Restore" onClick={() => onRestore(p.id)}><RotateCcw size={15} /></IconAction>
                        )}
                        <IconAction title="Delete" danger onClick={() => setConfirm({ type: "delete", product: p })}><Trash2 size={15} /></IconAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border p-3.5" style={{ borderColor: C.line }}>
                <div className="flex gap-3">
                  <img src={p.images[0]?.url || watchSVG(0)} className="w-16 h-16 rounded-lg object-cover border shrink-0" style={{ borderColor: C.line }} alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-sm" style={{ color: C.black }}>{p.name}</div>
                        <div className="text-xs" style={{ color: C.soft }}>{p.brand} · {p.sku}</div>
                      </div>
                      <StatusPill status={p.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-semibold text-sm">{formatNaira(p.price)}</span>
                      {p.compareAtPrice && <span className="text-xs line-through" style={{ color: C.soft }}>{formatNaira(p.compareAtPrice)}</span>}
                    </div>
                    <div className="mt-1"><StockPill product={p} /></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.line }}>
                  <button onClick={() => onEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: C.line }}><Pencil size={13} /> Edit</button>
                  {p.status !== "archived" ? (
                    <button onClick={() => setConfirm({ type: "archive", product: p })} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: C.line }}><Archive size={13} /> Archive</button>
                  ) : (
                    <button onClick={() => onRestore(p.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: C.line }}><RotateCcw size={13} /> Restore</button>
                  )}
                  <button onClick={() => setConfirm({ type: "delete", product: p })} className="w-9 h-9 flex items-center justify-center rounded-lg border shrink-0" style={{ borderColor: "#e7c3bd", color: C.danger }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === "delete" ? "Permanently delete this product?" : "Archive this product?"}
        body={confirm?.type === "delete"
          ? `“${confirm?.product?.name}” and all of its data will be permanently removed. This can't be undone. Consider archiving instead if you might need it again.`
          : `“${confirm?.product?.name}” will be removed from the storefront and all merchandising sections. You can restore it at any time from the Archived filter.`}
        confirmLabel={confirm?.type === "delete" ? "Delete permanently" : "Archive product"}
        danger={confirm?.type === "delete"}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </div>
  );
}
function MiniTag({ children }) {
  return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: C.goldSoft, color: "#8a6d1a" }}>{children}</span>;
}
function IconAction({ children, title, onClick, danger }) {
  return (
    <button title={title} onClick={onClick} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/5" style={{ color: danger ? C.danger : C.black }}>
      {children}
    </button>
  );
}
function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center text-center py-16 px-6 rounded-xl border-2 border-dashed" style={{ borderColor: C.line }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.gray }}>
        <Package size={20} style={{ color: C.soft }} />
      </div>
      <h3 className="font-semibold text-sm mb-1" style={{ color: C.black }}>{title}</h3>
      <p className="text-xs max-w-xs mb-5" style={{ color: C.muted }}>{body}</p>
      {action && <button onClick={action.onClick} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: C.black }}>{action.label}</button>}
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD (overview)
   ============================================================ */
function AdminDashboard({ products, goProducts }) {
  const published = products.filter((p) => p.status === "published").length;
  const draft = products.filter((p) => p.status === "draft").length;
  const archived = products.filter((p) => p.status === "archived").length;
  const lowStock = products.filter((p) => p.status !== "archived" && p.inventory.trackInventory && p.inventory.quantity > 0 && p.inventory.quantity <= p.inventory.lowStockThreshold).length;
  const outOfStock = products.filter((p) => p.status !== "archived" && p.inventory.trackInventory && p.inventory.quantity <= 0).length;
  const recent = [...products].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 5);

  const stats = [
    { label: "Published products", value: published, tone: "ok" },
    { label: "Drafts", value: draft, tone: "warn" },
    { label: "Archived", value: archived, tone: "muted" },
    { label: "Low stock", value: lowStock, tone: "warn" },
    { label: "Out of stock", value: outOfStock, tone: "danger" },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: C.black }}>Dashboard</h2>
      <p className="text-xs mb-6" style={{ color: C.muted }}>A quick look at the MODARA catalog.</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl border" style={{ borderColor: C.line }}>
            <div className="text-2xl font-semibold" style={{ color: C.black }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: C.muted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-5" style={{ borderColor: C.line }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: C.black }}>Recently added</h3>
          <button onClick={goProducts} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.black }}>View all products <ChevronRight size={13} /></button>
        </div>
        {recent.length === 0 ? (
          <p className="text-xs" style={{ color: C.muted }}>No products yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recent.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.images[0]?.url || watchSVG(0)} className="w-9 h-9 rounded-lg object-cover border" style={{ borderColor: C.line }} alt="" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: C.black }}>{p.name}</div>
                  <div className="text-xs" style={{ color: C.soft }}>{p.brand} · {formatNaira(p.price)}</div>
                </div>
                <StatusPill status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN PLACEHOLDER SECTIONS
   ============================================================ */
function AdminPlaceholder({ label, icon: Icon }) {
  return (
    <div className="flex flex-col items-center text-center py-24 px-6 rounded-xl border-2 border-dashed" style={{ borderColor: C.line }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: C.gray }}>
        <Icon size={20} style={{ color: C.soft }} />
      </div>
      <h3 className="font-semibold text-sm mb-1" style={{ color: C.black }}>{label}</h3>
      <p className="text-xs max-w-xs" style={{ color: C.muted }}>Planned for a future phase of the MODARA admin dashboard. Not built yet — this is a placeholder so the navigation is ready when it is.</p>
    </div>
  );
}

/* ============================================================
   ADMIN LOGIN (prototype-only passcode gate)
   ============================================================ */
function AdminLogin({ onLogin, onBack }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (pass === DEMO_PASSCODE) { setError(""); onLogin(); }
    else setError("Incorrect passcode. Try the demo passcode shown below.");
  }
  return (
    <div className="min-h-full flex items-center justify-center p-6" style={{ background: C.black }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-semibold text-2xl tracking-wide" style={{ color: C.white, fontFamily: "Georgia, serif" }}>MODARA<span style={{ color: C.gold }}>.</span></div>
          <div className="text-xs uppercase tracking-widest mt-1" style={{ color: "#9a9a96" }}>Admin Dashboard</div>
        </div>
        <form onSubmit={submit} className="rounded-xl p-6" style={{ background: C.white }}>
          <label className="block mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.muted }}>Admin passcode</span>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full mt-1.5 px-3 py-2.5 rounded-lg border text-sm" style={{ borderColor: C.line }} placeholder="Enter passcode" autoFocus />
          </label>
          {error && <p className="text-xs mb-4 flex items-center gap-1" style={{ color: C.danger }}><CircleAlert size={12} />{error}</p>}
          <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: C.black }}>Sign in</button>
        </form>
        <div className="mt-4 p-3.5 rounded-lg flex items-start gap-2" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}>
          <ShieldCheck size={15} style={{ color: C.gold }} className="mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed" style={{ color: "#e8e4d8" }}>
            <strong>Prototype login only.</strong> Demo passcode: <code className="font-mono">{DEMO_PASSCODE}</code>. This checks the passcode in the browser, so it is not real security — a production launch needs server-verified auth (e.g. Supabase Authentication).
          </p>
        </div>
        <button onClick={onBack} className="w-full text-center text-xs mt-5" style={{ color: "#9a9a96" }}>← Back to storefront</button>
      </div>
    </div>
  );
}

/* ============================================================
   ADMIN LAYOUT
   ============================================================ */
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, active: true },
  { key: "products", label: "Products", icon: Package, active: true },
  { key: "orders", label: "Orders", icon: ShoppingCart, active: false },
  { key: "customers", label: "Customers", icon: Users, active: false },
  { key: "inventory", label: "Inventory", icon: Boxes, active: false },
  { key: "collections", label: "Collections", icon: FolderKanban, active: false },
  { key: "reviews", label: "Reviews", icon: Star, active: false },
  { key: "discounts", label: "Discounts", icon: Percent, active: false },
  { key: "settings", label: "Settings", icon: Settings, active: false },
];

function AdminLayout({ view, setView, onLogout, goStorefront, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const current = NAV_ITEMS.find((n) => n.key === view) || NAV_ITEMS[0];

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 flex items-center gap-2 border-b" style={{ borderColor: "#2a2a2a" }}>
        <span className="font-semibold text-lg" style={{ color: C.white, fontFamily: "Georgia, serif" }}>MODARA<span style={{ color: C.gold }}>.</span></span>
        <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: "#2a2a2a", color: "#9a9a96" }}>Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setView(item.key); setMobileNavOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-colors"
              style={{ background: isActive ? "rgba(212,175,55,0.12)" : "transparent", color: isActive ? C.gold : "#c9c9c6" }}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{item.label}</span>
              {!item.active && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "#2a2a2a", color: "#7a7a76" }}>Soon</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t flex flex-col gap-1" style={{ borderColor: "#2a2a2a" }}>
        <button onClick={goStorefront} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "#c9c9c6" }}>
          <Store size={16} /> View storefront
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: "#c9c9c6" }}>
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full" style={{ background: C.gray }}>
      <aside className="hidden md:block w-60 shrink-0" style={{ background: C.black }}>{Sidebar}</aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64" style={{ background: C.black }}>{Sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b bg-white" style={{ borderColor: C.line }}>
          <button className="md:hidden" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <h1 className="font-semibold text-sm" style={{ color: C.black }}>{current.label}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full" style={{ background: C.warnBg, color: C.warn }}>
              <AlertTriangle size={11} /> Prototype mode
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

/* ============================================================
   STOREFRONT (minimal — pulls live from the shared product store)
   ============================================================ */
function ProductCard({ p, onOpen }) {
  return (
    <button onClick={() => onOpen(p)} className="text-left group">
      <div className="rounded-xl overflow-hidden border relative aspect-square" style={{ borderColor: C.line, background: "#f1efe9" }}>
        <img src={p.images[0]?.url || watchSVG(0)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {p.flags.bestSeller && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.gold, color: C.black }}>BEST SELLER</span>}
        {p.flags.newArrival && !p.flags.bestSeller && <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: C.black, color: C.white }}>NEW</span>}
        {p.inventory.trackInventory && p.inventory.quantity <= 0 && !p.inventory.allowBackorder && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-semibold" style={{ color: C.black }}>Out of stock</span>
        )}
      </div>
      <div className="mt-2.5">
        <div className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: C.soft }}>{p.brand}</div>
        <div className="text-sm font-medium mt-0.5" style={{ color: C.black }}>{p.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold" style={{ color: C.black }}>{formatNaira(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs line-through" style={{ color: C.soft }}>{formatNaira(p.compareAtPrice)}</span>}
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!product) return null;
  const images = product.images.length ? product.images : [{ id: "x", url: watchSVG(0) }];
  const oos = product.inventory.trackInventory && product.inventory.quantity <= 0 && !product.inventory.allowBackorder;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(17,17,17,0.55)" }} onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="grid sm:grid-cols-2">
          <div className="p-5">
            <div className="rounded-xl overflow-hidden aspect-square mb-2" style={{ background: "#f1efe9" }}>
              <img src={images[imgIdx].url} className="w-full h-full object-cover" alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((im, i) => (
                  <button key={im.id} onClick={() => setImgIdx(i)} className="w-14 h-14 rounded-lg overflow-hidden border-2" style={{ borderColor: i === imgIdx ? C.gold : C.line }}>
                    <img src={im.url} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="p-5 sm:pr-6 relative">
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.gray }}><X size={15} /></button>
            <div className="text-[11px] uppercase tracking-wide font-semibold mb-1" style={{ color: C.soft }}>{product.brand}</div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: C.black }}>{product.name}</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-semibold">{formatNaira(product.price)}</span>
              {product.compareAtPrice && <span className="text-sm line-through" style={{ color: C.soft }}>{formatNaira(product.compareAtPrice)}</span>}
            </div>
            <p className="text-sm mb-4" style={{ color: C.muted }}>{product.shortDescription || product.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              {product.specs.caseMaterial && <SpecRow label="Case" value={product.specs.caseMaterial} />}
              {product.specs.strapMaterial && <SpecRow label="Strap" value={product.specs.strapMaterial} />}
              {product.movement && <SpecRow label="Movement" value={product.movement} />}
              {product.specs.waterResistance && <SpecRow label="Water resistance" value={product.specs.waterResistance} />}
              {product.specs.caseSize && <SpecRow label="Case size" value={product.specs.caseSize} />}
              {product.specs.warranty && <SpecRow label="Warranty" value={product.specs.warranty} />}
            </div>
            <button
              disabled={oos}
              onClick={() => onAddToCart(product)}
              className="w-full py-3 rounded-lg text-sm font-semibold"
              style={oos ? { background: C.gray, color: C.soft } : { background: C.black, color: C.white }}
            >
              {oos ? "Out of stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between border-b py-1.5" style={{ borderColor: C.line }}>
      <span style={{ color: C.soft }}>{label}</span>
      <span style={{ color: C.black }} className="font-medium">{value}</span>
    </div>
  );
}

function Storefront({ products, goAdmin, push }) {
  const [active, setActive] = useState(null);
  const [cart, setCart] = useState(0);
  const [filter, setFilter] = useState("all");

  const visible = products.filter((p) => p.status === "published");
  const bestSellers = visible.filter((p) => p.flags.bestSeller);
  const newArrivals = visible.filter((p) => p.flags.newArrival);
  const shown = filter === "all" ? visible : filter === "best" ? bestSellers : filter === "new" ? newArrivals : visible.filter((p) => p.gender === filter);

  function addToCart(p) {
    setCart((c) => c + 1);
    push(`Added ${p.name} to cart.`, "ok");
    setActive(null);
  }

  return (
    <div style={{ background: C.white, minHeight: "100%" }}>
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 py-3.5 border-b bg-white/95 backdrop-blur" style={{ borderColor: C.line }}>
        <span className="font-semibold text-lg tracking-wide" style={{ color: C.black, fontFamily: "Georgia, serif" }}>MODARA<span style={{ color: C.gold }}>.</span></span>
        <div className="flex items-center gap-4">
          <span className="text-xs relative" style={{ color: C.muted }}>
            Cart <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold" style={{ background: C.gold, color: C.black }}>{cart}</span>
          </span>
          <button onClick={goAdmin} className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full border" style={{ borderColor: C.line, color: C.black }}>
            <ShieldCheck size={13} /> Admin
          </button>
        </div>
      </header>

      <div className="px-5 sm:px-8 py-3 flex items-center gap-2 text-xs" style={{ background: C.gray, color: C.muted }}>
        <Info size={13} />
        Live prototype — every product below is read from the same store the admin dashboard edits.
      </div>

      <section className="px-5 sm:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-1" style={{ color: C.black, fontFamily: "Georgia, serif" }}>Timepieces That Make Every First Impression Count.</h1>
        <p className="text-sm mb-6" style={{ color: C.muted }}>MODARA curates premium watches for the confident and the professional.</p>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: "all", label: "All Watches" },
            { key: "best", label: "Best Sellers" },
            { key: "new", label: "New Arrivals" },
            { key: "Men", label: "Men" },
            { key: "Women", label: "Women" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className="px-4 py-2 rounded-full text-xs font-semibold border shrink-0" style={filter === f.key ? { background: C.black, color: C.white, borderColor: C.black } : { borderColor: C.line, color: C.black }}>
              {f.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <EmptyState title="No products to show" body="Publish a product from the admin dashboard to see it appear here." action={{ label: "Go to admin", onClick: goAdmin }} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {shown.map((p) => <ProductCard key={p.id} p={p} onOpen={setActive} />)}
          </div>
        )}
      </section>

      <ProductDetailModal product={active} onClose={() => setActive(null)} onAddToCart={addToCart} />
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [products, setProducts] = useState(null); // null = loading
  const [view, setView] = useState("storefront"); // storefront | admin-login | admin
  const [adminView, setAdminView] = useState("dashboard");
  const [editingProduct, setEditingProduct] = useState(undefined); // undefined = list, null = new, object = editing
  const { toasts, push } = useToasts();

  const loadProducts = useCallback(async () => {
    try {
      const seeded = await window.storage.get("modara_seeded_v1", true).catch(() => null);
      if (!seeded) {
        const seed = seedProducts();
        await window.storage.set(STORAGE_KEY, JSON.stringify(seed), true);
        await window.storage.set(SEED_FLAG_KEY, "true", true);
        setProducts(seed);
        return;
      }
      const res = await window.storage.get(STORAGE_KEY, true).catch(() => null);
      setProducts(res?.value ? JSON.parse(res.value) : []);
    } catch (err) {
      console.error(err);
      push("Couldn't load the product catalog. Using an empty catalog for now.", "error");
      setProducts([]);
    }
  }, [push]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function persist(next) {
    setProducts(next);
    try {
      const result = await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
      if (!result) throw new Error("no result");
    } catch (err) {
      console.error(err);
      push("Database error — your change is showing locally but may not have saved. Try again.", "error");
    }
  }

  function handleSave(product) {
    const exists = products.some((p) => p.id === product.id);
    let next;
    if (exists) {
      next = products.map((p) => (p.id === product.id ? product : p));
      push(`${product.name} updated.`, "ok");
    } else {
      next = [{ ...product, id: uid() }, ...products];
      push(product.status === "published" ? `${product.name} published.` : `${product.name} saved as ${product.status}.`, "ok");
    }
    persist(next);
    setEditingProduct(undefined);
  }
  function handleArchive(id) {
    const p = products.find((x) => x.id === id);
    persist(products.map((x) => (x.id === id ? { ...x, status: "archived", dateUpdated: new Date().toISOString() } : x)));
    push(`${p?.name || "Product"} archived and removed from the storefront.`, "warn");
  }
  function handleRestore(id) {
    const p = products.find((x) => x.id === id);
    persist(products.map((x) => (x.id === id ? { ...x, status: "draft", dateUpdated: new Date().toISOString() } : x)));
    push(`${p?.name || "Product"} restored as a draft. Publish it to show it on the storefront again.`, "ok");
  }
  function handleDelete(id) {
    const p = products.find((x) => x.id === id);
    persist(products.filter((x) => x.id !== id));
    push(`${p?.name || "Product"} permanently deleted.`, "warn");
  }

  const existingSkus = (products || []).map((p) => p.sku.toUpperCase());

  if (products === null) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: C.gray }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: C.gold, borderTopColor: "transparent" }} />
          Loading MODARA catalog…
        </div>
      </div>
    );
  }

  if (view === "storefront") {
    return (
      <div className="h-full overflow-y-auto">
        <Storefront products={products} goAdmin={() => setView("admin-login")} push={push} />
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  if (view === "admin-login") {
    return (
      <div className="h-full overflow-y-auto">
        <AdminLogin onLogin={() => { setView("admin"); push("Signed in to the admin dashboard.", "ok"); }} onBack={() => setView("storefront")} />
        <ToastStack toasts={toasts} />
      </div>
    );
  }

  // admin
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <AdminLayout
        view={adminView}
        setView={(v) => { setAdminView(v); setEditingProduct(undefined); }}
        onLogout={() => { setView("storefront"); push("Signed out.", "ok"); }}
        goStorefront={() => setView("storefront")}
      >
        {adminView === "dashboard" && <AdminDashboard products={products} goProducts={() => setAdminView("products")} />}

        {adminView === "products" && editingProduct === undefined && (
          <AdminProducts
            products={products}
            onAdd={() => setEditingProduct(null)}
            onEdit={(p) => setEditingProduct(p)}
            onArchive={handleArchive}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        )}
        {adminView === "products" && editingProduct !== undefined && (
          <ProductForm
            initial={editingProduct}
            existingSkus={existingSkus}
            onCancel={() => setEditingProduct(undefined)}
            onSave={handleSave}
          />
        )}

        {adminView === "orders" && <AdminPlaceholder label="Orders" icon={ShoppingCart} />}
        {adminView === "customers" && <AdminPlaceholder label="Customers" icon={Users} />}
        {adminView === "inventory" && <AdminPlaceholder label="Inventory" icon={Boxes} />}
        {adminView === "collections" && <AdminPlaceholder label="Collections" icon={FolderKanban} />}
        {adminView === "reviews" && <AdminPlaceholder label="Reviews" icon={Star} />}
        {adminView === "discounts" && <AdminPlaceholder label="Discounts" icon={Percent} />}
        {adminView === "settings" && <AdminPlaceholder label="Settings" icon={Settings} />}
      </AdminLayout>
      <ToastStack toasts={toasts} />
    </div>
  );
}
