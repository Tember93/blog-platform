import axios from "axios"
import { ElMessage } from "element-plus"
import { useAuthStore } from "@/stores/auth.js"
import router from "@/router"

const http = axios.create({
  baseURL: "/api",
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push("/login")
    }
    ElMessage.error(error.response?.data?.error || error.response?.data?.message || "请求失败")
    return Promise.reject(error)
  }
)

export default http
