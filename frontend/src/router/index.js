import { createRouter, createWebHistory } from "vue-router"

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/Register.vue"),
    meta: { guest: true },
  },
  {
    path: "/article/:id",
    name: "article-detail",
    component: () => import("@/views/ArticleDetail.vue"),
  },
  {
    path: "/editor",
    name: "editor",
    component: () => import("@/views/ArticleEditor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/editor/:id",
    name: "editor-edit",
    component: () => import("@/views/ArticleEditor.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/drafts",
    name: "drafts",
    component: () => import("@/views/Drafts.vue"),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem("token")

  if (to.meta.requiresAuth && !token) {
    return { name: "login" }
  }

  if (to.meta.guest && token) {
    return { name: "home" }
  }
})

export default router
