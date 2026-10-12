<template>
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="logo">Blog</router-link>
      <nav class="nav-links">
        <template v-if="authStore.isLoggedIn">
          <el-button @click="$router.push('/editor')">写文章</el-button>
          <el-button @click="$router.push('/drafts')">草稿箱</el-button>
          <span class="sep">|</span>
          <el-button type="danger" @click="handleLogout">退出</el-button>
          <el-avatar :size="32" class="user-avatar">
            {{ authStore.user?.username?.[0] }}
          </el-avatar>
        </template>
        <template v-else>
          <el-button @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">
            注册
          </el-button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth.js"

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push("/")
}
</script>

<style scoped>
.navbar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-links :deep(.el-button + .el-button) {
  margin-left: 0;
}

.user-avatar {
  background: #409eff;
  color: #fff;
  font-size: 14px;
  cursor: default;
  margin-left: 4px;
}

.sep {
  color: #ddd;
  font-size: 16px;
  user-select: none;
}

@media (max-width: 768px) {
  .navbar {
    height: auto;
    min-height: 60px;
  }

  .navbar-inner {
    min-height: 60px;
    padding: 10px 12px;
    gap: 12px;
  }

  .nav-links {
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 20px;
  }

  .nav-links :deep(.el-button) {
    padding: 8px 10px;
  }

  .sep,
  .user-avatar {
    display: none;
  }
}
</style>
