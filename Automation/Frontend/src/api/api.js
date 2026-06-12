const BASE = '/api'

export async function createSession() {
  const r = await fetch(`${BASE}/session`, { method: 'POST' })
  const d = await r.json()
  return d.session_id
}

export async function uploadFile(sessionId, file, endpoint, extraFields = {}) {
  const form = new FormData()
  form.append('file', file)
  form.append('session_id', sessionId)
  for (const [k, v] of Object.entries(extraFields)) {
    form.append(k, v)
  }
  const r = await fetch(`${BASE}/upload/${endpoint}`, { method: 'POST', body: form })
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.detail || 'Upload failed')
  }
  return r.json()
}

export async function getPreview(sessionId) {
  const r = await fetch(`${BASE}/preview/${sessionId}`)
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.detail || 'Preview failed')
  }
  return r.json()
}

export async function generateReport(sessionId, manual) {
  const r = await fetch(`${BASE}/generate/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(manual),
  })
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.detail || 'Generation failed')
  }
  const blob = await r.blob()
  const cd = r.headers.get('Content-Disposition') || ''
  const match = cd.match(/filename="?([^"]+)"?/)
  const filename = match ? match[1] : 'report.xlsm'
  return { blob, filename }
}