import axios from "axios"
import { ElMessage } from "element-plus"
import { useAuthStore } from "@/stores/auth.js"
import router from "@/router"

// 统一接口前缀 /api
const http = axios.create({
  baseURL: "/api",
})

// 请求拦截器：每次请求自动带上 Token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：成功直接返回数据，失败统一处理
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push("/login")
    }
    // Element Plus 统一错误提示
    ElMessage.error(error.response?.data?.error || error.response?.data?.message || "请求失败")
    return Promise.reject(error)
  }
)

export default http
