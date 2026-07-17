import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  toggle: (productId: string) => void
  isFavorite: (productId: string) => boolean
  setFavorites: (ids: string[]) => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggle: (productId) => {
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        }))
      },

      isFavorite: (productId) => get().favorites.includes(productId),

      setFavorites: (ids) => set({ favorites: ids }),
    }),
    { name: 'ulthor-favorites' }
  )
)
