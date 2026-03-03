export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.text || body.text.length < 50) {
    throw createError({ statusCode: 400, message: 'Paste more content to format.' })
  }
  // Phase 1 will add the OpenAI call here
  return { xml: '<document type="resume"><header><name>Placeholder</name></header></document>', divergence: 0, documentType: 'resume' }
})
