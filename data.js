// بيانات مشتركة بين صفحة المتجر وصفحة الأدمن
// كل حاجة متخزنة في localStorage عشان تفضل موجودة بعد ما تعملي رفع/استضافة

const NONA_PRODUCTS_KEY = "nona_products";
const NONA_CART_KEY = "nona_cart";
const NONA_ORDER_SEQ_KEY = "nona_order_seq";

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
  { id: 1, name: "خاتم لؤلؤة القمر", price: 350, category: "rings", desc: "فضة مطلية بالذهب مع لؤلؤة صناعية", image: null },
  { id: 2, name: "خاتم عقدة الحب", price: 280, category: "rings", desc: "تصميم متشابك بسيط وأنيق", image: null },
  { id: 3, name: "سوار همسة ذهبية", price: 420, category: "bracelets", desc: "سلسلة رفيعة قابلة للتعديل", image: null },
  { id: 4, name: "سوار تعدد الطبقات", price: 380, category: "bracelets", desc: "ثلاث طبقات متداخلة", image: null },
  { id: 5, name: "عقد قطرة الفجر", price: 550, category: "necklaces", desc: "حجر كريستالي معلّق", image: null },
  { id: 6, name: "عقد الاسم الذهبي", price: 600, category: "necklaces", desc: "يُصنع حسب الاسم المطلوب", image: null },
  { id: 7, name: "أقراط تعليقة اللؤلؤ", price: 300, category: "earrings", desc: "لؤلؤة واحدة معلقة", image: null },
  { id: 8, name: "أقراط الهوائية الذهبية", price: 260, category: "earrings", desc: "حلقات دائرية كلاسيكية", image: null },
  { id: 9, name: "طوق شعر أميرة", price: 220, category: "hair", desc: "قماش مخملي فاخر", image: null },
  { id: 10, name: "مشبك شعر أوراق الذهب", price: 180, category: "hair", desc: "تصميم ورقة نباتية", image: null },
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

function loadProducts() {
  try {
    const raw = localStorage.getItem(NONA_PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(NONA_PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return [...DEFAULT_PRODUCTS];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [...DEFAULT_PRODUCTS];
  }
}

function saveProducts(products) {
  localStorage.setItem(NONA_PRODUCTS_KEY, JSON.stringify(products));
}

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

function nextOrderNumber() {
  const current = parseInt(localStorage.getItem(NONA_ORDER_SEQ_KEY) || "1000", 10);
  const next = current + 1;
  localStorage.setItem(NONA_ORDER_SEQ_KEY, String(next));
  return next;
}
