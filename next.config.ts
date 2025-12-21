import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración de Turbopack para alinear con la personalización de Webpack
  // Evitamos resolver 'canvas' en el navegador (usado por ramas Node de algunas libs)
  turbopack: {
    resolveAlias: {
  // Apunta a un shim local para reemplazar 'canvas' en el cliente
  canvas: require.resolve('./shims/canvas.js'),
    },
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', 
        'localhost:9002',
        '*.github.dev',
        '*.gitpod.io',
        '*.repl.co',
        '*.app.github.dev'
      ],
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['genkit', 'dotprompt'],
};

export default nextConfig;