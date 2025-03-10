
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
      { path: "user_management_page", component: () => import("@/pages/user_management_page.vue") },
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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("authToken");

  // ถ้ายังไม่ได้ Login และกำลังเข้าเพจที่ต้องใช้ Auth -> ส่งไปหน้า Login
  if (!token && to.meta.requiresAuth) {
    next({ path: "/login_page", replace: true });
  }
  // ถ้ามี Token แล้ว และกำลังเข้า Login/Register -> ส่งไปหน้า Report
  else if (token && (to.path === "/login_page" || to.path === "/register_page")) {
    next({ path: "/report_page", replace: true });
  }
  else {
    next();
  }
});

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
