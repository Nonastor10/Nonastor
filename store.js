let products = [];
let cart = loadCart(); // { [productId]: qty }
let activeCategory = "all";
let orderDone = false;
let lastOrder = null; // { number, total, deposit }

const grid = document.getElementById("productGrid");
const catPills = document.getElementById("catPills");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");
const overlay = document.getElementById("overlay");
const drawer = document.getElementById("drawer");
const closeDrawer = document.getElementById("closeDrawer");
const cartBody = document.getElementById("cartBody");
const cartFoot = document.getElementById("cartFoot");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const custName = document.getElementById("custName");
const custPhone = document.getElementById("custPhone");
const checkoutErr = document.getElementById("checkoutErr");

document.getElementById("browseBtn").addEventListener("click", () => {
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
});
cartBtn.addEventListener("click", openDrawer);
closeDrawer.addEventListener("click", closeDrawerFn);
overlay.addEventListener("click", closeDrawerFn);
checkoutBtn.addEventListener("click", submitOrder);

function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("open");
}
function closeDrawerFn() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");
}

function renderCategoryPills() {
  const all = [{ id: "all", name: "الكل" }, ...CATEGORIES];
  catPills.innerHTML = all
    .map(
      (c) => `<button class="lm-cat-pill ${activeCategory === c.id ? "active" : ""}" data-cat="${c.id}">${c.name}</button>`
    )
    .join("");
  catPills.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderCategoryPills();
      renderProducts();
    });
  });
}

function renderProducts() {
  const list = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
  if (list.length === 0) {
    grid.innerHTML = `<p class="lm-empty">لا توجد منتجات في هذه الفئة حاليًا</p>`;
    return;
  }
  grid.innerHTML = list
    .map((p) => {
      const cat = catInfo(p.category);
      const media = p.image ? `<img src="${p.image}" alt="${p.name}">` : CATEGORY_ICONS[p.category] || "";
      return `
      <div class="lm-card">
        <div class="lm-card-media">${media}</div>
        <div class="lm-card-body">
          <span class="lm-card-cat">${cat.name}</span>
          <span class="lm-card-name">${p.name}</span>
          ${p.desc ? `<span class="lm-card-desc">${p.desc}</span>` : ""}
          <div class="lm-card-footer">
            <span class="lm-price">${p.price} ج.م</span>
            <button class="lm-add-btn" data-id="${p.id}">أضيفي للسلة</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
  grid.querySelectorAll(".lm-add-btn").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.id));
  });
}

function addToCart(id) {
  orderDone = false;
  cart[id] = (cart[id] || 0) + 1;
  saveCart(cart);
  renderCart();
  openDrawer();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ id, qty, product: products.find((p) => p.id === id) }))
    .filter((e) => e.product);

  const count = entries.reduce((s, e) => s + e.qty, 0);
  cartBadge.style.display = count > 0 ? "flex" : "none";
  cartBadge.textContent = count;

  if (entries.length === 0) {
    if (orderDone && lastOrder) {
      const waText = encodeURIComponent(
        `مرفق سكرين شوت تحويل عربون طلب رقم #${lastOrder.number}\nقيمة العربون: ${lastOrder.deposit} ج.م\nإجمالي الطلب: ${lastOrder.total} ج.م`
      );
      const waLink = `https://wa.me/${STORE_WHATSAPP}?text=${waText}`;
      cartBody.innerHTML = `
        <div class="lm-confirm">
          <p class="lm-confirm-title">تم تسجيل طلبك رقم #${lastOrder.number} ✅</p>
          <p class="lm-confirm-line">إجمالي الطلب: <strong>${lastOrder.total} ج.م</strong></p>
          <p class="lm-confirm-line">المطلوب تحويله كعربون (نص المبلغ): <strong>${lastOrder.deposit} ج.م</strong></p>
          <p class="lm-confirm-step">1) حوّل مبلغ العربون على محفظة كاش رقم:</p>
          <p class="lm-phone">${STORE_PHONE_DISPLAY}</p>
          <p class="lm-confirm-step">2) اعملي سكرين شوت لإيصال التحويل</p>
          <p class="lm-confirm-step">3) ابعتي السكرين شوت على واتساب على نفس الرقم لتأكيد الطلب</p>
          <a class="lm-whatsapp-btn" href="${waLink}" target="_blank" rel="noopener">فتح واتساب لإرسال السكرين شوت</a>
          <p class="lm-note">هيتفتح واتساب برسالة جاهزة - ماينفعش نرفق الصورة تلقائيًا، فمن فضلك أرفقي السكرين شوت بنفسك جوه المحادثة</p>
        </div>`;
    } else {
      cartBody.innerHTML = `
        <div class="lm-empty">
          <svg viewBox="0 0 48 48" fill="none" stroke="#8C8275" stroke-width="1.6" style="margin:0 auto;display:block;">
            <path d="M12 16 L14 40 C14 42 16 44 18 44 L30 44 C32 44 34 42 34 40 L36 16" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 16 L39 16" stroke-linecap="round"/>
            <path d="M18 16 C18 11 20 8 24 8 C28 8 30 11 30 16" stroke-linecap="round"/>
          </svg>
          السلة فارغة حاليًا
        </div>`;
    }
    cartFoot.style.display = "none";
    return;
  }

  cartBody.innerHTML = entries
    .map((e) => {
      const thumb = e.product.image
        ? `<img src="${e.product.image}" alt="${e.product.name}">`
        : CATEGORY_ICONS[e.product.category] || "";
      return `
    <div class="lm-cart-row">
      <div class="lm-cart-thumb">${thumb}</div>
      <div class="lm-cart-row-info">
        <div class="name">${e.product.name}</div>
        <div class="price">${e.product.price} ج.م</div>
      </div>
      <div class="lm-qty">
        <button data-act="dec" data-id="${e.id}">−</button>
        <span>${e.qty}</span>
        <button data-act="inc" data-id="${e.id}">+</button>
      </div>
      <button class="lm-icon-btn danger" data-act="remove" data-id="${e.id}">🗑</button>
    </div>`;
    })
    .join("");

  cartBody.querySelectorAll("button").forEach((btn) => {
    const id = btn.dataset.id;
    if (btn.dataset.act === "inc") btn.addEventListener("click", () => changeQty(id, 1));
    if (btn.dataset.act === "dec") btn.addEventListener("click", () => changeQty(id, -1));
    if (btn.dataset.act === "remove") btn.addEventListener("click", () => removeFromCart(id));
  });

  const total = entries.reduce((s, e) => s + e.qty * e.product.price, 0);
  cartTotalEl.textContent = total + " ج.م";
  cartFoot.style.display = "block";
}

async function submitOrder() {
  const name = custName.value.trim();
  const phone = custPhone.value.trim();
  if (!name || !phone) {
    checkoutErr.textContent = "من فضلك اكتبي الاسم ورقم الموبايل قبل إتمام الطلب";
    return;
  }
  checkoutErr.textContent = "";
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "جارٍ إرسال الطلب...";

  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ qty, product: products.find((p) => p.id === id) }))
    .filter((e) => e.product);
  const total = entries.reduce((s, e) => s + e.qty * e.product.price, 0);
  const deposit = Math.ceil(total / 2);

  try {
    const orderNumber = await nextOrderNumber();
    await addOrder({
      number: orderNumber,
      customerName: name,
      customerPhone: phone,
      items: entries.map((e) => ({
        id: e.product.id,
        name: e.product.name,
        price: e.product.price,
        qty: e.qty,
        image: e.product.image || null,
      })),
      total,
      deposit,
    });

    lastOrder = { number: orderNumber, total, deposit };
    cart = {};
    saveCart(cart);
    orderDone = true;
    custName.value = "";
    custPhone.value = "";
    renderCart();
  } catch (err) {
    checkoutErr.textContent = "حصل خطأ أثناء إرسال الطلب، حاولي تاني";
  } finally {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "إتمام الطلب";
  }
}

renderCategoryPills();
renderCart();

// اشتراك لحظي في المنتجات - أي تغيير من صفحة الأدمن (من أي جهاز) بيظهر هنا فورًا
subscribeProducts((list) => {
  products = list;
  renderProducts();
  renderCart();
});
