import lingoCompiler from "lingo.dev/compiler";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable Turbopack (required for Next.js 16)
  turbopack: {},

  // (Optional but recommended)
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },
};

export default lingoCompiler.next({
  sourceRoot: "src/app",            // Where your app code lives
  lingoDir: ".lingo",                // Where translations are stored
  sourceLocale: "en",                // Default language
  targetLocales: ["hi", "es", "fr", "de", "ja", "ar"],
  rsc: true,                         // App Router + RSC support
  useDirective: false,
  debug: false,

  // Use Lingo.dev translation engine
  models: "lingo.dev",

  // Development behavior
  dev: {
    usePseudotranslator: true,
  },

  // Production builds use cached translations
  buildMode: "cache-only",
})(nextConfig);
