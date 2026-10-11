import http from "@/utils/http.js";

export function getList(params) {
  return http.get("/articles", { params });
}

export function getDetail(id) {
  return http.get(`/articles/${id}`);
}

export function create(data) {
  return http.post("/articles", data);
}

export function update(id, data) {
  return http.put(`/articles/${id}`, data);
}

export function remove(id) {
  return http.delete(`/articles/${id}`);
}

export function createComment(id, content) {
  return http.post(`/articles/${id}/comments`, { content });
}

export function getComments(id) {
  return http.get(`/articles/${id}/comments`);
}

export function getDrafts() {
  return http.get("/articles/user/drafts");
}
