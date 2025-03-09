<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore, useAuthStore } from "../stores/auth_store";
import { requiredRule, emailRule, passwordRule } from "@/utils/validationRules";

const loginStore = useLoginStore();
const authStore = useAuthStore();
const router = useRouter();

const form = ref();
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("error");
const userEmail = ref("");
const userPassword = ref("");

const showSnackbar = (message: string, color: string = "error") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

const handleLogin = async () => {
  const result = await form.value?.validate();
  if (!result.valid) return;

  const response = await loginStore.login(userEmail.value, userPassword.value);

  if (response.ok) {
    const token = response.data.token;
    const userRole = loginStore.authUser?.userRole;

    authStore.setToken(token);

    localStorage.setItem("authToken", token);

    if (userRole === "User" || userRole === "Admin") {
      router.push("/report_page");
    } else if (userRole === "S-admin") {
      router.push("/upload_file_page");
    } else {
      showSnackbar("ไม่สามารถเข้าสู่ระบบได้", "error");
    }
  } else {
    userEmail.value = "";
    userPassword.value = "";
    snackbarMessage.value = response.error || "Login failed. Please try again.";
    showSnackbar(snackbarMessage.value, "error");
  }
};

const goToRegister = () => {
  router.push("/register_page");
};
</script>

<template>
  <v-form ref="form">
    <v-card class="mx-auto ma-6" width="400">
      <template #prepend>
          <img
            src="../assets/images/icon-betask.png"
            class="mr-2"
            width="34"
            height="28"
          >
        </template>
      <template #title>
        <span class="font-weight-black">Welcome to BeConvert</span>
      </template>

      <v-col>
        <v-text-field
          v-model="userEmail"
          required
          :rules="[requiredRule, emailRule]"
          label="E-mail"
          variant="outlined"
        />

        <v-text-field
          v-model="userPassword"
          required
          label="Password"
          variant="outlined"
          type="password"
          :rules="[requiredRule, passwordRule]"
        />

        <v-btn variant="tonal" class="w-100" @click="handleLogin">
          Login
        </v-btn>
        <!-- Register Page -->
        <hr class="mt-2 mb-2" />
        <v-btn variant="outlined" color="grey" class="w-100" @click="goToRegister">
          Register
        </v-btn>
      </v-col>
    </v-card>
  </v-form>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
