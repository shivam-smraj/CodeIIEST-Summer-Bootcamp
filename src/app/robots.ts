import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://codeiiest-bootcamp.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/api/'], // Disallow private areas and API endpoints
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
