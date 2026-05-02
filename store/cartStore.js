import { create } from 'zustand';

// Ücretsiz baskı seçenekleri — ['none'] yapınca hepsi ücretli olur
export const FREE_PRINT_TYPES = ['none', 'front'];

const PRINT_PRICES = { none: 0, front: 5.0, back: 5.0, both: 5.0 };

// Rabatt kodları — { KOD: yüzde }
export const DISCOUNT_CODES = { 'KITTEL10': 10 };

export const SHIPPING_COST = 5.90;
export const FREE_SHIPPING_THRESHOLD = 300;

export const useCartStore = create((set, get) => ({
  items: [],
  appliedCode: null,
  discountPercent: 0,

  addItem: (product, color, size, qty = 1, printType = 'none') => {
    const printCost = FREE_PRINT_TYPES.includes(printType) ? 0 : PRINT_PRICES[printType];
    const price = product.newPrice + printCost;
    set((state) => {
      const existing = state.items.find(i => i.id === product.id && i.color === color && i.size === size);
      if (existing) {
        return {
          items: state.items.map(i =>
            (i.id === product.id && i.color === color && i.size === size)
              ? { ...i, qty: i.qty + qty } : i
          )
        };
      }
      return { items: [...state.items, { ...product, color, size, qty, price, printType }] };
    });
  },

  removeItem: (id, color, size) => set((state) => ({
    items: state.items.filter(i => !(i.id === id && i.color === color && i.size === size))
  })),

  applyCode: (code) => {
    const upper = code.trim().toUpperCase();
    const percent = DISCOUNT_CODES[upper];
    if (percent) {
      set({ appliedCode: upper, discountPercent: percent });
      return { success: true };
    }
    return { success: false };
  },

  removeCode: () => set({ appliedCode: null, discountPercent: 0 }),

  getSubtotal: () => get().items.reduce((acc, item) => acc + (item.price * item.qty), 0),
  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return subtotal * get().discountPercent / 100;
  },
  getShippingCost: () => {
    const subtotal = get().getSubtotal();
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  },
  getFinalTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingCost();
    return subtotal - discount + shipping;
  },

  getTotalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.qty), 0),
  getTotalQty: () => get().items.reduce((acc, item) => acc + item.qty, 0),
}));
