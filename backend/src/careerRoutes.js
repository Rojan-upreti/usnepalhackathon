import Anthropic from '@anthropic-ai/sdk'
import { Router } from 'express'
import admin from 'firebase-admin'

export const careerRouter = Router()

const MAX_RESUME_CHARS = 80_000
const MODEL = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-20241022'

/** Anthropic must return only this JSON shape (no markdown). */
const SYSTEM_PROMPT = `You analyze resumes. Reply with a single JSON object only — no markdown, no code fences.
Keys (all required):
- overallScore: integer 1–10
- headline: one short encouraging line
- primaryFocus: one sentence on what they come across as
- professionalSummary: 2–4 sentences
- strengths: array of 3–6 short strings
- growthAreas: array of 2–5 short strings
- nextSteps: array of 3–5 actionable strings
- fitFor: one short phrase (roles/contexts that fit)

If the text is not a resume, still return valid JSON with a low overallScore and helpful growthAreas.`

careerRouter.get('/ping', (_req, res) => {
  res.json({ ok: true, service: 'resume-analyze' })
})

async function requireAuth(req, res, next) {
  if (!admin.apps.length) {
    return res.status(503).json({ ok: false, error: 'Firebase Admin not configured on server.' })
  }
  const authz = req.headers.authorization
  if (!authz || typeof authz !== 'string' || !authz.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Missing Authorization: Bearer <Firebase ID token>' })
  }
  const token = authz.slice(7).trim()
  if (!token) return res.status(401).json({ ok: false, error: 'Empty token' })
  try {
    await admin.auth().verifyIdToken(token)
    next()
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' })
  }
}

function assistantText(message) {
  const parts = message?.content
  if (!Array.isArray(parts)) return ''
  return parts
    .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text)
    .join('')
    .trim()
}

function parseModelJson(raw) {
  const t = raw.trim()
  try {
    return JSON.parse(t)
  } catch {
    const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(t)
    if (fence) return JSON.parse(fence[1].trim())
    const a = t.indexOf('{')
    const b = t.lastIndexOf('}')
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1))
    throw new Error('Model did not return valid JSON')
  }
}

function normalizeInsight(o) {
  if (!o || typeof o !== 'object') throw new Error('Bad insight object')
  const n = Number(o.overallScore)
  const overallScore = Number.isFinite(n) ? Math.min(10, Math.max(1, Math.round(n))) : 5
  const s = (v, max, fallback) =>
    typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback
  const list = (v, maxItems) =>
    Array.isArray(v)
      ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 400)).slice(0, maxItems)
      : []

  const strengths = list(o.strengths, 8)
  const growthAreas = list(o.growthAreas, 8)
  const nextSteps = list(o.nextSteps, 8)

  return {
    overallScore,
    headline: s(o.headline, 400, 'Resume review'),
    primaryFocus: s(o.primaryFocus, 500, 'Professional profile'),
    professionalSummary: s(o.professionalSummary, 2000, ''),
    strengths: strengths.length ? strengths : ['Add measurable outcomes where you can.'],
    growthAreas: growthAreas.length ? growthAreas : ['Tighten wording and tailor to a target role.'],
    nextSteps: nextSteps.length ? nextSteps : ['Proofread and match keywords to job descriptions.'],
    fitFor: s(o.fitFor, 300, 'General opportunities'),
  }
}

/**
 * POST /api/career/analyze
 * Body: { "resumeText": "..." }
 * Header: Authorization: Bearer <Firebase ID token>
 * Response: { ok: true, insight: { ... } }
 */
careerRouter.post('/analyze', requireAuth, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    return res.status(503).json({
      ok: false,
      error: 'Set ANTHROPIC_API_KEY in backend/.env (never commit the key).',
    })
  }

  const resumeText = req.body?.resumeText
  if (typeof resumeText !== 'string' || !resumeText.trim()) {
    return res.status(400).json({ ok: false, error: 'Body must be JSON: { "resumeText": "your resume …" }' })
  }

  const text = resumeText.trim()
  if (text.length > MAX_RESUME_CHARS) {
    return res.status(400).json({ ok: false, error: `Resume too long (max ${MAX_RESUME_CHARS} characters).` })
  }

  const client = new Anthropic({ apiKey: apiKey })

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this resume and output JSON only.\n\n---\n${text}`,
        },
      ],
    })

    const raw = assistantText(message)
    if (!raw) {
      return res.status(502).json({ ok: false, error: 'Empty response from model.' })
    }

    let insight
    try {
      insight = normalizeInsight(parseModelJson(raw))
    } catch {
      const fix = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: 'Output only valid minified JSON with keys: overallScore, headline, primaryFocus, professionalSummary, strengths, growthAreas, nextSteps, fitFor. No prose.',
        messages: [{ role: 'user', content: `Convert to valid JSON only:\n${raw.slice(0, 12000)}` }],
      })
      const raw2 = assistantText(fix)
      insight = normalizeInsight(parseModelJson(raw2))
    }

    return res.json({ ok: true, insight })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('[career/analyze]', msg)
    return res.status(502).json({ ok: false, error: 'Resume analysis failed. Check API key and try again.' })
  }
})
