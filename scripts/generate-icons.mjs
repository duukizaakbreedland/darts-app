import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'public/icons/icon.svg'))

const targets = [
  [192, 'public/icons/icon-192.png'],
  [512, 'public/icons/icon-512.png'],
  [180, 'public/icons/apple-touch-icon.png'],
  [32, 'public/icons/favicon-32.png'],
]

for (const [size, out] of targets) {
  await sharp(src).resize(size, size).png().toFile(join(root, out))
  console.log(`✓ ${out} (${size}px)`)
}
