:root {
  --bg: #f4f6f8;
  --text: #222;
  --card: #ffffff;
  --border: #ddd;
  --header: #1f2937;
  --header-text: #ffffff;
  --nav-btn: #374151;
  --nav-btn-hover: #4b5563;
  --button-bg: #e5e7eb;
  --button-text: #111827;

  /* Font */
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
               Roboto, Helvetica, Arial, sans-serif;
}

/* Dark theme palette + typography scale */
:root[data-theme="dark"] {
  --bg: #0b1220;
  --text: #cbd5e1;          /* softer default text */
  --card: #0f172a;
  --border: #243043;
  --header: #020617;
  --header-text: #e5e7eb;
  --nav-btn: #1f2937;
  --nav-btn-hover: #334155;
  --button-bg: #1f2937;
  --button-text: #cbd5e1;

  /* Sleek text tones */
  --text-main: #cbd5e1;     /* primary text */
  --text-muted: #94a3b8;    /* secondary */
  --text-faint: #64748b;    /* placeholders / hints */
  --text-strong: #e5e7eb;   /* headings */
}

body {
  font-family: var(--font-sans);
  margin: 0;
  background: var(--bg);
  color: var(--text);

  /* Base rhythm */
  line-height: 1.55;
  font-size: 15.5px;
}

header {
  background: var(--header);
  color: var(--header-text);
  padding: 1rem;
}

nav {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: var(--button-bg);
  color: var(--button-text);
  font-family: inherit;
  font-weight: 500;

  /* Make buttons feel less cramped */
  line-height: 1.2;
}

nav button {
  background: var(--nav-btn);
  color: var(--header-text);
}

nav button:hover {
  background: var(--nav-btn-hover);
}

main {
  padding: 1rem;
}

.card {
  background: var(--card);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--border);

  /* subtle depth */
  box-shadow:
    0 1px 0 rgba(255,255,255,0.04),
    0 8px 24px rgba(0,0,0,0.25);
}

/* Headings feel more modern */
h1, h2, h3, h4 {
  font-weight: 600;
  letter-spacing: -0.01em;
}

/* Headings (hierarchy) */
h1 {
  font-size: 1.6rem;
  margin: 0 0 0.75rem 0;
}

h2 {
  font-size: 1.3rem;
  margin: 0 0 0.6rem 0;
}

h3 {
  font-size: 1.05rem;
  margin: 0 0 0.4rem 0;
}

h4 {
  font-size: 0.95rem;
  margin: 0 0 0.3rem 0;
}

/* Section spacing */
.card > h2,
.card > h3 {
  margin-top: 0;
  padding-bottom: 0.25rem;
}

/* Paragraphs / blocks */
p {
  margin: 0.25rem 0 0.75rem;
}

/* Lists and stacked items */
.card > div,
.card > ul,
.card > section {
  margin-top: 0.5rem;
}

/* Improve row spacing inside cards */
.card > div > div {
  row-gap: 0.5rem;
}

/* --- Form controls --- */
input, select, textarea {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.45rem 0.55rem;
  font-family: inherit;
  font-weight: 500;
}

input::placeholder, textarea::placeholder {
  color: color-mix(in srgb, var(--text) 60%, transparent);
}

/* Some browsers render option backgrounds independently */
option {
  background: var(--card);
  color: var(--text);
}

/* Make focus look good */
input:focus, select:focus, textarea:focus {
  outline: 2px solid color-mix(in srgb, var(--text) 25%, transparent);
  outline-offset: 2px;
}

/* -----------------------------
   Dark-theme typography polish
------------------------------ */
[data-theme="dark"] body { color: var(--text-main); }

[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4 { color: var(--text-strong); }

[data-theme="dark"] label,
[data-theme="dark"] strong { color: var(--text-main); }

[data-theme="dark"] small,
[data-theme="dark"] .muted,
[data-theme="dark"] .subtle { color: var(--text-muted); }

[data-theme="dark"] input,
[data-theme="dark"] textarea,
[data-theme="dark"] select { color: var(--text-main); }

[data-theme="dark"] input::placeholder,
[data-theme="dark"] textarea::placeholder { color: var(--text-faint); }

[data-theme="dark"] button { color: var(--text-main); }

/* Checkbox text next to it (your todo rows) */
[data-theme="dark"] input[type="checkbox"] + * {
  color: var(--text-main);
}

/* -----------------------------
   Override hard-coded inline light styles in JS templates
------------------------------ */

/* Any element inside cards that was set to white/light gray inline */
.card [style*="background:#fff"],
.card [style*="background: #fff"],
.card [style*="background:#ffffff"],
.card [style*="background: #ffffff"],
.card [style*="background:#f7f7f7"],
.card [style*="background: #f7f7f7"] {
  background: var(--card) !important;
  color: var(--text) !important;
}

/* Dark mode: aggressively neutralize more inline light backgrounds */
:root[data-theme="dark"] .card [style*="background: white"],
:root[data-theme="dark"] .card [style*="background:white"],
:root[data-theme="dark"] .card [style*="background: #fff"],
:root[data-theme="dark"] .card [style*="background:#fff"],
:root[data-theme="dark"] .card [style*="background: #ffffff"],
:root[data-theme="dark"] .card [style*="background:#ffffff"],
:root[data-theme="dark"] .card [style*="background: #f7f7f7"],
:root[data-theme="dark"] .card [style*="background:#f7f7f7"],
:root[data-theme="dark"] .card [style*="background: #f3f4f6"],
:root[data-theme="dark"] .card [style*="background:#f3f4f6"],
:root[data-theme="dark"] .card [style*="background: #f9fafb"],
:root[data-theme="dark"] .card [style*="background:#f9fafb"],
:root[data-theme="dark"] .card [style*="background: rgb(255, 255, 255)"],
:root[data-theme="dark"] .card [style*="background:rgb(255,255,255)"] {
  background: var(--card) !important;
  color: var(--text-main) !important;
}

/* Neutralize inline light borders */
.card [style*="border:1px solid #ddd"],
.card [style*="border: 1px solid #ddd"],
:root[data-theme="dark"] .card [style*="border:1px solid #e5e7eb"],
:root[data-theme="dark"] .card [style*="border: 1px solid #e5e7eb"] {
  border-color: var(--border) !important;
}

/* Canvas chart background/border (your canvas has inline border/bg) */
canvas {
  background: var(--card) !important;
  border-color: var(--border) !important;
}

/* Slightly tighter UI on mobile */
@media (max-width: 600px) {
  body {
    font-size: 15px;
  }

  h1 {
    font-size: 1.45rem;
  }

  h2 {
    font-size: 1.2rem;
  }
}
