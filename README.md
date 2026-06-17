# SEO Meta-Tag Generator 🏷️

A free, no-signup tool that generates production-ready HTML meta tags instantly — including Primary SEO tags, Open Graph, and Twitter Card tags. Built as part of the **Digital Heroes** developer trial task.

🔗 **Live Demo:** [[seo-meta-tag-generator.vercel.app](https://seo-meta-tag-generator-7e9h.vercel.app/)]([https://seo-meta-tag-generator.vercel.app](https://seo-meta-tag-generator-7e9h.vercel.app/))

---

## Features

- ✅ Generates Primary, Open Graph, and Twitter Card meta tags
- ✅ Real-time SEO score (Excellent / Good / Needs Improvement)
- ✅ Character counter with warnings for title & description
- ✅ Keyword pill preview
- ✅ One-click copy to clipboard
- ✅ Supports 5 page types — Website, Blog Post, YouTube Video, Product Page, Portfolio
- ✅ Beginner SEO tips section
- ✅ Fully responsive — works on mobile & desktop
- ✅ No backend, no signup, no cost

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Vercel | Deployment |

---

## Project Structure

```
seo-meta-tag-generator/
├── src/
│   ├── App.jsx        # Main app — all components and logic
│   ├── main.jsx       # React entry point
│   └── index.css      # Tailwind + custom styles
├── index.html         # HTML shell
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── vercel.json        # Vercel SPA rewrite rule
```

---

## Local Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/ABHIKALVIUM/seo-meta-tag-generator.git
cd seo-meta-tag-generator
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**4. Build for production**

```bash
npm run build
```

The output will be in the `dist/` folder.

**5. Preview production build locally**

```bash
npm run preview
```

---

## Deployment (Vercel)

This project is deployed on Vercel's free Hobby plan.

1. Push your code to a public GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Vercel auto-detects Vite — no extra config needed
4. Click **Deploy**

The `vercel.json` file handles SPA routing automatically.

---

## Built By

**Abhishek Chaudhari**
📧 abhishekdipak2023@gmail.com
🐙 [github.com/ABHIKALVIUM](https://github.com/ABHIKALVIUM)

---

Built for [Digital Heroes](https://digitalheroesco.com) 🥇
