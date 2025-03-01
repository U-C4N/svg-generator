import { NextResponse } from 'next/server'
import { SVG_SYSTEM_PROMPT, API_CONFIG } from '@/lib/config'

// TypeScript interface for API responses
interface AnthropicResponse {
  content: Array<{type: string, text: string}>
  id: string
  model: string
  role: string
}

async function generateDeepseekSVG(prompt: string) {
  const response = await fetch(API_CONFIG.deepseek.baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: SVG_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: API_CONFIG.deepseek.model
    })
  })
  const data = await response.json()
  return extractSVG(data.choices[0].message.content)
}

async function generateGeminiSVG(prompt: string) {
  const response = await fetch(`${API_CONFIG.google.baseUrl}/models/${API_CONFIG.google.model}:generateContent?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: SVG_SYSTEM_PROMPT },
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    })
  })

  if (!response.ok) {
    console.error('Gemini API Error:', await response.text())
    return ''
  }

  const data = await response.json()
  
  try {
    // Gemini 2.0 Flash response format
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return extractSVG(content)
  } catch (error) {
    console.error('Error parsing Gemini response:', error, data)
    return ''
  }
}

async function generateOpenAISVG(prompt: string) {
  const response = await fetch(`${API_CONFIG.openai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: API_CONFIG.openai.model,
      messages: [
        {
          role: "system",
          content: SVG_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  })
  const data = await response.json()
  return extractSVG(data.choices[0].message.content)
}

// Helper function to clean and validate SVG
function extractSVG(content: string): string {
  // Remove code blocks if present
  content = content.replace(/```svg/g, '').replace(/```/g, '');
  
  // Extract SVG code
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
  if (!svgMatch) {
    console.log("Failed to extract SVG from:", content.substring(0, 200) + "...");
    return '';
  }
  
  let svg = svgMatch[0];
  
  // Ensure viewBox if not present
  if (!svg.includes('viewBox')) {
    svg = svg.replace('<svg', '<svg viewBox="0 0 800 600"'); 
  }
  
  // Ensure width and height are 100%
  svg = svg.replace(/<svg([^>]*)>/, (match, attributes) => {
    if (!attributes.includes('width')) {
      match = match.replace('>', ' width="100%">');
    }
    if (!attributes.includes('height')) {
      match = match.replace('>', ' height="100%">');
    }
    return match;
  });
  
  // Ensure proper aria-label for accessibility if not present
  if (!svg.includes('aria-label')) {
    svg = svg.replace('<svg', '<svg aria-label="Generated SVG illustration"');
  }
  
  // Basic validation - make sure the SVG isn't obviously broken
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
    console.error("Generated invalid SVG:", svg);
    return '';
  }
  
  return svg;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    // Generate SVGs from all models in parallel
    const [deepseekSVG, geminiSVG, openaiSVG] = await Promise.all([
      generateDeepseekSVG(prompt),
      generateGeminiSVG(prompt),
      generateOpenAISVG(prompt)
    ])

    return NextResponse.json({
      deepseek: deepseekSVG,
      gemini: geminiSVG,
      openai: openaiSVG
    })
  } catch (error) {
    console.error('Error generating SVGs:', error)
    return NextResponse.json({ error: 'Failed to generate SVGs' }, { status: 500 })
  }
} 