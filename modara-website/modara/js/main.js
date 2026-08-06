/* =========================================================
   MODARA — Shared site behavior
   ========================================================= */

/* ---------- Icons (inline, minimal outline) ---------- */
const ICONS = {
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z"/></svg>',
  starOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.5l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7-5.4-4.7 7.1-.7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4C8 3.6 10 5 12 7.3C14 5 16 3.6 18.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.4 12 21 12 21z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 6L6 18M6 6l12 12"/></svg>',
};

/* ---------- Cart (localStorage) ---------- */
const Cart = {
  KEY: "modara_cart_v1",
  read(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }catch(e){ return []; }
  },
  write(items){
    localStorage.setItem(this.KEY, JSON.stringify(items));
    Cart.renderBadge();
  },
  add(id, qty=1){
    const items = Cart.read();
    const existing = items.find(i => i.id === id);
    if(existing){ existing.qty += qty; } else { items.push({id, qty}); }
    Cart.write(items);
  },
  setQty(id, qty){
    let items = Cart.read();
    if(qty <= 0){ items = items.filter(i => i.id !== id); }
    else{
      const existing = items.find(i => i.id === id);
      if(existing) existing.qty = qty;
    }
    Cart.write(items);
  },
  remove(id){
    Cart.write(Cart.read().filter(i => i.id !== id));
  },
  count(){
    return Cart.read().reduce((sum,i)=> sum + i.qty, 0);
  },
  lines(){
    const products = (typeof MODARA_PRODUCTS !== "undefined") ? MODARA_PRODUCTS : [];
    return Cart.read().map(i => {
      const p = products.find(p => p.id === i.id);
      return p ? {...p, qty: i.qty} : null;
    }).filter(Boolean);
  },
  subtotal(){
    return Cart.lines().reduce((sum, l) => sum + (l.price * l.qty), 0);
  },
  renderBadge(){
    document.querySelectorAll("[data-cart-count]").forEach(el=>{
      const n = Cart.count();
      el.textContent = n;
      el.style.display = n > 0 ? "flex" : "none";
    });
  }
};

/* ---------- Wishlist (localStorage) ---------- */
const Wishlist = {
  KEY: "modara_wishlist_v1",
  read(){ try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }catch(e){ return []; } },
  toggle(id){
    let items = Wishlist.read();
    if(items.includes(id)){ items = items.filter(i=>i!==id); } else { items.push(id); }
    localStorage.setItem(this.KEY, JSON.stringify(items));
    return items.includes(id);
  },
  has(id){ return Wishlist.read().includes(id); }
};

/* ---------- Toast ---------- */
function showToast(msg){
  let t = document.querySelector(".toast");
  if(!t){
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.innerHTML = ICONS.check + "<span>"+msg+"</span>";
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove("show"), 2200);
}

/* ---------- Star rating render ---------- */
function starRow(rating){
  let html = "";
  for(let i=1;i<=5;i++){
    html += i <= Math.round(rating) ? ICONS.star : ICONS.starOutline;
  }
  return html;
}

/* ---------- Product card template ---------- */
function productCardHTML(p){
  const discount = p.compareAt ? Math.round(100 - (p.price/p.compareAt*100)) : null;
  return `
  <div class="product-card" data-id="${p.id}">
    <a href="product.html?id=${p.id}" class="product-media" aria-label="${p.name}">
      <img src="${p.img}" alt="${p.brand} ${p.name}" loading="lazy">
      <img src="${p.img2}" alt="" class="hover-img" loading="lazy">
      ${p.badge ? `<span class="product-badge${discount?' gold':''}">${p.badge}</span>` : (discount ? `<span class="product-badge gold">-${discount}%</span>` : "")}
    </a>
    <button class="wishlist-btn${Wishlist.has(p.id)?' active':''}" data-wishlist="${p.id}" aria-label="Add to wishlist">${ICONS.heart}</button>
    <div class="product-info">
      <a href="product.html?id=${p.id}">
        <b class="brand">${p.brand}</b>
        <div class="pname">${p.name}</div>
      </a>
      <div class="prating">${starRow(p.rating)} <span>(${p.reviews})</span></div>
      <div class="pprice">
        <b>${modaraFormatNaira(p.price)}</b>
        ${p.compareAt ? `<s>${modaraFormatNaira(p.compareAt)}</s>` : ""}
      </div>
    </div>
    <div class="quick-add">
      <button class="btn btn-primary btn-block" data-quickadd="${p.id}" style="padding:12px 18px;min-height:44px;font-size:11.5px;">Add to Cart</button>
    </div>
  </div>`;
}

function renderProductGrid(container, products){
  if(!container) return;
  container.innerHTML = products.map(productCardHTML).join("");
}

/* ---------- Global click delegation for cart/wishlist buttons ---------- */
document.addEventListener("click", (e)=>{
  const addBtn = e.target.closest("[data-quickadd]");
  if(addBtn){
    e.preventDefault();
    const id = addBtn.getAttribute("data-quickadd");
    const p = (typeof MODARA_PRODUCTS !== "undefined") ? MODARA_PRODUCTS.find(p=>p.id===id) : null;
    Cart.add(id, 1);
    showToast(p ? `${p.name} added to cart` : "Added to cart");
    return;
  }
  const wishBtn = e.target.closest("[data-wishlist]");
  if(wishBtn){
    e.preventDefault();
    const id = wishBtn.getAttribute("data-wishlist");
    const active = Wishlist.toggle(id);
    wishBtn.classList.toggle("active", active);
    showToast(active ? "Added to wishlist" : "Removed from wishlist");
    return;
  }
});

/* ---------- Mobile nav drawer ---------- */
function initDrawer(){
  const openBtn = document.querySelector("[data-drawer-open]");
  const closeBtn = document.querySelector("[data-drawer-close]");
  const drawer = document.querySelector(".drawer");
  const overlay = document.querySelector(".drawer-overlay");
  if(!drawer) return;
  const open = ()=>{ drawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow="hidden"; };
  const close = ()=>{ drawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow=""; };
  openBtn && openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  overlay && overlay.addEventListener("click", close);
}

/* ---------- FAQ accordion ---------- */
function initFAQ(){
  document.querySelectorAll(".faq-item").forEach(item=>{
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    q && q.addEventListener("click", ()=>{
      const isOpen = item.classList.contains("open");
      item.closest(".faq-list")?.querySelectorAll(".faq-item.open").forEach(other=>{
        if(other!==item){ other.classList.remove("open"); other.querySelector(".faq-a").style.maxHeight = null; }
      });
      if(isOpen){
        item.classList.remove("open");
        a.style.maxHeight = null;
      } else {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal(){
  const els = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){ els.forEach(el=>el.classList.add("in")); return; }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add("in"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el=> obs.observe(el));
}

/* ---------- Newsletter form (demo capture) ---------- */
function initNewsletter(){
  document.querySelectorAll("[data-newsletter-form]").forEach(form=>{
    form.addEventListener("submit", (e)=>{
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      if(input && input.value){
        showToast("Welcome to the MODARA Club");
        form.reset();
      }
    });
  });
}

/* ---------- Chip filter row active state (simple, non-functional demo unless overridden) ---------- */
function initChips(){
  document.querySelectorAll(".chip-row").forEach(row=>{
    row.addEventListener("click", (e)=>{
      const chip = e.target.closest(".chip");
      if(!chip) return;
      row.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
}

/* ---------- Init on load ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  initDrawer();
  initFAQ();
  initReveal();
  initNewsletter();
  initChips();
  Cart.renderBadge();
});
