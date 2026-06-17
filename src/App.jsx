import { useState, useCallback, useEffect } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const TITLE_MAX = 100
const TITLE_WARN = 60
const TITLE_DANGER = 70

const DESC_MAX = 200
const DESC_WARN = 150
const DESC_DANGER = 160

const KEYWORD_MAX = 500

const PAGE_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'article', label: 'Blog Post' },
  { value: 'video.other', label: 'YouTube Video' },
  { value: 'product', label: 'Product Page' },
  { value: 'profile', label: 'Portfolio' },
]

const SEO_TIPS = [
  {
    icon: '🎯',
    title: 'Target One Primary Keyword',
    body: 'Focus each page on a single primary keyword. Place it near the start of your title tag for maximum impact.',
  },
  {
    icon: '📝',
    title: 'Write for Humans First',
    body: 'Your meta description is a mini-ad in search results. Make it compelling so users want to click — CTR affects rankings.',
  },
  {
    icon: '🔗',
    title: 'Unique Tags on Every Page',
    body: 'Never duplicate title tags or meta descriptions across pages. Each page must have a unique, descriptive tag.',
  },
  {
    icon: '📱',
    title: 'Open Graph Boosts Social Shares',
    body: 'OG tags control how your page looks when shared on Facebook, LinkedIn, or WhatsApp — always include them.',
  },
  {
    icon: '⚡',
    title: 'Speed + Tags = Rankings',
    body: 'Meta tags alone won\'t rank you. Pair great tags with fast page load (under 2s) for the best SEO results.',
  },
]

// ─── Helper: Counter colour ───────────────────────────────────────────────────
function counterColor(len, warn, danger) {
  if (len >= danger) return 'text-red-500'
  if (len >= warn) return 'text-orange-500'
  return 'text-slate-400'
}

// ─── Helper: SEO Score ────────────────────────────────────────────────────────
// Multi-factor scoring: title (35pts), description (35pts), keywords (20pts), pageType (10pts)
function getSeoScore(title, description, keywords, pageType) {
  const t = title.trim()
  const d = description.trim()
  const tLen = t.length
  const dLen = d.length
  const kwCount = keywords.trim()
    ? keywords.split(',').map(k => k.trim()).filter(Boolean).length
    : 0

  let points = 0

  // ── Title scoring (35 pts) ────────────────────────────────────────────────
  if (tLen >= 50 && tLen <= 60) {
    points += 35          // perfect sweet-spot
  } else if (tLen >= 40 && tLen <= 70) {
    points += 25          // acceptable range
  } else if (tLen >= 20 && tLen < 40) {
    points += 15          // too short but usable
  } else if (tLen > 70) {
    points += 10          // too long — will be truncated
  } else if (tLen > 0) {
    points += 5           // something is there
  }
  // Bonus: title contains at least one keyword word (shows keyword alignment)
  if (tLen > 0 && kwCount > 0) {
    const firstKw = keywords.split(',')[0].trim().toLowerCase()
    if (t.toLowerCase().includes(firstKw.split(' ')[0])) points += 0 // no extra, already rewarded
  }

  // ── Description scoring (35 pts) ─────────────────────────────────────────
  if (dLen >= 120 && dLen <= 160) {
    points += 35          // perfect
  } else if (dLen >= 80 && dLen < 120) {
    points += 25          // good but slightly short
  } else if (dLen > 160 && dLen <= 200) {
    points += 20          // slightly over but still rich
  } else if (dLen >= 50 && dLen < 80) {
    points += 15          // thin
  } else if (dLen > 0) {
    points += 8
  }

  // ── Keywords scoring (20 pts) ─────────────────────────────────────────────
  if (kwCount >= 3 && kwCount <= 8) {
    points += 20          // ideal: focused set
  } else if (kwCount === 2) {
    points += 14
  } else if (kwCount === 1) {
    points += 8
  } else if (kwCount > 8) {
    points += 10          // too many — dilutes focus
  }

  // ── Page type set (10 pts) ────────────────────────────────────────────────
  if (pageType && pageType !== 'website') {
    points += 10          // specific page type = better structured data
  } else if (pageType === 'website') {
    points += 7           // valid, just generic
  }

  const pct = Math.min(100, points)

  // Build a hint for non-excellent scores
  const hints = []
  const tLen2 = t.length
  const dLen2 = d.length
  if (tLen2 < 50) hints.push(`title too short (${tLen2} chars — aim for 50–60)`)
  else if (tLen2 > 60) hints.push(`title too long (${tLen2} chars — keep under 60)`)
  if (dLen2 < 120) hints.push(`description too short (${dLen2} chars — aim for 120–160)`)
  else if (dLen2 > 160) hints.push(`description too long (${dLen2} chars — trim to 160)`)
  if (kwCount < 3) hints.push('add at least 3 keywords')
  const hintStr = hints.length > 0 ? `To reach Excellent: ${hints.join('; ')}.` : null

  if (pct >= 90) {
    return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', pct: 100, hint: null }
  }
  if (pct >= 65) {
    return { label: 'Good', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', pct: Math.max(65, pct), hint: hintStr }
  }
  return { label: 'Needs Improvement', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', pct: Math.max(20, pct), hint: hintStr }
}

// ─── Helper: Generate meta tag HTML ──────────────────────────────────────────
function generateMetaTags(title, description, keywords, pageType) {
  const t = title.trim() || 'Your Page Title Here'
  const d = description.trim() || 'Your meta description here.'
  const k = keywords.trim() || 'keyword1, keyword2, keyword3'
  const pt = pageType || 'website'

  // Derive a clean site name from the title (first 2–3 words)
  const siteName = t.split(' ').slice(0, 3).join(' ')

  // Page-type-specific extra Open Graph tags
  const ogTypeExtras = pt === 'article'
    ? `\n<meta property="article:published_time" content="${new Date().toISOString().split('T')[0]}">\n<meta property="article:author" content="https://yourwebsite.com/author">`
    : pt === 'product'
    ? `\n<meta property="product:availability" content="in stock">\n<meta property="product:condition" content="new">`
    : ''

  return `<!-- Primary Meta Tags -->
<title>${t}</title>
<meta name="title" content="${t}">
<meta name="description" content="${d}">
<meta name="keywords" content="${k}">
<meta name="robots" content="index, follow">
<meta name="revisit-after" content="7 days">
<meta name="author" content="Your Name">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="language" content="English">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Canonical URL (replace with your actual page URL) -->
<link rel="canonical" href="https://yourwebsite.com/">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${pt}">
<meta property="og:url" content="https://yourwebsite.com/">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="https://yourwebsite.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:locale" content="en_US">${ogTypeExtras}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="https://yourwebsite.com/">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="https://yourwebsite.com/twitter-image.jpg">
<meta name="twitter:image:alt" content="${t}">
<meta name="twitter:site" content="@yourhandle">
<meta name="twitter:creator" content="@yourhandle">`
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CharCounter({ current, max, warn, danger }) {
  return (
    <span className={`text-xs font-semibold tabular-nums transition-colors duration-200 ${counterColor(current, warn, danger)}`}>
      {current}/{max}
    </span>
  )
}

function InputSection({ id, label, tip, children, counter }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {tip && (
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
          <span className="text-brand-500">💡</span>
          {tip}
        </p>
      )}
    </div>
  )
}

function ScoreBar({ pct, label, color, dot, hint }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-600">SEO Score</span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${color}`}>
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          {label}
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            pct === 100 ? 'bg-emerald-500' : pct > 64 ? 'bg-blue-500' : 'bg-amber-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && (
        <p className="text-xs text-slate-500 flex items-start gap-1.5 pt-0.5">
          <span className="text-amber-500 flex-shrink-0">💡</span>
          {hint}
        </p>
      )}
    </div>
  )
}

function Toast({ visible }) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-900 text-white
        px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}
    >
      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Copied to clipboard!
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [keywords, setKeywords] = useState('')
  const [pageType, setPageType] = useState('website')
  const [output, setOutput] = useState('')
  const [score, setScore] = useState(null)
  const [toast, setToast] = useState(false)

  // Keyword count
  const keywordCount = keywords.trim()
    ? keywords.split(',').map(k => k.trim()).filter(Boolean).length
    : 0

  // Generate
  const handleGenerate = useCallback(() => {
    const html = generateMetaTags(title, description, keywords, pageType)
    const seoScore = getSeoScore(title, description, keywords, pageType)
    setOutput(html)
    setScore(seoScore)
    setTimeout(() => {
      document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [title, description, keywords, pageType])

  // Reset
  const handleReset = useCallback(() => {
    setTitle('')
    setDescription('')
    setKeywords('')
    setPageType('website')
    setOutput('')
    setScore(null)
  }, [])

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setToast(true)
      setTimeout(() => setToast(false), 2500)
    })
  }, [output])

  // Auto-generate on Enter in title (convenience)
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') handleGenerate()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 shadow-md shadow-brand-200 flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">SEO Meta-Tag Generator</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Free professional SEO tool</p>
            </div>
          </div>

          {/* CTA Button — MANDATORY */}
          <button
            id="digital-heroes-cta"
            type="button"
            onClick={() => window.open('https://digitalheroesco.com', '_blank', 'noopener,noreferrer')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white
                       bg-gradient-to-r from-violet-600 to-violet-500
                       hover:from-violet-700 hover:to-violet-600
                       shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-200
                       active:scale-95 transition-all duration-200 whitespace-nowrap flex-shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Built for Digital Heroes
          </button>
        </div>
      </header>

      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 text-white py-14 px-4">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-black/10 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 text-white/90 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            100% Free · No signup · No backend
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
            Generate Perfect SEO<br className="hidden sm:block" /> Meta Tags Instantly
          </h2>
          <p className="text-brand-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Create production-ready HTML meta tags for better Google rankings,
            social previews, and click-through rates — in seconds.
          </p>
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Left Panel — Inputs */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800">Page Details</h3>
            </div>

            {/* ── 1. Page Title ── */}
            <InputSection
              id="page-title"
              label="Page Title"
              tip="Optimal title length is 50–60 characters for SEO"
              counter={
                <CharCounter current={title.length} max={TITLE_MAX} warn={TITLE_WARN} danger={TITLE_DANGER} />
              }
            >
              <input
                id="page-title"
                type="text"
                maxLength={TITLE_MAX}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                placeholder="e.g. Best Free SEO Tools for Beginners in 2024"
                className="input-base"
                autoComplete="off"
              />
              {title.length >= TITLE_WARN && (
                <p className={`text-xs font-medium mt-1 ${title.length >= TITLE_DANGER ? 'text-red-500' : 'text-orange-500'}`}>
                  {title.length >= TITLE_DANGER
                    ? '⚠️ Title is too long — Google may truncate it in search results.'
                    : '⚠️ Approaching maximum recommended title length.'}
                </p>
              )}
            </InputSection>

            {/* ── 2. Meta Description ── */}
            <InputSection
              id="meta-description"
              label="Meta Description"
              tip="Keep meta descriptions under 160 characters"
              counter={
                <CharCounter current={description.length} max={DESC_MAX} warn={DESC_WARN} danger={DESC_DANGER} />
              }
            >
              <textarea
                id="meta-description"
                maxLength={DESC_MAX}
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Discover the top free SEO tools trusted by 10,000+ marketers. Improve rankings, traffic, and conversions today."
                className="input-base resize-none"
              />
              {description.length >= DESC_WARN && (
                <p className={`text-xs font-medium mt-1 ${description.length >= DESC_DANGER ? 'text-red-500' : 'text-orange-500'}`}>
                  {description.length >= DESC_DANGER
                    ? '⚠️ Description too long — search engines will truncate it.'
                    : '⚠️ Approaching the 160-character limit.'}
                </p>
              )}
            </InputSection>

            {/* ── 3. Keywords ── */}
            <InputSection
              id="keywords"
              label="Keywords (comma-separated)"
              counter={
                <span className="text-xs font-semibold text-slate-400 tabular-nums">
                  {keywordCount} keyword{keywordCount !== 1 ? 's' : ''} · {keywords.length}/{KEYWORD_MAX} chars
                </span>
              }
            >
              <input
                id="keywords"
                type="text"
                maxLength={KEYWORD_MAX}
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                placeholder="e.g. SEO tools, meta tags, search engine optimisation"
                className="input-base"
                autoComplete="off"
              />
              {keywordCount > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 15).map((kw, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium border border-brand-100"
                    >
                      {kw}
                    </span>
                  ))}
                  {keywordCount > 15 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium">
                      +{keywordCount - 15} more
                    </span>
                  )}
                </div>
              )}
            </InputSection>

            {/* ── 4. Page Type ── */}
            <InputSection id="page-type" label="Page Type">
              <div className="relative">
                <select
                  id="page-type"
                  value={pageType}
                  onChange={e => setPageType(e.target.value)}
                  className="input-base appearance-none pr-10 cursor-pointer"
                >
                  {PAGE_TYPES.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </InputSection>

            {/* ── Action Buttons ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="generate-btn"
                onClick={handleGenerate}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white
                           bg-gradient-to-r from-brand-600 to-accent-500
                           hover:from-brand-700 hover:to-accent-600
                           active:scale-95 transition-all duration-200
                           shadow-lg shadow-brand-200 hover:shadow-xl hover:shadow-brand-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Meta Tags
              </button>
              <button
                id="reset-btn"
                onClick={handleReset}
                className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm
                           text-slate-600 bg-slate-100 hover:bg-slate-200
                           active:scale-95 transition-all duration-200 border border-slate-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel — Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Output Box */}
          <div id="output-section" className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-500 font-mono">meta-tags.html</span>
              </div>
              {output && (
                <button
                  id="copy-btn"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold
                             bg-brand-600 text-white hover:bg-brand-700
                             active:scale-95 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </button>
              )}
            </div>

            <div className="p-5 min-h-[260px] flex items-center justify-center">
              {output ? (
                <div className="w-full animate-fade-in">
                  <pre className="code-output text-slate-700 bg-slate-50 rounded-xl p-4 overflow-x-auto text-xs leading-relaxed border border-slate-100">
                    <code>{output}</code>
                  </pre>
                  {score && <ScoreBar {...score} />}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-400">Your generated meta tags will<br />appear here</p>
                  <p className="text-xs text-slate-300">Fill in the form and click "Generate Meta Tags"</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Title', value: title.length, max: 60, unit: 'chars' },
              { label: 'Description', value: description.length, max: 160, unit: 'chars' },
              { label: 'Keywords', value: keywordCount, max: null, unit: 'tags' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-3.5 text-center shadow-sm">
                <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-xl font-extrabold tabular-nums leading-none ${
                  stat.max && stat.value > stat.max ? 'text-red-500' :
                  stat.max && stat.value >= stat.max * 0.9 ? 'text-orange-500' :
                  'text-slate-800'
                }`}>
                  {stat.value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── SEO Tips Section ───────────────────────────────────────────────── */}
      <section aria-label="SEO Tips" className="bg-white border-t border-slate-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-brand-100 mb-3">
              📚 SEO Education
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Beginner SEO Tips</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Master the fundamentals of on-page SEO to get your pages ranking higher on Google.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SEO_TIPS.map((tip, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm
                           hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5
                           transition-all duration-200 cursor-default"
              >
                <div className="text-2xl mb-3">{tip.icon}</div>
                <h3 className="text-sm font-bold text-slate-800 mb-1.5 group-hover:text-brand-700 transition-colors">
                  {tip.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-300 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white">SEO Meta-Tag Generator</p>
                <p className="text-xs text-slate-400">Free · No signup · Open source</p>
              </div>
            </div>

            {/* Creator Info — MANDATORY */}
            <div className="text-center sm:text-right space-y-1">
              <p className="text-sm font-semibold text-white">
                Built by{' '}
                <span className="text-brand-400 font-bold">Abhishek Chaudhari</span>
              </p>
              <a
                id="footer-email"
                href="mailto:abhishekdipak2023@gmail.com"
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors duration-200 font-medium"
              >
                abhishekdipak2023@gmail.com
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Abhishek Chaudhari. All rights reserved.</p>
            <p>
              Powered by{' '}
              <a
                href="https://digitalheroesco.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                Digital Heroes Co.
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Toast Notification ─────────────────────────────────────────────── */}
      <Toast visible={toast} />
    </div>
  )
}