import { Parser } from 'htmlparser2'

const SYSTEM_PROMPT = `You are a professional document formatter. Convert plain-text resumes and cover letters into structured XML.

For resumes use this schema:
<document type="resume">
  <header>
    <name>Full Name</name>
    <contact>
      <email>email@example.com</email>
      <phone>555-000-0000</phone>
      <location>City, State</location>
      <linkedin>linkedin.com/in/username</linkedin>
      <website>portfolio.com</website>
    </contact>
  </header>
  <summary>Professional summary text.</summary>
  <experience>
    <role>
      <title>Job Title</title>
      <company>Company Name</company>
      <period>Month Year – Month Year</period>
      <bullets>
        <bullet>Key achievement or responsibility</bullet>
      </bullets>
    </role>
  </experience>
  <education>
    <degree>Degree Name</degree>
    <school>School Name</school>
    <year>Graduation Year</year>
    <note>Honors or relevant note</note>
  </education>
  <skills>Skill 1, Skill 2, Skill 3</skills>
  <certifications>Cert 1, Cert 2</certifications>
  <projects>Project descriptions</projects>
  <volunteer>Volunteer experience</volunteer>
</document>

For cover letters use type="cover-letter" and adapt content into letter sections using summary (opening), experience (body paragraphs), and closing elements.

Rules:
- Preserve ALL information from the source text
- Omit empty optional tags
- Output ONLY valid XML — no markdown fences, no explanation
- Detect whether the input is a resume or cover letter and set the type attribute accordingly`

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

function extractTextFromXml(xmlString: string): string {
  const textParts: string[] = []
  const parser = new Parser({
    ontext(text) {
      textParts.push(text)
    },
  }, { decodeEntities: true })
  parser.write(xmlString)
  parser.end()
  return textParts.join(' ')
}

function detectDocumentType(xmlString: string): string {
  const match = xmlString.match(/<document[^>]+type="([^"]+)"/)
  return match?.[1] ?? 'resume'
}

function validateXmlStructure(xmlString: string): boolean {
  let valid = true
  let depth = 0
  const parser = new Parser({
    onerror() {
      valid = false
    },
    onopentag() {
      depth++
    },
    onclosetag() {
      depth--
      if (depth < 0) valid = false
    },
  }, { xmlMode: true })
  parser.write(xmlString)
  parser.end()
  return valid && depth === 0
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.text || body.text.length < 50) {
    throw createError({ statusCode: 400, message: 'Paste more content to format.' })
  }

  const config = useRuntimeConfig()

  if (!config.openaiApiKey) {
    throw createError({ statusCode: 500, message: 'OpenAI API key is not configured.' })
  }

  const inputLen = body.text.length

  const response = await $fetch<OpenAIChatResponse>('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: body.text },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    },
  })

  const raw = response.choices[0]?.message?.content ?? ''

  // Strip markdown fences if present
  const xml = raw
    .replace(/^```(?:xml)?\n?/m, '')
    .replace(/\n?```$/m, '')
    .trim()

  if (!validateXmlStructure(xml)) {
    throw createError({ statusCode: 502, message: 'AI returned malformed XML. Please try again.' })
  }

  const xmlText = extractTextFromXml(xml)
  const xmlTextLen = xmlText.length
  const divergence = Math.abs(inputLen - xmlTextLen) / inputLen

  const documentType = detectDocumentType(xml)

  return { xml, divergence, documentType }
})
