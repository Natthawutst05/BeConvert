<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useRegisterStore } from "../stores/register_store";
import { requiredRule, emailRule, passwordRule } from "@/utils/validationRules";

export default {
  setup() {
    const registerStore = useRegisterStore();
    const userName = ref("");
    const userEmail = ref("");
    const userPassword = ref("");
    const valid = ref(false);

    const router = useRouter();

    const handleRegister = async () => {
      if (!valid.value) return;

      const response = await registerStore.register(userName.value, userEmail.value, userPassword.value);
      if (response.ok) {
        alert("Registration successful!");
        router.push("/login_page");
      } else {
        alert(response.error || "Registration failed.");
      }
    };

    const goToLoginPage = () => {
      router.push("/login_page");
    }

    return {
      userName,
      userEmail,
      userPassword,
      requiredRule,
      emailRule,
      passwordRule,
      handleRegister,
      goToLoginPage,
    };
  },
};
</script>

<template>
  <v-card
    class="mx-auto ma-6"
    prepend-icon="$vuetify"
    width="600"
  >
    <template #title>
      <span class="font-weight-black">Register</span>
    </template>

    <v-col>
      <v-text-field
        v-model="userName"
        :rules="[requiredRule]"
        label="UserName"
        variant="outlined"
      />

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
        :rules="[requiredRule, passwordRule]"
        type="password"
        required
      />

      <v-btn
        variant="tonal"
        class="w-100"
        @click="handleRegister"
      >
        Submit
      </v-btn>
      <hr
        class="mt-2 mb-2"
      >
      <v-btn
        variant="outlined"
        class="w-100"
        color="primary"
        @click="goToLoginPage"
      >
        Back to Login
      </v-btn>
    </v-col>
  </v-card>
</template>
