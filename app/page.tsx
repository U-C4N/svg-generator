"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type AIModel = "deepseek" | "gemini" | "gpt4"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [previews, setPreviews] = useState({
    deepseek: "",
    gemini: "",
    gpt4: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAllSVGs = async () => {
    if (!prompt) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        throw new Error('Failed to generate SVGs')
      }

      const data = await response.json()
      setPreviews({
        deepseek: data.deepseek,
        gemini: data.gemini,
        gpt4: data.gpt4
      })
    } catch (error) {
      console.error("Failed to generate SVGs:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">SVG Creator & Animator</h1>
          <p className="text-muted-foreground">Create and animate SVGs using AI</p>
        </header>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="animate">Animate</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <h2 className="text-xl font-semibold mb-4">Prompt</h2>
                <Textarea 
                  placeholder="Describe the SVG you want to create..."
                  className="min-h-[150px]"
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                />
                <Button 
                  className="w-full mt-4" 
                  onClick={generateAllSVGs}
                  disabled={!prompt || isGenerating}
                >
                  {isGenerating ? "Generating SVGs..." : "Generate All SVGs"}
                </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Deepseek Preview</h2>
                  <div 
                    className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4"
                    dangerouslySetInnerHTML={{ __html: previews.deepseek || "" }}
                  />
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Gemini 1.5 Pro Preview</h2>
                  <div 
                    className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4"
                    dangerouslySetInnerHTML={{ __html: previews.gemini || "" }}
                  />
                </Card>

                <Card className="p-4">
                  <h2 className="text-lg font-semibold mb-4">GPT-4o Mini Preview</h2>
                  <div 
                    className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4"
                    dangerouslySetInnerHTML={{ __html: previews.gpt4 || "" }}
                  />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animate" className="space-y-4">
            {/* Animation controls will go here */}
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {/* Export options will go here */}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
