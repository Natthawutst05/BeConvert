<script lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useRegisterStore } from "@/stores/register_store";
import { requiredRule, emailRule, passwordRule, confirmPasswordRule } from "@/utils/validationRules";

export default {
  setup() {
    const registerStore = useRegisterStore();
    const userName = ref("");
    const userEmail = ref("");
    const userPassword = ref("");
    const confirmPassword = ref("");
    const form = ref();
    const router = useRouter();

    // Validation Confirm Password
    const confirmPasswordValidation = computed(() => (v: string) =>
      confirmPasswordRule(v, userPassword.value)
    );

    const handleRegister = async () => {
      const result = await form.value?.validate();
      if (!result.valid) return;

      try {
        const response = await registerStore.register(userName.value, userEmail.value, userPassword.value);

        if (response.message === "Email already exists") {
          alert("This email is already registered. Please use another email.");
          return;
        }

        if (response.userId) {
          alert("Registration successful!");
          router.push("/login_page");
        } else {
          alert(response.message || "Registration failed.");
        }
      } catch (error: any) {
        alert(error.message);
      }
    };

    return {
      userName,
      userEmail,
      userPassword,
      confirmPassword,
      requiredRule,
      emailRule,
      passwordRule,
      confirmPasswordValidation,
      handleRegister,
      form,
    };
  },
};
</script>

<template>
  <v-container>
    <v-card class="mx-auto mt-6" width="500">
      <v-card-title class="text-h5 text-center">Register</v-card-title>

      <v-form ref="form">
        <v-card-text>
          <v-text-field v-model="userName" label="User Name" variant="outlined" :rules="[requiredRule]" />
          <v-text-field v-model="userEmail" label="E-mail" variant="outlined" :rules="[requiredRule, emailRule]" />
          <v-text-field v-model="userPassword" label="Password" variant="outlined" type="password" :rules="[requiredRule, passwordRule]" />
          <v-text-field v-model="confirmPassword" label="Confirm Password" variant="outlined" type="password" :rules="[requiredRule, confirmPasswordValidation]" />
        </v-card-text>

        <v-card-actions class="d-flex flex-column">
          <v-btn variant="tonal" class="w-100" @click="handleRegister">Register</v-btn>
          <v-btn class="w-100 mt-2" variant="outlined" color="grey" to="/login_page">Back to Login</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>
