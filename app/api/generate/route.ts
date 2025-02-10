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
        content: `You are a professional SVG creator specializing in geometric shape-based illustrations. Create a clean, modern SVG based on this description: "${prompt}".

Shape-Based Design Requirements:
1. Primary Shapes (Use these as building blocks):
   - <rect> for squares, rectangles, and backgrounds
   - <circle> for dots, circles, and round elements
   - <ellipse> for ovals and curved shapes
   - <polygon> for triangles, stars, and complex polygons
   - <line> for straight lines and borders
   - <path> ONLY when absolutely necessary for complex curves

2. Composition Rules:
   - Break down complex objects into basic geometric shapes
   - Use <g> elements to group related shapes
   - Apply transform="translate(x,y)" for positioning
   - Use transform="rotate(deg)" for orientation
   - Maintain proper proportions between shapes
   - Layer shapes effectively with proper ordering

3. Styling Guidelines:
   - Use a cohesive color palette (3-5 colors maximum)
   - Apply consistent stroke-width across similar elements
   - Use fill-opacity for depth and layering
   - Add simple hover effects with CSS
   - Keep shapes clean and geometric
   - Use gradients sparingly for depth

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
          text: `As an expert SVG designer specializing in geometric shapes, create a professional SVG illustration based on this description: "${prompt}".

Shape-Based Design Requirements:
1. Core SVG Shapes to Use:
   - <rect> for all rectangular and square elements
   - <circle> for perfect circles and dots
   - <ellipse> for oval shapes and rounded elements
   - <polygon> for triangles, stars, and multi-sided shapes
   - <line> for connecting elements and borders
   - Use <path> only as a last resort for complex curves

2. Composition Guidelines:
   - Decompose complex illustrations into basic shapes
   - Group related elements with <g> tags
   - Use transform attributes for positioning and rotation
   - Apply proper layering with careful element ordering
   - Maintain consistent proportions across shapes
   - Create depth through strategic overlapping

3. Visual Style:
   - Limit to 3-5 colors for cohesive design
   - Use consistent stroke widths within shape categories
   - Apply fill-opacity for layering effects
   - Add subtle transitions for interactivity
   - Keep shapes geometric and clean
   - Use minimal gradients for depth when needed

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
        content: `Create a professional SVG illustration using geometric shapes for: "${prompt}"

Shape-Based Design Specifications:
1. Basic Shapes (Primary Building Blocks):
   - Use <rect> for all rectangular shapes and backgrounds
   - Use <circle> for round elements and points
   - Use <ellipse> for oval shapes and curved elements
   - Use <polygon> for triangles, stars, and complex shapes
   - Use <line> for straight connections and borders
   - Use <path> ONLY if absolutely necessary for complex curves

2. Composition Techniques:
   - Break down complex objects into basic geometric shapes
   - Group related shapes using <g> elements
   - Position elements using transform="translate(x,y)"
   - Rotate shapes with transform="rotate(deg)"
   - Scale elements appropriately with transform="scale(x,y)"
   - Layer shapes with strategic ordering for depth

3. Visual Styling:
   - Use a limited color palette (3-5 colors)
   - Apply consistent stroke-width within shape categories
   - Use fill-opacity for layering and depth
   - Add subtle hover effects with CSS
   - Keep shapes clean and geometric
   - Use minimal gradients for depth effects

4. Technical Requirements:
   - Set viewBox for proper scaling
   - Use width="100%" and height="100%"
   - Group related shapes logically
   - Use descriptive IDs for main elements
   - Optimize coordinate values
   - Remove any unnecessary attributes

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