import { create } from 'zustand';

// Baskı ücretsiz promosyonu — false yapınca normal fiyatlar aktif olur
export const PRINT_PROMO_ACTIVE = true;

const PRINT_PRICES = { none: 0, front: 5.0, back: 5.0, both: 8.0 };

export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product, color, size, qty = 1, printType = 'none') => {
    const printCost = PRINT_PROMO_ACTIVE ? 0 : PRINT_PRICES[printType];
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
  getTotalPrice: () => get().items.reduce((acc, item) => acc + (item.price * item.qty), 0),
  getTotalQty: () => get().items.reduce((acc, item) => acc + item.qty, 0),
}));
