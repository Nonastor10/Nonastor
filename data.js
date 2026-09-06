// بيانات مشتركة بين صفحة المتجر وصفحة الأدمن
// المنتجات والطلبات دلوقتي متخزنة على Firebase (Firestore) - يعني كل الأجهزة
// بتشوف نفس البيانات لحظيًا. السلة نفسها بتفضل في كل جهاز لوحده (وده طبيعي ومنطقي).

const NONA_CART_KEY = "nona_cart";

// رقم محفظة فودافون كاش لاستلام العربون، ونفس الرقم على واتساب لتأكيد الطلب
const STORE_PHONE_DISPLAY = "01154257411";
const STORE_WHATSAPP = "201154257411"; // بصيغة دولية من غير + وصفر البداية

const CATEGORIES = [
  { id: "rings", name: "خواتم" },
  { id: "bracelets", name: "أساور" },
  { id: "necklaces", name: "عقود" },
  { id: "earrings", name: "أقراط" },
  { id: "hair", name: "إكسسوارات شعر" },
];

const DEFAULT_PRODUCTS = [
  { name: "خاتم لؤلؤة القمر", price: 350, category: "rings", desc: "فضة مطلية بالذهب مع لؤلؤة صناعية", image: null },
  { name: "خاتم عقدة الحب", price: 280, category: "rings", desc: "تصميم متشابك بسيط وأنيق", image: null },
  { name: "سوار همسة ذهبية", price: 420, category: "bracelets", desc: "سلسلة رفيعة قابلة للتعديل", image: null },
  { name: "سوار تعدد الطبقات", price: 380, category: "bracelets", desc: "ثلاث طبقات متداخلة", image: null },
  { name: "عقد قطرة الفجر", price: 550, category: "necklaces", desc: "حجر كريستالي معلّق", image: null },
  { name: "عقد الاسم الذهبي", price: 600, category: "necklaces", desc: "يُصنع حسب الاسم المطلوب", image: null },
  { name: "أقراط تعليقة اللؤلؤ", price: 300, category: "earrings", desc: "لؤلؤة واحدة معلقة", image: null },
  { name: "أقراط الهوائية الذهبية", price: 260, category: "earrings", desc: "حلقات دائرية كلاسيكية", image: null },
  { name: "طوق شعر أميرة", price: 220, category: "hair", desc: "قماش مخملي فاخر", image: null },
  { name: "مشبك شعر أوراق الذهب", price: 180, category: "hair", desc: "تصميم ورقة نباتية", image: null },
];

// أيقونات SVG بسيطة لكل فئة (تُستخدم لو المنتج من غير صورة)
const CATEGORY_ICONS = {
  rings: `<svg viewBox="0 0 48 48" fill="none" stroke="#A9822F" stroke-width="1.6"><circle cx="24" cy="27" r="12"/><path d="M18 17 L24 8 L30 17" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bracelets: `<svg viewBox="0 0 48 48" fill="none" stroke="#A9822F" stroke-width="1.6"><circle cx="24" cy="24" r="15"/><circle cx="24" cy="24" r="9"/></svg>`,
  necklaces: `<svg viewBox="0 0 48 48" fill="none" stroke="#A9822F" stroke-width="1.6"><path d="M10 12 C10 26 16 34 24 34 C32 34 38 26 38 12" stroke-linecap="round"/><circle cx="24" cy="34" r="3.5" fill="#A9822F"/></svg>`,
  earrings: `<svg viewBox="0 0 48 48" fill="none" stroke="#A9822F" stroke-width="1.6"><circle cx="24" cy="14" r="4"/><path d="M24 18 L24 26" stroke-linecap="round"/><path d="M18 26 C18 33 30 33 30 26" stroke-linecap="round"/></svg>`,
  hair: `<svg viewBox="0 0 48 48" fill="none" stroke="#A9822F" stroke-width="1.6"><path d="M24 10 C18 10 14 15 16 21 C10 21 8 27 12 31 C10 37 16 40 21 37 C21 43 27 43 27 37 C32 40 38 37 36 31 C40 27 38 21 32 21 C34 15 30 10 24 10 Z" stroke-linejoin="round"/></svg>`,
};

function catInfo(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

// ---- Firestore refs ----
const productsCol = db.collection("products");
const ordersCol = db.collection("orders");
const countersDoc = db.collection("meta").doc("counters");

let seeded = false;
async function ensureSeedProducts() {
  if (seeded) return;
  seeded = true;
  const snap = await productsCol.limit(1).get();
  if (snap.empty) {
    const batch = db.batch();
    DEFAULT_PRODUCTS.forEach((p) => {
      const ref = productsCol.doc();
      batch.set(ref, { ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
  }
}

// callback(products) بيتنادى فورًا وبعدين تاني كل مرة تتغير فيها البيانات على أي جهاز
function subscribeProducts(callback) {
  ensureSeedProducts();
  return productsCol.orderBy("createdAt", "asc").onSnapshot((snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

async function addProduct(product) {
  await productsCol.add({ ...product, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

async function updateProduct(id, product) {
  await productsCol.doc(id).update(product);
}

async function deleteProductDoc(id) {
  await productsCol.doc(id).delete();
}

async function nextOrderNumber() {
  return db.runTransaction(async (t) => {
    const doc = await t.get(countersDoc);
    const current = doc.exists && doc.data().nextOrderNumber ? doc.data().nextOrderNumber : 1001;
    t.set(countersDoc, { nextOrderNumber: current + 1 }, { merge: true });
    return current;
  });
}

async function addOrder(order) {
  await ordersCol.add({ ...order, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
}

async function deleteOrderDoc(id) {
  await ordersCol.doc(id).delete();
}

function subscribeOrders(callback) {
  return ordersCol.orderBy("createdAt", "desc").onSnapshot((snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ---- السلة: بتفضل محلية على كل جهاز، وده طبيعي (سلة كل عميل خاصة بيه) ----
function loadCart() {
  try {
    const raw = localStorage.getItem(NONA_CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(NONA_CART_KEY, JSON.stringify(cart));
}
