
'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';
import { getHealthNews } from '@/app/actions';
import type { NewsArticle } from '@/lib/news-scraper';
import { ExternalLink, Clock, RefreshCw, Newspaper } from 'lucide-react';

// Local stock images mapping for fallback
const STOCK_IMAGES = {
  diabetes: '/images/health/diabetes.png',
  heart: '/images/health/heart.png',
  mentalHealth: '/images/health/mental-health.png',
  flu: '/images/health/flu.png',
  nutrition: '/images/health/nutrition.png',
  sleep: '/images/health/sleep.png',
  fitness: '/images/health/fitness.png',
  default: '/images/health/medical-default.png',
};

// Get appropriate local image based on article content
const getLocalImage = (title: string, category: string): string => {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerTitle.includes('diabetes') || lowerTitle.includes('blood sugar') || lowerTitle.includes('glucose')) {
    return STOCK_IMAGES.diabetes;
  }
  if (lowerTitle.includes('heart') || lowerTitle.includes('cardiac') || lowerCategory.includes('cardiovascular') || lowerTitle.includes('cardio')) {
    return STOCK_IMAGES.heart;
  }
  if (lowerTitle.includes('mental') || lowerTitle.includes('anxiety') || lowerTitle.includes('depression') || lowerTitle.includes('stress') || lowerCategory.includes('mental')) {
    return STOCK_IMAGES.mentalHealth;
  }
  if (lowerTitle.includes('flu') || lowerTitle.includes('cold') || lowerTitle.includes('virus') || lowerTitle.includes('infection') || lowerTitle.includes('covid')) {
    return STOCK_IMAGES.flu;
  }
  if (lowerTitle.includes('nutrition') || lowerTitle.includes('diet') || lowerTitle.includes('food') || lowerTitle.includes('vitamin') || lowerCategory.includes('nutrition')) {
    return STOCK_IMAGES.nutrition;
  }
  if (lowerTitle.includes('sleep') || lowerTitle.includes('insomnia') || lowerTitle.includes('rest')) {
    return STOCK_IMAGES.sleep;
  }
  if (lowerTitle.includes('exercise') || lowerTitle.includes('fitness') || lowerTitle.includes('workout') || lowerTitle.includes('gym')) {
    return STOCK_IMAGES.fitness;
  }

  // Round-robin through stock images for variety if no specific match
  const images = [STOCK_IMAGES.heart, STOCK_IMAGES.diabetes, STOCK_IMAGES.mentalHealth, STOCK_IMAGES.nutrition];
  const hash = title.length + category.length;
  return images[hash % images.length];
};


// Fallback static feed items (used while loading or if fetch fails)
const staticFeedItems: NewsArticle[] = [
  {
    title: 'Understanding Diabetes',
    description: 'Learn about the types, symptoms, and management of diabetes.',
    url: 'https://www.cdc.gov/diabetes/basics/index.html',
    imageUrl: STOCK_IMAGES.diabetes,
    source: 'CDC',
    publishedAt: new Date().toISOString(),
    category: 'Chronic Conditions'
  },
  {
    title: 'Heart Health 101',
    description: 'Tips for a heart-healthy lifestyle to prevent heart disease.',
    url: 'https://www.heart.org/en/healthy-living',
    imageUrl: STOCK_IMAGES.heart,
    source: 'AHA',
    publishedAt: new Date().toISOString(),
    category: 'Cardiovascular'
  },
  {
    title: 'Mental Health Matters',
    description: 'Resources and support for mental health challenges in the modern world.',
    url: 'https://www.nimh.nih.gov/health',
    imageUrl: STOCK_IMAGES.mentalHealth,
    source: 'NIMH',
    publishedAt: new Date().toISOString(),
    category: 'Mental Health'
  },
  {
    title: 'Flu Prevention Guide',
    description: 'How to protect yourself and your family during flu season.',
    url: 'https://www.cdc.gov/flu/index.htm',
    imageUrl: STOCK_IMAGES.flu,
    source: 'CDC',
    publishedAt: new Date().toISOString(),
    category: 'Infectious Disease'
  },
  {
    title: 'Nutrition for Immunity',
    description: 'Evidence-based dietary choices to boost your immune system naturally.',
    url: 'https://www.hsph.harvard.edu/nutritionsource/',
    imageUrl: STOCK_IMAGES.nutrition,
    source: 'Harvard Health',
    publishedAt: new Date().toISOString(),
    category: 'Nutrition'
  },
  {
    title: 'Better Sleep, Better Health',
    description: 'Understanding sleep cycles and tips for improving sleep quality.',
    url: 'https://www.sleepfoundation.org/',
    imageUrl: STOCK_IMAGES.sleep,
    source: 'Sleep Foundation',
    publishedAt: new Date().toISOString(),
    category: 'Wellness'
  },
  {
    title: 'The Benefits of Daily Exercise',
    description: 'How regular physical activity improves overall health and longevity.',
    url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
    imageUrl: STOCK_IMAGES.fitness,
    source: 'WHO',
    publishedAt: new Date().toISOString(),
    category: 'Wellness'
  },
  {
    title: 'Regular Check-ups Save Lives',
    description: 'Why annual medical examinations are crucial for early detection.',
    url: 'https://medlineplus.gov/ency/article/002125.htm',
    imageUrl: STOCK_IMAGES.default,
    source: 'MedlinePlus',
    publishedAt: new Date().toISOString(),
    category: 'Health News'
  }
];

// Category color mapping
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Chronic Conditions': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Cardiovascular': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Mental Health': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Infectious Disease': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Nutrition': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Wellness': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Health News': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

// Format relative time
const getRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recent';
  }
};

export default function HealthFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>(staticFeedItems);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const autoplayPlugin = useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  const fetchNews = async () => {
    setLoading(true);
    try {
      const result = await getHealthNews();
      if (result.articles && result.articles.length > 0) {
        setArticles(result.articles);
        setLastUpdated(new Date());
      }
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Using cached articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
            <Newspaper className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Health News Feed
            </h1>
            <p className="text-sm text-muted-foreground">
              Latest updates from trusted medical sources
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNews}
          disabled={loading}
          className="gap-2 hidden sm:flex"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        onMouseEnter={() => autoplayPlugin.current.stop()}
        onMouseLeave={() => autoplayPlugin.current.reset()}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/2">
                <Card className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))
          ) : (
            articles.map((article, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/2">
                <div className="h-full p-1">
                  <Card className="group flex flex-col overflow-hidden h-full bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    {/* Image Container */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-secondary to-secondary/50">
                      {/* Next.js Image with unoptimized prop for reliable local loading */}
                      <Image
                        src={article.imageUrl && article.imageUrl.startsWith('/images/health/') ? article.imageUrl : getLocalImage(article.title, article.category)}
                        alt={article.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getLocalImage(article.title, article.category);
                        }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(article.category)} backdrop-blur-sm border text-xs font-medium`}
                        >
                          {article.category}
                        </Badge>
                      </div>

                      {/* Source Badge */}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-black/50 backdrop-blur-sm text-white border-0 text-xs">
                          {article.source}
                        </Badge>
                        <span className="text-xs text-white/80 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(article.publishedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {article.description}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter className="mt-auto pt-0">
                      <Button
                        variant="ghost"
                        className="px-0 text-primary hover:text-primary/80 gap-2 group/btn"
                        asChild
                      >
                        <Link href={article.url} target="_blank" rel="noopener noreferrer">
                          Read Full Article
                          <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10" />
        <CarouselNext className="hidden sm:flex -right-4 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10" />
      </Carousel>

      {/* Error notice */}
      {error && !loading && (
        <p className="text-xs text-muted-foreground text-center">{error}</p>
      )}
    </div>
  );
}
