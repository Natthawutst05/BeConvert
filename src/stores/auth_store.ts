import { defineStore } from "pinia";
import { loginUser, fetchAllUsers } from "../apis/auth_api";
import { ResponseStandard } from "../models/response_standard"
import { AuthModel } from "../models/auth_model"

export const useLoginStore = defineStore("loginStore", {
  state: () => ({
    authUser: {} as AuthModel
  }),

  actions: {
    async login(userEmail: string, userPassword: string): Promise<ResponseStandard> {
      try {
        const response = await loginUser(userEmail, userPassword);

        if (!response.ok) {
          return response;
        }

        this.authUser = response.data;

        return { ok: true, data: this.authUser, error: null };
      } catch (error) {
        return { ok: false, data: null, error: error.message || "Login failed" };
      }
    },

    logout() {
      // this.authUser = {} as AuthModel; // เคลียร์ค่า authUser เมื่อล็อกเอาต์
      this.$reset();
      sessionStorage.removeItem("authUser");
    },

    persist: {
      enabled: true,
      strategies: [
        {
          key: "authUser",
          storage: sessionStorage, // ใช้ sessionStorage
        },
      ],
    },
  },
});

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    token: localStorage.getItem("authToken") || "",
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem("authToken", token);
    },
    logout() {
      this.$reset(); // ใช้ $reset() เพื่อเคลียร์ state
      localStorage.removeItem("authToken"); // ล้าง localStorage
    },
  },
});

export const getAllUserStore = defineStore('alluserStore', {
  state: () => ({
    authUser: [] as AuthModel[],
  }),
  actions: {
    async fetchAllUserData() {
      this.authUser = [] as AuthModel[]
      const response = await fetchAllUsers();
      if (response.ok) {
        this.authUser = response.data as AuthModel[];
      } else {
        console.error('Error fetching update data:', response.error);
      }
    },
  },
});
