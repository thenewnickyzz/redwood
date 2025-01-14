import react from '@vitejs/plugin-react'
import { build as viteBuild } from 'vite'
import { cjsInterop } from 'vite-plugin-cjs-interop'

import {
  redwoodRoutesAutoLoaderRscServerPlugin,
  getWebSideDefaultBabelConfig,
} from '@redwoodjs/babel-config'
import { getPaths } from '@redwoodjs/project-config'

export async function buildForStreamingServer({
  verbose = false,
  rscEnabled = false,
}: {
  verbose?: boolean
  rscEnabled?: boolean
}) {
  console.log('Starting streaming server build...\n')
  const rwPaths = getPaths()

  if (!rwPaths.web.viteConfig) {
    throw new Error('Vite config not found')
  }

  const reactBabelConfig = getWebSideDefaultBabelConfig({
    forVite: true,
    forRSC: true,
  })
  if (rscEnabled) {
    reactBabelConfig.overrides.push({
      test: /Routes.(js|tsx|jsx)$/,
      plugins: [[redwoodRoutesAutoLoaderRscServerPlugin, {}]],
      babelrc: false,
      ignore: ['node_modules'],
    })
  }

  await viteBuild({
    configFile: rwPaths.web.viteConfig,
    plugins: [
      cjsInterop({
        dependencies: ['@redwoodjs/**'],
      }),
      rscEnabled &&
        react({
          babel: reactBabelConfig,
        }),
    ],
    build: {
      // TODO (RSC): Remove `minify: false` when we don't need to debug as often
      minify: false,
      outDir: rwPaths.web.distServer,
      ssr: true,
      emptyOutDir: true,
    },
    envFile: false,
    logLevel: verbose ? 'info' : 'warn',
  })
}
