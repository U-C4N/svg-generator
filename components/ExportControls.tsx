"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Download, 
  Copy, 
  Code, 
  Image, 
  FileVideo, 
  Check, 
  Info
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppState } from "@/lib/context"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

export function ExportControls() {
  const { previews } = useAppState()
  const [selectedSvg, setSelectedSvg] = useState<"deepseek" | "anthropic" | "gemini" | "openai">("deepseek")
  const [exportFormat, setExportFormat] = useState("svg")
  const [width, setWidth] = useState(512)
  const [height, setHeight] = useState(512)
  const [quality, setQuality] = useState(90)
  const [includeAnimation, setIncludeAnimation] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const exportFormats = ["svg", "png", "jpg", "gif", "mp4"]
  
  const handleCopyCode = async () => {
    const svg = previews[selectedSvg]
    if (!svg) return
    
    try {
      await navigator.clipboard.writeText(svg)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy SVG code:", error)
    }
  }
  
  const handleDownload = () => {
    const svg = previews[selectedSvg]
    if (!svg) return
    
    if (exportFormat === "svg") {
      // Direct SVG download
      const blob = new Blob([svg], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `svg-export-${selectedSvg}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      // For other formats, we would convert SVG to the target format
      // This is a simplified version that would need a server-side component
      // or a client-side library to actually convert the SVG
      alert(`Export as ${exportFormat.toUpperCase()} would require server-side processing or additional libraries.`)
    }
  }
  
  const renderFormatSpecificControls = () => {
    switch (exportFormat) {
      case "png":
      case "jpg":
        return (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality: {quality}%</Label>
              </div>
              <Slider
                value={[quality]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value: number[]) => setQuality(value[0])}
              />
            </div>
          </>
        )
      case "gif":
      case "mp4":
        return (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-animation">Include Animation</Label>
              <Switch
                id="include-animation"
                checked={includeAnimation}
                onCheckedChange={setIncludeAnimation}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality: {quality}%</Label>
              </div>
              <Slider
                value={[quality]}
                min={10}
                max={100}
                step={1}
                onValueChange={(value: number[]) => setQuality(value[0])}
              />
            </div>
          </>
        )
      default:
        return (
          <div className="flex items-center justify-between">
            <Label htmlFor="include-metadata">Include Metadata</Label>
            <Switch
              id="include-metadata"
              checked={includeMetadata}
              onCheckedChange={setIncludeMetadata}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Export Settings</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select SVG</Label>
              <Select 
                value={selectedSvg} 
                onValueChange={(value: "deepseek" | "anthropic" | "gemini" | "openai") => setSelectedSvg(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select SVG" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek">Deepseek Chat</SelectItem>
                  <SelectItem value="anthropic">Claude 3.7</SelectItem>
                  <SelectItem value="gemini">Gemini 2.0 Flash</SelectItem>
                  <SelectItem value="openai">GPT-4o</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              {renderFormatSpecificControls()}
            </div>
            
            <div className="flex justify-between pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleCopyCode}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Code className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy the raw SVG code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button disabled={!previews[selectedSvg]}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Export Options</h4>
                      <p className="text-sm text-muted-foreground">
                        Choose how to export your SVG
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Button onClick={handleDownload}>
                        Download as {exportFormat.toUpperCase()}
                      </Button>
                      {exportFormat === "svg" && (
                        <Button variant="outline" onClick={handleCopyCode}>
                          Copy SVG Code
                        </Button>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div 
            className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4"
            style={{ width: "100%", maxWidth: "100%" }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: previews[selectedSvg] || "" }}
              className="w-full h-full flex items-center justify-center"
            />
          </div>
          
          <div className="mt-4 flex items-start space-x-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Preview shows how your exported SVG will appear. Note that some formats like PNG, GIF,
              or MP4 would require additional processing.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 