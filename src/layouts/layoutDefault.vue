<template>
  <v-app>
    <NavBar />
    <v-main class="content">
      <router-view />
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import NavBar from "@/components/AppNavBar.vue";
import Footer from "@/components/AppFooter.vue";
</script>

<style scoped>
.content {
  min-height: calc(100vh - 40px); /* ลบความสูงของ footer ออกจากความสูงหน้าจอ */
}
</style>
