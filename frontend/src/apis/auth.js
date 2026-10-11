import http from "@/utils/http.js"

export function login(email, password) {
  return http.post("/auth/login", { email, password })
}

export function register(username, email, password) {
  return http.post("/auth/register", { username, email, password })
}
