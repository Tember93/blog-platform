import http from "@/utils/http.js"

export function getTags() {
  return http.get("/tags")
}
