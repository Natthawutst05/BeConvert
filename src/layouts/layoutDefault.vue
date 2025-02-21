<template>
  <v-app>
    <NavBar />
    <v-main>
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import NavBar from "@/components/AppNavBar.vue";
import Footer from "@/components/AppFooter.vue";
</script>
