<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore, getAllUserStore } from "../stores/auth_store";
import { useReportStore } from "../stores/report_store";
import { useAccessReportStore } from "../stores/report2_store";
import { useFileUploadStore } from "../stores/fileupload_store";
import { useFileAccessUploadStore } from "../stores/fileupload2_store";

const router = useRouter();
const loginStore = useLoginStore();
const isSAdmin = computed(() => loginStore.authUser?.userRole === "S-admin");

const filteredMenuItems = computed(() => {
  if (isSAdmin.value) {
    return menuItems;
  } else {
    return menuItems.filter(
      (item) =>
        item.to !== "/upload_file_page" && item.to !== "/upload_file2_page"
    );
  }
});

const menuItems = [
  { text: "Home", icon: "ri-home-line mr-2", to: "/" },
  { text: "Upload SlowQuery File", icon: "ri-upload-line mr-2", to: "/upload_file_page" },
  { text: "Upload Access File", icon: "ri-upload-line mr-2", to: "/upload_file2_page" },
  { text: "SlowQuery Report", icon: "ri-file-text-line mr-2", to: "/report_page" },
  { text: "Access Report", icon: "ri-file-text-line mr-2", to: "/report2_page" },
];

const drawer = ref(true);
const rail = ref(true);

const resetAllStores = () => {
  const allUserStore = getAllUserStore();
  const reportStore1 = useReportStore();
  const reportStore2 = useAccessReportStore();
  const uploadStore1 = useFileUploadStore();
  const uploadStore2 = useFileAccessUploadStore();

  loginStore.$reset();
  allUserStore.$reset();
  reportStore1.$reset();
  reportStore2.$reset();
  uploadStore1.$reset();
  uploadStore2.$reset();
};

const handleLogout = () => {
  resetAllStores();
  router.push("/login_page");
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
      <v-list-item
        title="BeTask"
      >
        <template #prepend>
          <img
            src="../assets/images/icon-betask.png"
            class="mr-4"
            width="34"
            height="28"
          >
        </template>
        <template
          #append
        >
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
          v-for="(item, index) in filteredMenuItems"
          :key="index"
          :to="item.to"
          link
          @click="item.text === 'Logout' ? handleLogout() : null"
        >
          <v-list-item>
            <template #prepend>
              <i :class="item.icon" />
            </template>
            {{ item.text }}
          </v-list-item>
        </v-list-item>
      </v-list>
    </v-list>
    <template #append>
      <div class="pa-2">
        <v-btn
          block
          color="error"
          @click="handleLogout()"
        >
          <i
            v-if="rail"
            class="ri-logout-box-line"
          />
          <template v-else>
            <i class="ri-logout-box-line mr-2" /> Logout
          </template>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>
