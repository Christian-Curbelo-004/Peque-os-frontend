"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import api from "@/lib/api"

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const expiry = localStorage.getItem("auth_expiry")

    if (token) {
      if (expiry && Date.now() > Number(expiry)) {
        // Token expirado — limpiar sesión y dejar flag para login page
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_expiry")
        localStorage.removeItem("user_profile")
        localStorage.setItem("auth_session_expired", "1")
        setIsAuthenticated(false)
      } else {
        setIsAuthenticated(true)
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await api.post("login.php", { email, password })
    const token: string = response.data.token
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 días
    localStorage.setItem("auth_token", token)
    localStorage.setItem("auth_expiry", String(expiry))
    setIsAuthenticated(true)
    return true
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_expiry")
    localStorage.removeItem("user_profile")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
