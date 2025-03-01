import { GOOGLE_API_KEY, API_CONFIG, SVG_SYSTEM_PROMPT } from "../config"

interface GeminiRequest {
  contents: {
    parts: {
      text: string
    }[]
  }[]
  generationConfig: {
    temperature: number
    maxOutputTokens: number
  }
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string
      }[]
    }
  }[]
}

export async function generateSvgWithGemini(prompt: string): Promise<string> {
  try {
    const request: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: SVG_SYSTEM_PROMPT },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    }

    const response = await fetch(
      `${API_CONFIG.google.baseUrl}/models/${API_CONFIG.google.model}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      }
    )

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data: GeminiResponse = await response.json()
    
    // Extract SVG content
    let svgContent = ""
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts
      for (const part of parts) {
        svgContent += part.text
      }
    }
    
    svgContent = svgContent.trim()
    
    // Extract SVG from markdown if needed
    if (svgContent.includes("```svg") || svgContent.includes("```html") || svgContent.includes("```xml")) {
      const svgMatch = svgContent.match(/```(?:svg|html|xml)([\s\S]*?)```/)
      if (svgMatch && svgMatch[1]) {
        svgContent = svgMatch[1].trim()
      }
    }
    
    // Basic validation that we received SVG content
    if (!svgContent.startsWith("<svg") || !svgContent.endsWith("</svg>")) {
      throw new Error("Invalid SVG content received from Gemini")
    }

    return svgContent
  } catch (error) {
    console.error("Error generating SVG with Gemini:", error)
    throw error
  }
} 