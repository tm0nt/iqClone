"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          variant: "success",
          title: "Login successful",
          description: "Welcome to your dashboard",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Please check your credentials and try again",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Server error",
        description: "An error occurred while processing your request",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-md border-input bg-background px-4 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-md border-input bg-background px-4 shadow-sm focus:border-primary focus:ring-primary"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground/60" /> : <Eye className="h-4 w-4 text-muted-foreground/60" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  )
}
