<script lang="ts" setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useRegisterStore } from "@/stores/register_store";
import {
  requiredRule,
  emailRule,
  passwordRule,
  confirmPasswordRule,
} from "@/utils/validationRules";

const registerStore = useRegisterStore();
const router = useRouter();

const form = ref();
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");
const successDialog = ref(false);
const userName = ref("");
const userEmail = ref("");
const userPassword = ref("");
const confirmPassword = ref("");
const userRole = ref("");

const allRole = ref(["User", "Admin", "S-admin"]);

const showSnackbar = (message: string, color: string = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Validation ConfirmPassword
const confirmPasswordValidation = computed(
  () => (v: string) => confirmPasswordRule(v, userPassword.value)
);

const handleRegister = async () => {
  const result = await form.value?.validate();
  if (!result.valid) return;

  try {
    const response = await registerStore.register(
      userName.value,
      userEmail.value,
      userRole.value,
      userPassword.value
    );

    if (response.message === "มีผู้ใช้ที่อยู่ E-Mail นี้อยู่แล้ว") {
      showSnackbar(response.message, "error");
      return;
    }

    if (response.message) {
      //showSnackbar(response.message, "success");
      successDialog.value = true;
    } else {
      showSnackbar("สมัคสมาชิกไม่สำเร็จ!", "error");
    }
  } catch (error: any) {
    alert(error.message);
  }
};

const goToLogin = () => {
  successDialog.value = false;
  router.push("/login_page");
};
</script>

<template>
  <v-container>
    <v-card class="mx-auto mt-6" width="500">
      <template #prepend>
        <img
          src="../assets/images/icon-betask.png"
          class="mr-2"
          width="34"
          height="28"
        >
      </template>
      <template #title>
        <span class="font-weight-black">Register</span>
      </template>

      <v-form ref="form">
        <v-card-text>
          <v-text-field
            v-model="userName"
            required
            label="User Name"
            variant="outlined"
            :rules="[requiredRule]"
          />
          <v-text-field
            v-model="userEmail"
            required
            label="E-mail"
            variant="outlined"
            :rules="[requiredRule, emailRule]"
          />
          <v-select
            v-model="userRole"
            :items="allRole"
            required
            label="Role"
            variant="outlined"
            :rules="[requiredRule]"
          />
          <v-text-field
            v-model="userPassword"
            required
            label="Password"
            variant="outlined"
            type="password"
            :rules="[requiredRule, passwordRule]"
          />
          <v-text-field
            v-model="confirmPassword"
            required
            label="Confirm Password"
            variant="outlined"
            type="password"
            :rules="[requiredRule, confirmPasswordValidation]"
          />
        </v-card-text>

        <v-card-actions class="d-flex flex-column">
          <v-btn variant="tonal" class="w-100" @click="handleRegister"
            >Register</v-btn
          >
          <v-btn
            class="w-100 mt-2"
            variant="outlined"
            color="grey"
            to="/login_page"
            >Back to Login</v-btn
          >
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>

  <!-- save success dialog -->
  <v-dialog v-model="successDialog" max-width="400">
    <v-card class="pa-6 text-center">
      <v-col cols="12">
        <v-icon size="100" color="success">mdi-check-circle</v-icon>
      </v-col>
      <h2 class="mt-4 text-h5">สมัคสมาชิกสำเร็จ!</h2>
      <p class="mt-2">สร้างบัญชีผู้ใช้เรียบร้อย</p>
      <v-card-actions class="justify-center mt-4">
        <v-btn variant="tonal" width="100" color="success" @click="goToLogin">กลับสู่หน้า Login</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
