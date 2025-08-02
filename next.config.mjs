let userConfig = undefined
try {
  // try to import ESM first
  userConfig = await import('./v0-user-next.config.mjs')
} catch (e) {
  try {
    // fallback to CJS import
    userConfig = await import("./v0-user-next.config");
  } catch (innerError) {
    // ignore error
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },

  webpack(config) {
    config.module.rules.push({
      /**
       * `resourceQuery: /raw/`  →  only trigger on “?raw” imports,
       *                            so the rest of your TS/JS stays untouched.
       *
       * `type: 'asset/source'`  →  Webpack 5’s built‑in replacement for
       *                            the old raw‑loader (no extra deps needed).
       */
      resourceQuery: /raw/,     // <file>.tsx?raw   or   <file>.md?raw
      type: 'asset/source',
    });
    return config;
  },
}

if (userConfig) {
  // ESM imports will have a "default" property
  const config = userConfig.default || userConfig

  for (const key in config) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...config[key],
      }
    } else {
      nextConfig[key] = config[key]
    }
  }
}

export default nextConfig
