import { create } from "zustand";

export const userStore = create((set) => ({
  user: {
    email: "",
    role: "",
  },
  setUser: (user) => set({ user }),
}));
