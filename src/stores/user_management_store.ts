import { defineStore } from "pinia";
import { updateUser, deleteUser } from "@/apis/user_management_api";
import { getAllUserStore } from "@/stores/auth_store";

export const useUserManagementStore = defineStore("userManagementStore", {
  state: () => ({
    loading: false,
  }),

  actions: {
    async updateUserDetails(userId: number, userData: { userName: string; userRole: string; userEmail: string }) {
      this.loading = true;
      try {
        const response = await updateUser(userId, userData);
        if (response.ok) {
          const allUserStore = getAllUserStore();
          const index = allUserStore.authUser.findIndex((user) => user.userId === userId);
          if (index !== -1) {
            allUserStore.authUser[index] = { ...allUserStore.authUser[index], ...userData };
          }
        }
      } catch (error) {
        console.error("Error updating user:", error);
      } finally {
        this.loading = false;
      }
    },

    async removeUser(userId: number) {
      this.loading = true;
      try {
        const response = await deleteUser(userId);
        if (response.ok) {
          // ลบข้อมูลใน auth_store แทน
          const allUserStore = getAllUserStore();
          allUserStore.authUser = allUserStore.authUser.filter((user) => user.userId !== userId);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
