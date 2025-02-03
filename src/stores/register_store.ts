import { defineStore } from "pinia";
import { registerUser } from "../apis/register_api";

export const useRegisterStore = defineStore("register", {
  actions: {
    async register(userName: string, userEmail: string, userPassword: string) {
      try {
        const response = await registerUser(userName, userEmail, userPassword);
        return response;
      } catch (error: any) {
        return { message: error.message };
      }
    },
  },
});
