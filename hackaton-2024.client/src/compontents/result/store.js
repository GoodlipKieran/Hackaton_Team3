import { create } from "zustand";

export const resultStore = create((set) => ({
  jsonString: "",
  setJsonString: (jsonString) => set({ jsonString }),
  isNew: true,
  setIsNew: (isNew) => set({ isNew }),
  tableNames: [],
  setTableNames: (tableNames) => set({ tableNames }),
}));
