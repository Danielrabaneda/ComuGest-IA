import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ComuGest IA',
    short_name: 'ComuGest',
    description: 'Tu Secretario Virtual de Comunidad potenciado por IA',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/logo-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
