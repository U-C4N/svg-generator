"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCw, ArrowRight } from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppState } from "@/lib/context"

export function AnimationControls() {
  const { previews } = useAppState()
  const [selectedSvg, setSelectedSvg] = useState<"deepseek" | "anthropic" | "gemini" | "openai">("deepseek")
  const [duration, setDuration] = useState(1000)
  const [delay, setDelay] = useState(0)
  const [easing, setEasing] = useState("ease")
  const [animationType, setAnimationType] = useState("fade")
  const [isPlaying, setIsPlaying] = useState(false)
  const [animatedSvg, setAnimatedSvg] = useState("")
  
  const easingOptions = [
    "linear", "ease", "ease-in", "ease-out", "ease-in-out", 
    "cubic-bezier(0.4, 0, 0.2, 1)", "cubic-bezier(0, 0, 0.2, 1)", "cubic-bezier(0.4, 0, 1, 1)"
  ]
  
  const animationTypes = [
    "fade", "scale", "rotate", "translate", "path", "morph", "draw"
  ]

  const applyAnimation = () => {
    const svg = previews[selectedSvg]
    if (!svg) return
    
    let modified = svg
    
    // Create a style block to inject
    const styleId = "animation-styles"
    let styleBlock = `<style id="${styleId}">
      @keyframes svgAnimation {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      svg * {
        animation: svgAnimation ${duration}ms ${easing} ${delay}ms forwards;
      }`
      
    // Add different animation types
    if (animationType === "fade") {
      styleBlock += `
        @keyframes svgAnimation {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }`
    } else if (animationType === "scale") {
      styleBlock += `
        @keyframes svgAnimation {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }`
    } else if (animationType === "rotate") {
      styleBlock += `
        @keyframes svgAnimation {
          0% { transform: rotate(-90deg); }
          100% { transform: rotate(0); }
        }`
    } else if (animationType === "translate") {
      styleBlock += `
        @keyframes svgAnimation {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }`
    } else if (animationType === "path") {
      styleBlock += `
        @keyframes pathAnimation {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        
        svg path, svg line, svg rect, svg circle, svg ellipse, svg polyline, svg polygon {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: pathAnimation ${duration}ms ${easing} ${delay}ms forwards;
        }`
    }
    
    styleBlock += `
      </style>`
    
    // Remove existing style block if it exists
    if (modified.includes(`<style id="${styleId}">`)) {
      modified = modified.replace(/<style id="animation-styles">[\s\S]*?<\/style>/, '')
    }
    
    // Add style block to the SVG
    modified = modified.replace('<svg', `${styleBlock}<svg`)
    
    setAnimatedSvg(modified)
    setIsPlaying(true)
  }
  
  const resetAnimation = () => {
    setAnimatedSvg(previews[selectedSvg])
    setIsPlaying(false)
  }
  
  const togglePlayPause = () => {
    if (!isPlaying && !animatedSvg) {
      applyAnimation()
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Animation Controls</h3>
          
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
            
            <Tabs defaultValue="timing" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="timing">Timing</TabsTrigger>
                <TabsTrigger value="effects">Effects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timing" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Duration: {duration}ms</Label>
                  </div>
                  <Slider
                    value={[duration]}
                    min={100}
                    max={5000}
                    step={100}
                    onValueChange={(value: number[]) => setDuration(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Delay: {delay}ms</Label>
                  </div>
                  <Slider
                    value={[delay]}
                    min={0}
                    max={2000}
                    step={100}
                    onValueChange={(value: number[]) => setDelay(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Easing</Label>
                  <Select value={easing} onValueChange={setEasing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select easing function" />
                    </SelectTrigger>
                    <SelectContent>
                      {easingOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="effects" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Animation Type</Label>
                  <Select value={animationType} onValueChange={setAnimationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select animation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {animationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Additional effect-specific controls could go here */}
              </TabsContent>
            </Tabs>
            
            <div className="pt-4 flex justify-between">
              <Button variant="outline" onClick={resetAnimation}>
                <RotateCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                
                <Button onClick={applyAnimation}>
                  Apply Animation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="aspect-square bg-grid-pattern border rounded-lg flex items-center justify-center p-4">
            <div
              dangerouslySetInnerHTML={{ __html: animatedSvg || previews[selectedSvg] || "" }}
              className="w-full h-full flex items-center justify-center"
              style={{ animation: isPlaying ? "none" : undefined }}
            />
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Animation preview shows how your SVG will appear with the selected animations.
              Apply different settings to see the effects in real-time.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
} 