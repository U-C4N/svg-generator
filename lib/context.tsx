"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { generateSvgWithDeepseek } from "./services/deepseek"
import { generateSvgWithGemini } from "./services/gemini"
import { generateSvgWithOpenAI } from "./services/openai"

export interface SvgData {
  deepseek: string
  gemini: string
  openai: string
}

interface AppState {
  prompt: string
  setPrompt: (prompt: string) => void
  previews: SvgData
  setPreviews: (previews: SvgData) => void
  isGenerating: boolean
  setIsGenerating: (isGenerating: boolean) => void
  promptHistory: string[]
  addToHistory: (prompt: string) => void
  favorites: { [key: string]: string }
  addToFavorites: (title: string, svg: string) => void
  removeFromFavorites: (title: string) => void
  darkMode: boolean
  toggleDarkMode: () => void
  generateSvg: (prompt: string) => Promise<void>
}

const AppContext = createContext<AppState | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState("")
  const [previews, setPreviews] = useState<SvgData>({
    deepseek: "",
    gemini: "",
    openai: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [promptHistory, setPromptHistory] = useState<string[]>([])
  const [favorites, setFavorites] = useState<{ [key: string]: string }>({})
  const [darkMode, setDarkMode] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("promptHistory")
    if (storedHistory) {
      setPromptHistory(JSON.parse(storedHistory))
    }

    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }

    const storedDarkMode = localStorage.getItem("darkMode")
    if (storedDarkMode) {
      setDarkMode(JSON.parse(storedDarkMode))
    }
  }, [])

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("promptHistory", JSON.stringify(promptHistory))
  }, [promptHistory])

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const addToHistory = (prompt: string) => {
    if (!prompt || promptHistory.includes(prompt)) return
    const newHistory = [prompt, ...promptHistory].slice(0, 10) // Keep only the 10 most recent prompts
    setPromptHistory(newHistory)
  }

  const addToFavorites = (title: string, svg: string) => {
    setFavorites(prev => ({ ...prev, [title]: svg }))
  }

  const removeFromFavorites = (title: string) => {
    setFavorites(prev => {
      const newFavorites = { ...prev }
      delete newFavorites[title]
      return newFavorites
    })
  }

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev)
  }

  const generateSvg = async (prompt: string) => {
    if (!prompt) return

    setIsGenerating(true)
    addToHistory(prompt)
    
    try {
      // Generate SVGs in parallel for all models
      const [deepseekSvg, geminiSvg, openaiSvg] = await Promise.allSettled([
        generateSvgWithDeepseek(prompt),
        generateSvgWithGemini(prompt),
        generateSvgWithOpenAI(prompt)
      ])

      // Update previews based on results
      setPreviews({
        deepseek: deepseekSvg.status === 'fulfilled' ? deepseekSvg.value : "",
        gemini: geminiSvg.status === 'fulfilled' ? geminiSvg.value : "",
        openai: openaiSvg.status === 'fulfilled' ? openaiSvg.value : ""
      })
    } catch (error) {
      console.error("Error generating SVGs:", error)
      // You might want to show an error toast here
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AppContext.Provider
      value={{
        prompt,
        setPrompt,
        previews,
        setPreviews,
        isGenerating,
        setIsGenerating,
        promptHistory,
        addToHistory,
        favorites,
        addToFavorites,
        removeFromFavorites,
        darkMode,
        toggleDarkMode,
        generateSvg
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider")
  }
  return context
} 