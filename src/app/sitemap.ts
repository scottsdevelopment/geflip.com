import { MetadataRoute } from 'next';
import { fetchAllMappings } from '@/lib/api';
import { generateSlug } from '@/lib/slug';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://geflip.com';

    // Fetch all items
    const items = await fetchAllMappings();

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1
        },
        {
            url: `${baseUrl}/help`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7
        },
        {
            url: `${baseUrl}/changelog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6
        },
    ];

    // Dynamic item routes
    const itemRoutes: MetadataRoute.Sitemap = items.map((item) => ({
        url: `${baseUrl}/item/${generateSlug(item.name)}`,
        lastModified: new Date(),
        changeFrequency: 'hourly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...itemRoutes];
}
