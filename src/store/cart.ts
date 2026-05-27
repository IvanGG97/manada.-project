import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
  stock: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          // Check stock before adding
          const newQuantity = existingItem.quantity + (item.quantity || 1)
          if (newQuantity <= item.stock) {
            set({
              items: currentItems.map((i) =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              ),
            })
          }
        } else {
          set({ items: [...currentItems, { ...item, quantity: item.quantity || 1 }] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity === 0) {
          get().removeItem(id)
          return
        }
        
        const currentItems = get().items
        const item = currentItems.find((i) => i.id === id)
        
        if (item && quantity <= item.stock) {
          set({
            items: currentItems.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'manada-cart-storage', // name of the item in the storage (must be unique)
    }
  )
)