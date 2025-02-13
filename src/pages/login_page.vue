<script lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "../stores/auth_store";
import { requiredRule, emailRule, passwordRule } from "@/utils/validationRules";

export default {
  setup() {
    const authStore = useLoginStore();
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

      const response = await authStore.login(
        userEmail.value,
        userPassword.value
      );

      if (response.ok) {
        const userRole = authStore.authUser?.userRole;

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
        snackbarMessage.value =
          response.error || "Login failed. Please try again.";
        showSnackbar(snackbarMessage.value, "error");
      }
    };

    const goToRegister = () => {
      router.push("/register_page");
    };

    return {
      form,
      snackbar,
      snackbarMessage,
      userEmail,
      userPassword,
      handleLogin,
      requiredRule,
      emailRule,
      passwordRule,
      goToRegister,
      snackbarColor,
    };
  },
};
</script>

<template>
  <v-form ref="form">
    <v-card class="mx-auto ma-6" prepend-icon="$vuetify" width="400">
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
        <v-btn variant="tonal" class="w-100" @click="goToRegister">
          Register
        </v-btn>
      </v-col>
    </v-card>
  </v-form>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="5000">
    {{ snackbarMessage }}
  </v-snackbar>
</template>
