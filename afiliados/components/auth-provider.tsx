"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  avatar?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user for demo
      const mockUser: User = {
        id: "1",
        name: "Usuário Demo",
        email,
        role: email.includes("admin") ? "admin" : "user",
        avatar: "/mystical-forest-spirit.png",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Login failed:", error)
      throw new Error("Credenciais inválidas")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user registration
      const mockUser: User = {
        id: "1",
        name,
        email,
        role: "user",
        avatar: "/mystical-forest-spirit.png",
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
    } catch (error) {
      console.error("Registration failed:", error)
      throw new Error("Falha no registro")
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
