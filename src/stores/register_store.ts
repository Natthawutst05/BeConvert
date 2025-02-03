import { defineStore } from "pinia";
import { registerUser } from "../apis/register_api";
import { ResponseStandard } from "../models/response_standard";
import { RegisterModel } from "../models/register_model";

export const useRegisterStore = defineStore("register", {
  state: () => ({
    registeredUser: {} as RegisterModel,
  }),

  actions: {
    async register(username: string, email: string, password: string): Promise<ResponseStandard> {
      try {
        const response = await registerUser(username, email, password);

        if (!response.ok) {
          return response;
        }

        this.registeredUser = response.data;

        return { ok: true, data: this.registeredUser, error: null };
      } catch (error) {
        return { ok: false, data: null, error: error.message || "Registration failed" };
      }
    },
  },
});
