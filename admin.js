// ⚠️ كلمة مرور بسيطة من جهة العميل فقط - مناسبة كحماية مبدئية لحد ما تعملي
// استضافة حقيقية بباك إند. غيّريها هنا لأي كلمة تحبيها قبل الرفع على GitHub.
const ADMIN_PASSWORD = "nona2026";

let products = loadProducts();
let editingId = null;
let currentImage = null;

const gate = document.getElementById("gate");
const adminPanel = document.getElementById("adminPanel");
const gatePassword = document.getElementById("gatePassword");
const gateBtn = document.getElementById("gateBtn");
const gateErr = document.getElementById("gateErr");

gateBtn.addEventListener("click", tryLogin);
gatePassword.addEventListener("keydown", (e) => { if (e.key === "Enter") tryLogin(); });

function tryLogin() {
  if (gatePassword.value === ADMIN_PASSWORD) {
    gate.style.display = "none";
    adminPanel.style.display = "block";
  } else {
    gateErr.textContent = "كلمة المرور غير صحيحة";
  }
}

// ---- Admin panel (يعمل بس بعد الدخول) ----
const fName = document.getElementById("fName");
const fPrice = document.getElementById("fPrice");
const fCategory = document.getElementById("fCategory");
const fDesc = document.getElementById("fDesc");
const fImage = document.getElementById("fImage");
const fImagePreview = document.getElementById("fImagePreview");
const productForm = document.getElementById("productForm");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const adminMsg = document.getElementById("adminMsg");
const tableBody = document.getElementById("productTableBody");

fCategory.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");

fImage.addEventListener("change", () => {
  const file = fImage.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    currentImage = reader.result;
    fImagePreview.src = currentImage;
    fImagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = fName.value.trim();
  const price = parseFloat(fPrice.value);
  if (!name || !price || price <= 0) {
    adminMsg.textContent = "من فضلك اكتبي اسم المنتج وسعر صحيح";
    return;
  }
  if (editingId) {
    products = products.map((p) =>
      p.id === editingId
        ? { ...p, name, price, category: fCategory.value, desc: fDesc.value, image: currentImage }
        : p
    );
    adminMsg.textContent = "تم حفظ التعديلات";
  } else {
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    products.push({ id: nextId, name, price, category: fCategory.value, desc: fDesc.value, image: currentImage });
    adminMsg.textContent = "تمت إضافة المنتج";
  }
  saveProducts(products);
  resetForm();
  renderTable();
  setTimeout(() => (adminMsg.textContent = ""), 2500);
});

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  fName.value = "";
  fPrice.value = "";
  fCategory.value = CATEGORIES[0].id;
  fDesc.value = "";
  fImage.value = "";
  fImagePreview.style.display = "none";
  currentImage = null;
  editingId = null;
  submitBtn.innerHTML = "＋ إضافة المنتج";
  cancelBtn.style.display = "none";
}

function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  fName.value = p.name;
  fPrice.value = p.price;
  fCategory.value = p.category;
  fDesc.value = p.desc || "";
  currentImage = p.image || null;
  if (currentImage) {
    fImagePreview.src = currentImage;
    fImagePreview.style.display = "block";
  } else {
    fImagePreview.style.display = "none";
  }
  editingId = id;
  submitBtn.innerHTML = "✓ حفظ التعديلات";
  cancelBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteProduct(id) {
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  if (editingId === id) resetForm();
  renderTable();
}

function renderTable() {
  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--ink-soft); padding:24px 0;">لا توجد منتجات بعد</td></tr>`;
    return;
  }
  tableBody.innerHTML = products
    .map((p) => {
      const cat = catInfo(p.category);
      const thumb = p.image
        ? `<img src="${p.image}" alt="${p.name}">`
        : `<div style="width:40px;height:40px;">${CATEGORY_ICONS[p.category] || ""}</div>`;
      return `
      <tr>
        <td>${thumb}</td>
        <td>${p.name}</td>
        <td><span class="cat-tag">${cat.name}</span></td>
        <td>${p.price} ج.م</td>
        <td>
          <div class="lm-row-actions">
            <button class="lm-icon-btn" data-act="edit" data-id="${p.id}">✎</button>
            <button class="lm-icon-btn danger" data-act="delete" data-id="${p.id}">🗑</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  tableBody.querySelectorAll("button").forEach((btn) => {
    const id = Number(btn.dataset.id);
    if (btn.dataset.act === "edit") btn.addEventListener("click", () => editProduct(id));
    if (btn.dataset.act === "delete") btn.addEventListener("click", () => deleteProduct(id));
  });
}

renderTable();

// ---- تبديل التابات (المنتجات / الطلبات) ----
const tabProducts = document.getElementById("tabProducts");
const tabOrders = document.getElementById("tabOrders");
const productsView = document.getElementById("productsView");
const ordersView = document.getElementById("ordersView");
const ordersList = document.getElementById("ordersList");

tabProducts.addEventListener("click", () => {
  tabProducts.classList.add("active");
  tabOrders.classList.remove("active");
  productsView.style.display = "block";
  ordersView.style.display = "none";
});

tabOrders.addEventListener("click", () => {
  tabOrders.classList.add("active");
  tabProducts.classList.remove("active");
  productsView.style.display = "none";
  ordersView.style.display = "block";
  renderOrders();
});

function formatOrderDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
}

function renderOrders() {
  const orders = loadOrders();
  if (orders.length === 0) {
    ordersList.innerHTML = `<p style="color:var(--ink-soft); text-align:center; padding:40px 0;">لسه مفيش أي طلبات</p>`;
    return;
  }
  ordersList.innerHTML = orders
    .map((o) => {
      const itemsHtml = o.items
        .map((it) => {
          const owner = products.find((p) => p.id === it.id);
          const thumb = it.image
            ? `<img src="${it.image}" alt="${it.name}">`
            : CATEGORY_ICONS[owner?.category] || "";
          return `
          <div class="lm-order-item">
            <div class="lm-order-thumb">${thumb}</div>
            <span class="lm-order-item-name">${it.name}</span>
            <span class="lm-order-item-qty">×${it.qty}</span>
            <span class="lm-order-item-price">${it.price * it.qty} ج.م</span>
          </div>`;
        })
        .join("");
      return `
      <div class="lm-order-card">
        <div class="lm-order-head">
          <span class="lm-order-num">طلب #${o.number}</span>
          <span class="lm-order-date">${formatOrderDate(o.createdAt)}</span>
        </div>
        <div class="lm-order-customer">
          <span><b>الاسم:</b> ${o.customerName}</span>
          <span><b>الهاتف:</b> <a href="tel:${o.customerPhone}">${o.customerPhone}</a></span>
        </div>
        <div class="lm-order-items">${itemsHtml}</div>
        <div class="lm-order-totals">
          <span>الإجمالي: <b>${o.total} ج.م</b></span>
          <span>العربون المطلوب: <b>${o.deposit} ج.م</b></span>
        </div>
      </div>`;
    })
    .join("");
}
