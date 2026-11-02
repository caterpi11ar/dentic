const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve(__dirname, '../dist')
if (!fs.existsSync(path.join(root, 'app.json'))) throw new Error('Build the WeChat mini-program first')
function size(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => {
    const file = path.join(dir, entry.name)
    return sum + (entry.isDirectory() ? size(file) : fs.statSync(file).size)
  }, 0)
}
const bytes = size(root)
console.log(`WeChat output: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KiB); limit: 2048 KiB`)
if (fs.existsSync(path.join(root, 'h5'))) throw new Error('H5 output must not be inside the mini-program root')
if (bytes > 2 * 1024 * 1024) throw new Error('Mini-program output exceeds 2 MiB')
