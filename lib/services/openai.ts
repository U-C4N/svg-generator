import { OPENAI_API_KEY, API_CONFIG, SVG_SYSTEM_PROMPT } from "../config"

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: Message[]
  temperature?: number
  max_tokens?: number
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string
    }
    finish_reason: string
  }[]
}

export async function generateSvgWithOpenAI(prompt: string): Promise<string> {
  try {
    const messages: Message[] = [
      {
        role: "system",
        content: SVG_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: prompt
      }
    ]

    const response = await fetch(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: API_CONFIG.openai.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      } as ChatCompletionRequest)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data: ChatCompletionResponse = await response.json()
    let svgContent = data.choices[0]?.message.content.trim()
    
    // Extract SVG from markdown if needed
    if (svgContent.includes("```svg") || svgContent.includes("```html") || svgContent.includes("```xml")) {
      const svgMatch = svgContent.match(/```(?:svg|html|xml)([\s\S]*?)```/)
      if (svgMatch && svgMatch[1]) {
        svgContent = svgMatch[1].trim()
      }
    }
    
    // Basic validation that we received SVG content
    if (!svgContent.startsWith("<svg") || !svgContent.endsWith("</svg>")) {
      throw new Error("Invalid SVG content received from OpenAI")
    }

    return svgContent
  } catch (error) {
    console.error("Error generating SVG with OpenAI:", error)
    throw error
  }
}