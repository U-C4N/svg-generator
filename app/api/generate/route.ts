import { NextResponse } from 'next/server'

async function generateDeepseekSVG(prompt: string) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      messages: [{
        role: "user",
        content: `You are a professional SVG creator. Create a clean, modern SVG based on this description: "${prompt}".

Requirements:
- Use viewBox for proper scaling
- Keep the SVG simple but visually appealing
- Use modern design principles
- Include basic animations where appropriate (using CSS or SMIL)
- Optimize the code for web use
- Use semantic element names
- Include proper stroke-width and fill attributes
- Set width and height to 100%

Return ONLY the SVG code without any explanation or markdown.
The response must start with <svg and end with </svg>.`
      }],
      model: "deepseek-chat"
    })
  })
  const data = await response.json()
  return extractSVG(data.choices[0].message.content)
}

async function generateGeminiSVG(prompt: string) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `As an expert SVG designer, create a professional SVG illustration based on this description: "${prompt}".

Technical Requirements:
- Use viewBox attribute for responsive scaling
- Set width and height to 100%
- Include appropriate metadata
- Use CSS variables for colors when possible
- Implement smooth animations where relevant
- Optimize paths and shapes
- Use descriptive IDs and classes
- Ensure accessibility with ARIA labels

Design Guidelines:
- Follow minimalist design principles
- Use a cohesive color scheme
- Implement proper visual hierarchy
- Consider negative space
- Make it visually engaging

Return ONLY the pure SVG code. Must start with <svg and end with </svg>.`
        }]
      }],
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
    // Gemini 1.5 Pro response format is slightly different
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return extractSVG(content)
  } catch (error) {
    console.error('Error parsing Gemini response:', error, data)
    return ''
  }
}

async function generateGPT4SVG(prompt: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: `You are an expert SVG creator specializing in creating clean, optimized, and animated SVG graphics.`
      },
      {
        role: "user",
        content: `Create a professional SVG illustration for: "${prompt}"

Technical Specifications:
1. Structure:
   - Use viewBox for proper scaling
   - Set width and height to 100%
   - Include proper namespace declarations
   - Use groups (<g>) for logical organization

2. Styling:
   - Implement CSS custom properties for colors
   - Use efficient CSS animations
   - Apply proper stroke-width and fill attributes
   - Include hover effects where appropriate

3. Optimization:
   - Minimize path points
   - Use appropriate decimal precision
   - Combine paths when possible
   - Remove unnecessary attributes

4. Features:
   - Add subtle animations
   - Include interactive elements
   - Implement smooth transitions
   - Use gradients or patterns if relevant

Return ONLY the SVG code, no explanations. Must start with <svg and end with </svg>.`
      }]
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
  if (!svgMatch) return '';
  
  let svg = svgMatch[0];
  
  // Ensure viewBox if not present
  if (!svg.includes('viewBox')) {
    svg = svg.replace('<svg', '<svg viewBox="0 0 100 100"');
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
  
  return svg;
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const [deepseekSVG, geminiSVG, gpt4SVG] = await Promise.all([
      generateDeepseekSVG(prompt),
      generateGeminiSVG(prompt),
      generateGPT4SVG(prompt)
    ])

    return NextResponse.json({
      deepseek: deepseekSVG,
      gemini: geminiSVG,
      gpt4: gpt4SVG
    })
  } catch (error) {
    console.error('Error generating SVGs:', error)
    return NextResponse.json({ error: 'Failed to generate SVGs' }, { status: 500 })
  }
} 