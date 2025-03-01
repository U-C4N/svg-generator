"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAppState } from "@/lib/context"
import { AnimationControls } from "@/components/AnimationControls"
import { ExportControls } from "@/components/ExportControls"
import { SvgPreview } from "@/components/SvgPreview"

export default function Home() {
  const { prompt, setPrompt, previews, isGenerating, generateSvg } = useAppState()

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
                  onClick={() => generateSvg(prompt)}
                  disabled={!prompt || isGenerating}
                >
                  {isGenerating ? "Generating SVGs..." : "Generate All SVGs"}
                </Button>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SvgPreview 
                  title="Deepseek Chat" 
                  svgContent={previews.deepseek} 
                />
                
                <SvgPreview 
                  title="Gemini 2.0 Flash" 
                  svgContent={previews.gemini} 
                />
                
                <SvgPreview 
                  title="GPT-4o" 
                  svgContent={previews.openai} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="animate" className="space-y-4">
            <AnimationControls />
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <ExportControls />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
