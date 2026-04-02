import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getImageUrl(path: string): string {
  if (path.startsWith("/images/")) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`
  }
  return path
}

export default api
