"use client"

import { useState } from "react"
import { Download, Clipboard, ZoomIn, ZoomOut, Maximize2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SvgPreviewProps {
  title: string
  svgContent: string
  className?: string
}

export function SvgPreview({ title, svgContent, className }: SvgPreviewProps) {
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
  }

  const handleCopy = async () => {
    if (!svgContent) return
    
    try {
      await navigator.clipboard.writeText(svgContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy SVG:", error)
    }
  }

  const handleDownload = () => {
    if (!svgContent) return
    
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-svg.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // In a real app, we would save this to local storage or a database
  }

  return (
    <Card className={cn("p-4 transition-all hover:shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
            <span className="sr-only">Zoom Out</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleReset}
          >
            <Maximize2 className="h-4 w-4" />
            <span className="sr-only">Reset Zoom</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
            <span className="sr-only">Zoom In</span>
          </Button>
        </div>
      </div>
      
      <div 
        className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div
          style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease-in-out" }}
          dangerouslySetInnerHTML={{ __html: svgContent || "" }}
          className="w-full h-full flex items-center justify-center"
        />
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="group transition-all duration-200"
          onClick={toggleFavorite}
        >
          <Heart 
            className={cn(
              "h-4 w-4 mr-2 transition-colors", 
              isFavorite ? "fill-red-500 text-red-500" : "group-hover:text-red-500"
            )} 
          />
          {isFavorite ? "Favorited" : "Favorite"}
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopy}
            className="transition-all duration-200"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy SVG"}
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleDownload}
            disabled={!svgContent}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  )
} 