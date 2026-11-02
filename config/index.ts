import { defineConfig } from '@tarojs/cli'
import path from 'node:path'
import tailwindcss from 'tailwindcss'
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'

export default defineConfig({
  projectName: 'dentic-starter',
  date: '2026-10-27',
  designWidth: 750,
  deviceRatio: { 750: 1 },
  sourceRoot: 'src',
  outputRoot: process.env.TARO_ENV === 'h5' ? 'dist-h5' : 'dist',
  copy: { patterns: [{ from: 'src/static/assets/pet-sprites/', to: process.env.TARO_ENV === 'h5' ? 'dist-h5/assets/pet-sprites/' : 'dist/assets/pet-sprites/' }, { from: 'src/static/assets/brush-audio/', to: process.env.TARO_ENV === 'h5' ? 'dist-h5/assets/brush-audio/' : 'dist/assets/brush-audio/' }], options: {} },
  framework: 'react',
  plugins: ['@tarojs/plugin-framework-react'],
  alias: { '@': path.resolve(process.cwd(), 'src') },
  h5: { publicPath: '/', router: { mode: 'hash' }, devServer: { host: '127.0.0.1', port: 10086 } },
  mini: { postcss: { pxtransform: { enable: true } } },
  compiler: {
    type: 'vite',
    vitePlugins: [
      {
        name: 'tailwind-postcss',
        config() {
          return { publicDir: process.env.TARO_ENV === 'h5' ? path.resolve(process.cwd(), 'src/static') : false, css: { postcss: { plugins: [tailwindcss()] } } }
        },
      },
      UnifiedViteWeappTailwindcssPlugin({
        disabled: process.env.TARO_ENV === 'h5',
        rem2rpx: true,
        injectAdditionalCssVarScope: true,
      }),
    ],
  },
})
