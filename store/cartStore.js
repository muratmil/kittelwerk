import { create } from 'zustand';

export const FREE_PRINT_TYPES = ['none', 'front', 'back', 'both', 'bestickung', 'siebdruck'];

export function getTieredPrice(product, qty) {
  if (!product.tiers || product.tiers.length === 0) return product.newPrice;
  const sorted = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
  const tier = sorted.find(t => qty >= t.minQty);
  return tier ? tier.price : product.newPrice;
}

const PRINT_PRICES = { none: 0, front: 5.0, back: 5.0, both: 5.0, bestickung: 0, siebdruck: 0 };

export const DISCOUNT_CODES = { 'KITTEL10': 5 };

export const FREE_SHIPPING_THRESHOLD = 300;

export function calcShipping(subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  if (subtotal >= 100) return 14.90;
  return 9.90;
}

export const useCartStore = create((set, get) => ({
  items: [],
  appliedCode: null,
  discountPercent: 0,

  // sizes: { XS: 2, S: 3, M: 5 } veya { '-': 10 } (bedensiz ürünler için)
  addItem: (product, color, sizes, qty, printType = 'none', fabric = null) => {
    const printCost = FREE_PRINT_TYPES.includes(printType) ? 0 : PRINT_PRICES[printType];
    const price = getTieredPrice(product, qty) + printCost;
    set((state) => {
      const existing = state.items.find(
        i => i.id === product.id && i.color === color && i.printType === printType && i.fabric === fabric
      );
      if (existing) {
        return {
          items: state.items.map(i =>
            (i.id === product.id && i.color === color && i.printType === printType && i.fabric === fabric)
              ? { ...i, sizes, qty }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...product, color, sizes, qty, price, printType, fabric }] };
    });
  },

  removeItem: (id, color, printType, fabric = null) => set((state) => ({
    items: state.items.filter(i => !(i.id === id && i.color === color && i.printType === printType && i.fabric === fabric)),
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
  getShippingCost: () => calcShipping(get().getSubtotal()),
  getFinalTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const shipping = get().getShippingCost();
    return subtotal - discount + shipping;
  },

  getTotalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.qty), 0),
  getTotalQty: () => get().items.reduce((acc, item) => acc + item.qty, 0),
}));
