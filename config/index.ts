import { defineConfig } from '@tarojs/cli'
import tailwindcss from 'tailwindcss'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

type ViteCssConfig = {
  css?: {
    postcss?: {
      plugins?: unknown[]
    } | string
  }
}

export default defineConfig({
  projectName: 'dentic',
  date: '2026-03-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    375: 2,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  copy: {
    patterns: [
      { from: 'src/assets/audio/', to: 'dist/assets/audio/' },
    ],
    options: {},
  },
  framework: 'react',
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {},
  alias: {
    '@': 'src',
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
    },
  },
  compiler: {
    type: 'vite',
    vitePlugins: [
      {
        name: 'postcss-config-loader-plugin',
        config(config: ViteCssConfig) {
          if (typeof config.css?.postcss === 'object' && Array.isArray(config.css.postcss.plugins)) {
            config.css.postcss.plugins.unshift(tailwindcss())
          }
        },
      },
      uvtw({
        rem2rpx: true,
        disabled: process.env.TARO_ENV === 'h5',
        injectAdditionalCssVarScope: true,
      }),
    ],
  },
})
