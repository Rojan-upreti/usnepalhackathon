import mammoth from 'mammoth'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

export const MAX_RESUME_CHARS = 80_000

let pdfWorkerReady = false

function ensurePdfWorker() {
  if (pdfWorkerReady) return
  GlobalWorkerOptions.workerSrc = pdfWorkerSrc
  pdfWorkerReady = true
}

function readPlainTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the text file.'))
    reader.readAsText(file)
  })
}

async function extractPdfText(file: File): Promise<string> {
  ensurePdfWorker()
  const data = new Uint8Array(await file.arrayBuffer())
  let pdf
  try {
    const task = getDocument({ data, isEvalSupported: false })
    pdf = await task.promise
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (/password|encrypt/i.test(msg)) {
      throw new Error('This PDF is password-protected. Remove the password or paste the text instead.')
    }
    throw new Error('Could not open this PDF. Try another file or paste your resume as text.')
  }

  const chunks: string[] = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if (item && typeof item === 'object' && 'str' in item && typeof item.str === 'string' && item.str) {
        chunks.push(item.str)
      }
    }
    chunks.push('\n')
  }

  const text = chunks.join(' ').replace(/\s+/g, ' ').trim()
  if (!text) {
    throw new Error(
      'No selectable text was found in this PDF. It may be image-only (scanned). Try DOCX, TXT, or paste the text.',
    )
  }
  return text
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value.replace(/\s+/g, ' ').trim()
  if (!text) {
    throw new Error('No text found in this Word document.')
  }
  return text
}

function isDocx(file: File): boolean {
  const n = file.name.toLowerCase()
  return (
    n.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
}

function isPdf(file: File): boolean {
  return file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
}

function isTxt(file: File): boolean {
  return file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain' || file.type === ''
}

/**
 * Extract plain resume text from a user file (PDF, DOCX, or TXT) in the browser.
 */
export async function extractResumeTextFromFile(file: File): Promise<string> {
  if (!file?.size) {
    throw new Error('The file is empty.')
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('File is too large (max 12 MB).')
  }

  const name = file.name.toLowerCase()
  if (name.endsWith('.doc') && !name.endsWith('.docx')) {
    throw new Error(
      'Older .doc files are not supported in the browser. Save as .docx or export to PDF, then try again.',
    )
  }

  if (isTxt(file)) {
    const t = (await readPlainTextFile(file)).trim()
    if (!t) throw new Error('The text file is empty.')
    return t.replace(/\r\n/g, '\n')
  }

  if (isPdf(file)) {
    return extractPdfText(file)
  }

  if (isDocx(file)) {
    return extractDocxText(file)
  }

  throw new Error('Unsupported format. Use PDF, DOCX, or TXT.')
}
