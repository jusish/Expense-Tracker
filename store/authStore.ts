import { User } from "@/types";
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
}

interface AuthStoreActions {
  setUser: (user: User | null) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isReady: false,
  setUser: (user: User | null) =>
    set({ user, isAuthenticated: !!user, isReady: true }),
  logout: () => set({ user: null, isAuthenticated: false, isReady: true }),
  hydrate: async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      console.log("Hydrate: userString from AsyncStorage:", userString);
      if (userString) {
        const user = JSON.parse(userString);
        console.log("Hydrate: parsed user:", user);
        set({ user, isAuthenticated: true, isReady: true });
      } else {
        console.log("Hydrate: no user found");
        set({ user: null, isAuthenticated: false, isReady: true });
      }
    } catch (e) {
      console.log("Hydrate: error", e);
      set({ user: null, isAuthenticated: false, isReady: true });
    }
  },
}));
