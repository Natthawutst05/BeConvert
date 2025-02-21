
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
//import { routes } from 'vue-router/auto-routes'
import DefaultLayout from "@/layouts/layoutDefault.vue";
import BlankLayout from "@/layouts/layoutBlank.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      { path: "upload_file_page", component: () => import("@/pages/upload_file_page.vue") },
      { path: "upload_file2_page", component: () => import("@/pages/upload_file2_page.vue") },
      { path: "report_page", component: () => import("@/pages/report_page.vue") },
      { path: "report2_page", component: () => import("@/pages/report2_page.vue") },
    ],
  },
  {
    path: "/",
    component: BlankLayout,
    children: [
      { path: "login_page", component: () => import("@/pages/login_page.vue") },
      { path: "register_page", component: () => import("@/pages/register_page.vue") },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
