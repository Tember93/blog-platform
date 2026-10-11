import { ref, computed } from "vue"
import { defineStore } from "pinia"
import { login as loginApi, register as registerApi } from "@/apis/auth.js"

function isValidValue(value) {
  return value && value !== "undefined" && value !== "null"
}

function getStoredToken() {
  const stored = localStorage.getItem("token")
  return isValidValue(stored) ? stored : ""
}

function saveToken(token) {
  if (isValidValue(token)) {
    localStorage.setItem("token", token)
  }
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem("user")
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed && parsed.id ? parsed : null
  } catch {
    return null
  }
}

function saveUser(user) {
  if (user && user.id) {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref(getStoredToken())
  const user = ref(getStoredUser())

  const isLoggedIn = computed(() => !!token.value)

  async function login(email, password) {
    const res = await loginApi(email, password)
    token.value = res.token
    user.value = res.user
    saveToken(res.token)
    saveUser(res.user)
  }

  async function register(username, email, password) {
    const res = await registerApi(username, email, password)
    token.value = res.token
    user.value = res.user
    saveToken(res.token)
    saveUser(res.user)
  }

  function logout() {
    token.value = ""
    user.value = null
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return { token, user, isLoggedIn, login, register, logout }
})
