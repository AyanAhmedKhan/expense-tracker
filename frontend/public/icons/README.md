# Icons & Favicons

This folder contains source vector assets for FinTrack.

## Files
- `logo.svg` – Primary square app logo (256x256). Use to generate PWA icons.
- `favicon.svg` – Simplified favicon shape (64x64).

## Generating PNGs
Generate required sizes (192, 512, maskable) from `logo.svg`:

Examples using Node sharp (optional):
```bash
npm install sharp --save-dev
npx sharp public/icons/logo.svg -o public/icons/pwa-192.png resize 192 192
npx sharp public/icons/logo.svg -o public/icons/pwa-512.png resize 512 512
npx sharp public/icons/logo.svg -o public/icons/pwa-512-maskable.png resize 512 512
```

Or using ImageMagick:
```bash
magick convert public/icons/logo.svg -resize 192x192 public/icons/pwa-192.png
magick convert public/icons/logo.svg -resize 512x512 public/icons/pwa-512.png
magick convert public/icons/logo.svg -resize 512x512 public/icons/pwa-512-maskable.png
```

Then move or copy the generated PNG files to `public/` root OR adjust `manifest.webmanifest` paths to `icons/pwa-*.png`.

## Updating Manifest
If keeping icons inside this folder, update `manifest.webmanifest` icon entries to:
```json
"icons": [
  { "src": "icons/pwa-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "icons/pwa-512.png", "sizes": "512x512", "type": "image/png" },
  { "src": "icons/pwa-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
]
```

## Favicon Generation
For classic favicon:
```bash
magick convert public/icons/favicon.svg -resize 32x32 public/favicon.ico
```
Ensure `index.html` references the correct favicon path.

## Maskable Icon Note
Maskable icons allow Android to crop correctly. Make sure important logo content is centered with padding.
