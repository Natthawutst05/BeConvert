<script lang="ts">
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
      showSnackbar(response.message, "success");
      router.push("/login_page");
    } else {
      showSnackbar("สมัคสมาชิกไม่สำเร็จ!", "error");
    }
  } catch (error: any) {
    alert(error.message);
  }
};
</script>

<template>
  <v-container>
    <v-card class="mx-auto mt-6" width="500">
      <v-card-title class="text-h5 text-center">Register</v-card-title>

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
</template>
