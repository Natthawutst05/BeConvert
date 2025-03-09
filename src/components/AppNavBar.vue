<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore, getAllUserStore } from "../stores/auth_store";
import { useReportStore } from "../stores/report_store";
import { useAccessReportStore } from "../stores/report2_store";

const router = useRouter();
const loginStore = useLoginStore();
const isSAdmin = computed(() => loginStore.authUser?.userRole === "S-admin");

const drawer = ref(true);
const rail = ref(true);

const menuItems = computed(() => {
  const items = [
    { text: "Home", icon: "ri-home-line mr-2", to: "/" },
    { text: "SlowQuery Report", icon: "ri-file-text-line mr-2", to: "/report_page" },
    { text: "Access Report", icon: "ri-file-text-line mr-2", to: "/report2_page" },
  ];

  if (loginStore.authUser?.userRole === "Admin") {
    items.push({ text: "User Management", icon: "ri-group-line mr-2", to: "/user_management_page" });
  }

  if (isSAdmin.value) {
    items.push(
      { text: "Upload SlowQuery File", icon: "ri-upload-2-line mr-2", to: "/upload_file_page" },
      { text: "Upload Access File", icon: "ri-upload-2-line mr-2", to: "/upload_file2_page" },
    );
  }

  return items;
});

const resetAllStores = () => {
  const allUserStore = getAllUserStore();
  const reportStore1 = useReportStore();
  const reportStore2 = useAccessReportStore();

  loginStore.$reset?.();
  allUserStore.$reset?.();
  reportStore1.resetStore();
  reportStore2.resetStore();

  localStorage.removeItem("authToken");
};

const handleLogout = async () => {
  resetAllStores();
  await router.replace("/login_page");
};
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    :rail="rail"
    permanent
    rail-width="65"
    @click="rail = false"
  >
    <v-list>
      <v-list-item title="BeConvert">
        <template #prepend>
          <img
            src="../assets/images/icon-betask.png"
            class="mr-4"
            width="34"
            height="28"
          >
        </template>
        <template #append>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            @click.stop="rail = !rail"
          />
        </template>
      </v-list-item>

      <v-divider />

      <v-list
        density="compact"
        nav
      >
        <v-list-item
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.to"
          link
        >
          <template #prepend>
            <span
              :class="item.icon"
              class="ml-1"
              style="font-size: 24px;"
            />
          </template>
          {{ item.text }}
        </v-list-item>
      </v-list>
    </v-list>

    <template #append>
      <v-list nav>
        <v-list-item
          link
          class="text"
          @click="handleLogout"
        >
          <template #prepend>
            <i
              class="ri-logout-box-line mr-2 ml-1"
              style="font-size: 24px;"
            />
          </template>
          Logout
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>
