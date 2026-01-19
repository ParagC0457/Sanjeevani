/**
 * Medical News Scraper
 * Fetches latest health news from reliable medical sources
 */

export type NewsArticle = {
    title: string;
    description: string;
    url: string;
    imageUrl: string;
    source: string;
    publishedAt: string;
    category: string;
};

// Fallback static articles when API/scraping fails
export const fallbackArticles: NewsArticle[] = [
    {
        title: 'Understanding Diabetes: Latest Research',
        description: 'New studies reveal promising treatments and management strategies for diabetes patients.',
        url: 'https://www.cdc.gov/diabetes/basics/index.html',
        imageUrl: '/images/health/diabetes.png',
        source: 'CDC',
        publishedAt: new Date().toISOString(),
        category: 'Chronic Conditions'
    },
    {
        title: 'Heart Health: Prevention Tips for 2025',
        description: 'Cardiologists share the latest guidelines for maintaining a healthy heart.',
        url: 'https://www.heart.org/en/healthy-living',
        imageUrl: '/images/health/heart.png',
        source: 'AHA',
        publishedAt: new Date().toISOString(),
        category: 'Cardiovascular'
    },
    {
        title: 'Mental Health Awareness: Breaking the Stigma',
        description: 'Resources and support for mental health challenges in the modern world.',
        url: 'https://www.nimh.nih.gov/health',
        imageUrl: '/images/health/mental-health.png',
        source: 'NIMH',
        publishedAt: new Date().toISOString(),
        category: 'Mental Health'
    },
    {
        title: 'Flu Season 2025: What You Need to Know',
        description: 'Latest updates on flu strains and vaccination recommendations.',
        url: 'https://www.cdc.gov/flu/index.htm',
        imageUrl: '/images/health/flu.png',
        source: 'CDC',
        publishedAt: new Date().toISOString(),
        category: 'Infectious Disease'
    },
    {
        title: 'Nutrition Science: Superfoods for Immunity',
        description: 'Evidence-based dietary choices to boost your immune system naturally.',
        url: 'https://www.hsph.harvard.edu/nutritionsource/',
        imageUrl: '/images/health/nutrition.png',
        source: 'Harvard Health',
        publishedAt: new Date().toISOString(),
        category: 'Nutrition'
    },
    {
        title: 'Sleep Health: The Science of Better Rest',
        description: 'Understanding sleep cycles and tips for improving sleep quality.',
        url: 'https://www.sleepfoundation.org/',
        imageUrl: '/images/health/sleep.png',
        source: 'Sleep Foundation',
        publishedAt: new Date().toISOString(),
        category: 'Wellness'
    },
    {
        title: 'The Benefits of Daily Exercise',
        description: 'How regular physical activity improves overall health and longevity.',
        url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
        imageUrl: '/images/health/fitness.png',
        source: 'WHO',
        publishedAt: new Date().toISOString(),
        category: 'Wellness'
    },
    {
        title: 'Regular Check-ups Save Lives',
        description: 'Why annual medical examinations are crucial for early detection of health issues.',
        url: 'https://medlineplus.gov/ency/article/002125.htm',
        imageUrl: '/images/health/medical-default.png',
        source: 'MedlinePlus',
        publishedAt: new Date().toISOString(),
        category: 'Health News'
    }
];

// Medical news RSS feeds to scrape
const NEWS_SOURCES = [
    {
        name: 'Medical News Today',
        rssUrl: 'https://www.medicalnewstoday.com/rss/feed',
        baseUrl: 'https://www.medicalnewstoday.com'
    },
    {
        name: 'WebMD',
        rssUrl: 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
        baseUrl: 'https://www.webmd.com'
    },
    {
        name: 'Health News',
        rssUrl: 'https://www.sciencedaily.com/rss/health_medicine.xml',
        baseUrl: 'https://www.sciencedaily.com'
    }
];

/**
 * Parse RSS XML to extract news articles
 */
function parseRSSXml(xmlText: string, sourceName: string): NewsArticle[] {
    const articles: NewsArticle[] = [];

    try {
        // Simple XML parsing for RSS items
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
        const descRegex = /<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/;
        const linkRegex = /<link>(.*?)<\/link>|<link><!\[CDATA\[(.*?)\]\]>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
        const imageRegex = /<media:content[^>]*url="([^"]*)"[^>]*>|<enclosure[^>]*url="([^"]*)"[^>]*>/;

        let match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
            const itemContent = match[1];

            const titleMatch = titleRegex.exec(itemContent);
            const descMatch = descRegex.exec(itemContent);
            const linkMatch = linkRegex.exec(itemContent);
            const pubDateMatch = pubDateRegex.exec(itemContent);
            const imageMatch = imageRegex.exec(itemContent);

            const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
            const description = descMatch ? (descMatch[1] || descMatch[2] || '').replace(/<[^>]*>/g, '').trim().slice(0, 200) : '';
            const url = linkMatch ? (linkMatch[1] || linkMatch[2] || '').trim() : '';
            const publishedAt = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
            const imageUrl = imageMatch ? (imageMatch[1] || imageMatch[2] || '') : '';

            if (title && url) {
                articles.push({
                    title,
                    description: description || 'Read more about this health topic.',
                    url,
                    imageUrl: imageUrl || '',
                    source: sourceName,
                    publishedAt,
                    category: 'Health News'
                });
            }
        }
    } catch (error) {
        console.error('Error parsing RSS:', error);
    }

    return articles;
}

/**
 * Fetch news from RSS feeds
 */
export async function fetchMedicalNews(): Promise<NewsArticle[]> {
    const allArticles: NewsArticle[] = [];

    for (const source of NEWS_SOURCES) {
        try {
            const response = await fetch(source.rssUrl, {
                next: { revalidate: 3600 }, // Cache for 1 hour
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Sanjeevani Health App)'
                }
            });

            if (response.ok) {
                const xmlText = await response.text();
                const articles = parseRSSXml(xmlText, source.name);
                allArticles.push(...articles.slice(0, 5)); // Take top 5 from each source
            }
        } catch (error) {
            console.error(`Failed to fetch from ${source.name}:`, error);
        }
    }

    // If we got articles, return them; otherwise return fallback
    if (allArticles.length > 0) {
        return allArticles.slice(0, 12); // Return max 12 articles
    }

    return fallbackArticles;
}

/**
 * Get category-specific local image if available
 */
export function getCategoryImage(category: string, title: string): string | null {
    const lowerTitle = title.toLowerCase();
    const lowerCategory = (category || '').toLowerCase();

    // Specific keyword matching for premium local images
    if (lowerTitle.includes('diabetes') || lowerTitle.includes('blood sugar') || lowerTitle.includes('glucose')) {
        return '/images/health/diabetes.png';
    }
    if (lowerTitle.includes('heart') || lowerTitle.includes('cardiac') || lowerTitle.includes('cardio') || lowerCategory.includes('cardiovascular')) {
        return '/images/health/heart.png';
    }
    if (lowerTitle.includes('mental') || lowerTitle.includes('anxiety') || lowerTitle.includes('depression') || lowerTitle.includes('stress') || lowerCategory.includes('mental')) {
        return '/images/health/mental-health.png';
    }
    if (lowerTitle.includes('flu') || lowerTitle.includes('cold') || lowerTitle.includes('virus') || lowerTitle.includes('infection') || lowerTitle.includes('covid')) {
        return '/images/health/flu.png';
    }
    if (lowerTitle.includes('nutrition') || lowerTitle.includes('diet') || lowerTitle.includes('food') || lowerTitle.includes('eating') || lowerCategory.includes('nutrition')) {
        return '/images/health/nutrition.png';
    }
    if (lowerTitle.includes('sleep') || lowerTitle.includes('insomnia') || lowerTitle.includes('rest') || lowerTitle.includes('bed')) {
        return '/images/health/sleep.png';
    }
    if (lowerTitle.includes('exercise') || lowerTitle.includes('fitness') || lowerTitle.includes('workout') || lowerTitle.includes('gym')) {
        return '/images/health/fitness.png';
    }

    // Default local image if no specific match
    return null;
}

