<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useLoginStore } from "../stores/auth_store";
import { requiredRule, emailRule, passwordRule } from "@/utils/validationRules";

export default {
  setup() {
    const authStore = useLoginStore();
    const userEmail = ref("");
    const userPassword = ref("");
    const snackbar = ref(false);
    const snackbarMessage = ref("");

    const router = useRouter();

    const handleLogin = async () => {
      snackbarMessage.value = "";
      const response = await authStore.login(userEmail.value, userPassword.value);

      if (response.ok) {
        router.push("/upload_file_page");
      } else {
        userEmail.value = "";
        userPassword.value = "";
        snackbarMessage.value = response.error || "Login failed. Please try again.";
      }
    };

    const goToRegister = () => {
      router.push("/register_page");
    };

    return {
      snackbar,
      snackbarMessage,
      userEmail,
      userPassword,
      handleLogin,
      requiredRule,
      emailRule,
      passwordRule,
      goToRegister,
    };
  },
};
</script>

<template>
  <v-card
    class="mx-auto ma-6"
    prepend-icon="$vuetify"
    width="400"
  >
    <template #title>
      <span class="font-weight-black">Welcome to BeConvert</span>
    </template>

    <v-col>
      <v-text-field
        v-model="userEmail"
        :rules="[requiredRule, emailRule]"
        label="E-mail"
        variant="outlined"
      />

      <v-text-field
        v-model="userPassword"
        label="Password"
        variant="outlined"
        type="password"
        :rules="[requiredRule, passwordRule]"
      />

      <v-btn
        variant="tonal"
        class="w-100"
        @click="handleLogin"
      >
        Login
      </v-btn>
      <!-- Register Page -->
      <hr
        class="mt-2 mb-2"
      >
      <v-btn
        variant="tonal"
        class="w-100"
        @click="goToRegister"
      >
        Register
      </v-btn>
    </v-col>
  </v-card>
  <!-- <v-snackbar
    v-model="snackbar"
    :timeout="3000"
    color="error"
  >
    {{ snackbarMessage }}
    <template #actions>
      <v-btn
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar> -->
</template>
