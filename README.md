# Mist — PolyCreator example theme family

Reference for theme authors. A theme plugin is **data-only**: no JS, just
`manifest.json` + theme JSON files. This repo ships a family of two:

| File | Theme id | Appearance |
|---|---|---|
| `theme.json` | `example.mist` | light |
| `theme-dark.json` | `example.mist:theme-dark` | dark (extends `builtin-dark`) |

## Make your own

1. Copy this repo (or start from two files — the shapes below are the whole contract).
2. Edit the colors. Only the 47 known tokens in `@polycreator/plugin-manifest`
   (`THEME_TOKENS`) take effect; unknown keys warn and are dropped.
   Values must be plain CSS color literals (`#rrggbb`, `oklch(…)`, …) —
   no `var()` / `url()` / `calc()` / gradients.
3. Optional: `metrics` (radius 0–40px, blur 0–60px, alpha 0–100%),
   `vibrancy: "default" | "none"`, `extends` (another theme id or
   `builtin-light` / `builtin-dark`; your own values win, a missing base
   degrades with a warning, never fatal).
4. Bump `version` in `manifest.json`, tag `vX.Y.Z`, push — the release
   workflow below packs the zip.

## File layout contract

- `manifest.json` declares `theme: { files }` and **no `main`**.
  Up to 8 files per family; one bad file rejects the whole install.
- The file named `theme.json` keeps the plugin id — keep it primary so
  growing variants never moves the base id (`extends` targets and stored
  slot prefs keep resolving).
- Packing computes `integrity` (SHA-256 over `[main?, nodeEntry?, ...theme.files?]`
  in declaration order) and injects it into the manifest copy inside the zip.
  The desktop install gate recomputes and rejects drift.

## Install

- In-app market (after registry listing), or
- Desktop: Settings → Plugins → From URL, paste the release zip URL, or
- Deep link: `polycreator://install?url=<zip-url>`
