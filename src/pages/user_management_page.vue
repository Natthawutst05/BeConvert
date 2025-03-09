<script lang="ts" setup>
import { ref, computed, onMounted, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import "remixicon/fonts/remixicon.css";
import { useLoginStore, getAllUserStore } from "../stores/auth_store";
import { useUserManagementStore } from "@/stores/user_management_store";
import { AuthModel } from "@/models/auth_model";
import { requiredRule } from "@/utils/validationRules";

const allUserStore = getAllUserStore();
const userStore = useUserManagementStore();
const { loading } = storeToRefs(userStore);
const { authUser } = storeToRefs(allUserStore);
const loginStore = useLoginStore();
const form = ref();

//Snackbar
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");

const showSnackbar = (message: string, color: string = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Dialog Controls
const activeDialogId = ref<number | null>(null);
const isDialogOpen = computed(() => activeDialogId.value !== null);
const successDialog = ref(false);

// Status List
const userRoleList = ref(["User", "Admin", "S-admin"]);

// Filter role,user
const selectedRole = ref<string | null>(null);
const selectedUser = ref<string | null>(null);
const filteredUsers = ref<AuthModel[]>([]);
const applyFilter = () => {
  filteredUsers.value = authUser.value.filter(
    (user) =>
      (!selectedRole.value || user.userRole === selectedRole.value) &&
      (!selectedUser.value || user.userName === selectedUser.value)
  );
};

const resetDataFilter = () => {
  selectedRole.value = null;
  selectedUser.value = null;
};

// Service List
const rolelist = computed(() => Array.from(new Set(authUser.value.map((user) => user.userRole))));
// User List
const userlist = ref<string[]>([]);

// DataTable Header
const headers = [
  { title: "User ID", key: "userId" },
  { title: "UserName", key: "userName" },
  { title: "E-mail", key: "userEmail" },
  { title: "Role", key: "userRole" },
  { title: "Action", key: "action" },
];

// State สำหรับข้อมูล row ที่เลือก
const selectedRow = reactive<AuthModel>({
  userId: null,
  userName: "",
  userEmail: "",
  userRole: "",
});

const selectRow = (row: AuthModel) => {
  activeDialogId.value = row.userId;
  Object.assign(selectedRow, row);
};

const saveDialogData = async () => {
  if (!selectedRow.userId) return;
  const result = await form.value?.validate();
  if (!result.valid) return;

  const payload = {
    userName: selectedRow.userName,
    userEmail: selectedRow.userEmail,
    userRole: selectedRow.userRole,
  };

  try {
    await userStore.updateUserDetails(selectedRow.userId, payload);

    const index = authUser.value.findIndex((user) => user.userId === selectedRow.userId);
    if (index !== -1) {
      authUser.value[index] = { ...authUser.value[index], ...payload };
    }

    //showSnackbar("บันทึกข้อมูลสำเร็จ!", "success");
    successDialog.value = true;
    activeDialogId.value = null;
  } catch (error) {
    console.error("Error saving data:", error);
    showSnackbar("เกิดข้อผิดพลาด กรุณาลองใหม่!", "error");
  }
};

const deleteUser = async (userId: number) => {
  try {
    await userStore.removeUser(userId);
    authUser.value = authUser.value.filter((user) => user.userId !== userId);

    showSnackbar("ลบผู้ใช้สำเร็จ!", "success");
  } catch (error) {
    console.error("Error deleting user:", error);
    showSnackbar("ไม่สามารถลบผู้ใช้ได้!", "error");
  }
};


onMounted(async () => {
  try {
    await allUserStore.fetchAllUserData();
    userlist.value = allUserStore.authUser.map((user) => user.userName);
    filteredUsers.value = [...authUser.value];
  } catch (error) {
    console.error("Error loading data:", error);
  }
});
</script>

<template>
  <v-col cols="12" class="pa-6">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>
    <!-- Card Content -->
    <v-card  >
      <v-row class="pa-4">
        <v-col cols="6">
          <v-select
            label="User"
            variant="outlined"
            :items="userlist"
            v-model="selectedUser"
          />
        </v-col>
        <v-col cols="4">
          <v-select
            label="Role"
            variant="outlined"
            :items="rolelist"
            v-model="selectedRole"
          />
        </v-col>
        <v-col cols="1">
          <v-btn height="56px" @click="applyFilter">
            <i class="ri-search-2-line mr-2"></i> Search
          </v-btn>
        </v-col>
        <v-col cols="1">
          <v-btn height="56px" @click="resetDataFilter">
            <i class="ri-loop-left-line mr-2"></i> Clear
          </v-btn>
        </v-col>
      </v-row>
      <!-- Data Table -->
      <v-data-table
        :items="filteredUsers"
        :headers="headers"
        item-value="index"
        class="elevation-1"
        style="min-height: 690px;"
      >
        <!-- Action Dialog -->
        <template #item.action="{ item }">
          <v-btn @click="selectRow(item)">
            <i class="ri-edit-box-line"></i>
          </v-btn>
          <v-btn @click="deleteUser(item.userId)">
            <i class="ri-delete-bin-2-line"></i>
          </v-btn>
          <v-dialog
            v-if="activeDialogId === item.userId"
            v-model="isDialogOpen"
            max-width="1300"
          >
            <!--Dialog Content-->
            <template v-slot:default>
              <v-card title="Management">
                <v-form ref="form">
                  <v-row>
                    <v-col cols="6" class="pl-9">
                      <v-text-field
                        label="User ID"
                        variant="outlined"
                        v-model="selectedRow.userId"
                        disabled
                      />
                    </v-col>
                    <v-col cols="6" class="pr-9">
                      <v-text-field
                        label="UserName"
                        variant="outlined"
                        v-model="selectedRow.userName"
                        :rules="[requiredRule]"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6" class="pl-9">
                      <v-text-field
                        label="E-mail"
                        variant="outlined"
                        v-model="selectedRow.userEmail"
                        :rules="[requiredRule]"
                      />
                    </v-col>
                    <v-col cols="6" class="pr-9">
                      <v-select
                        label="Role"
                        variant="outlined"
                        :items="userRoleList"
                        v-model="selectedRow.userRole"
                        :rules="[requiredRule]"
                      />
                    </v-col>
                  </v-row>
                </v-form>
                <!-- Action -->
                <v-card-actions class="pa-6 pt-0">
                  <v-spacer />
                  <v-btn
                    text="Save"
                    variant="text"
                    @click="saveDialogData()"
                  />
                  <v-btn
                    color="error"
                    text="Cancel"
                    variant="outlined"
                    @click="activeDialogId = null;"
                  />
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </template>
      </v-data-table>
    </v-card>
  </v-col>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>

  <!-- save success dialog -->
  <v-dialog v-model="successDialog" max-width="400">
    <v-card class="pa-6 text-center">
      <v-col cols="12">
        <v-icon size="100" color="success">mdi-check-circle</v-icon>
      </v-col>
      <h2 class="mt-4 text-h5">บันทึกข้อมูลสำเร็จ!</h2>
      <p class="mt-2">ข้อมูลได้รับการอัปเดตเรียบร้อย</p>
      <v-card-actions class="justify-center mt-4">
        <v-btn variant="tonal" width="100" color="success" @click="successDialog = false">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Loading -->
  <v-dialog v-model="loading" persistent width="300">
    <v-card class="pa-4 d-flex flex-column align-center">
      <v-progress-circular indeterminate size="50" color="primary" />
      <p class="mt-3">Loading...</p>
    </v-card>
  </v-dialog>
</template>
