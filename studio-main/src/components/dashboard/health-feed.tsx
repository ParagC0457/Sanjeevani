
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type FeedItem = {
  title: string;
  description: string;
  learnMoreUrl: string;
  imageUrl: string;
  imageHint: string;
};

const staticFeedItems: FeedItem[] = [
    {
    title: 'Understanding Diabetes',
    description: 'Learn about the types, symptoms, and management of diabetes.',
    learnMoreUrl: 'https://www.cdc.gov/diabetes/basics/index.html',
    imageUrl: PlaceHolderImages.find(img => img.id === 'diabetes')?.imageUrl || 'https://picsum.photos/seed/diabetes/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'diabetes')?.imageHint || 'medical glucometer',
  },
  {
    title: 'Managing Asthma',
    description: 'Key strategies for controlling asthma triggers and symptoms.',
    learnMoreUrl: 'https://www.cdc.gov/asthma/manage/index.html',
    imageUrl: PlaceHolderImages.find(img => img.id === 'asthma')?.imageUrl || 'https://picsum.photos/seed/asthma/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'asthma')?.imageHint || 'medical asthma',
  },
  {
    title: 'Heart Health 101',
    description: 'Tips for a heart-healthy lifestyle to prevent heart disease.',
    learnMoreUrl: 'https://www.heart.org/en/healthy-living',
    imageUrl: PlaceHolderImages.find(img => img.id === 'heartHealth')?.imageUrl || 'https://picsum.photos/seed/heart/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'heartHealth')?.imageHint || 'medical heart',
  },
  {
    title: 'Coping with Arthritis',
    description: 'An overview of arthritis types and ways to manage joint pain.',
    learnMoreUrl: 'https://www.cdc.gov/arthritis/basics/index.htm',
    imageUrl: PlaceHolderImages.find(img => img.id === 'arthritis')?.imageUrl || 'https://picsum.photos/seed/arthritis/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'arthritis')?.imageHint || 'medical arthritis',
  },
  {
    title: 'Recognizing Flu Symptoms',
    description: 'How to tell if you have the flu and what to do.',
    learnMoreUrl: 'https://www.cdc.gov/flu/symptoms/index.html',
    imageUrl: PlaceHolderImages.find(img => img.id === 'flu')?.imageUrl || 'https://picsum.photos/seed/flu/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'flu')?.imageHint || 'medical virus',
  },
  {
    title: 'Understanding Eczema',
    description: 'Learn about the causes and treatments for eczema.',
    learnMoreUrl: 'https://nationaleczema.org/eczema/',
    imageUrl: PlaceHolderImages.find(img => img.id === 'eczema')?.imageUrl || 'https://picsum.photos/seed/eczema/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'eczema')?.imageHint || 'medical dermatology',
  },
  {
    title: 'High Blood Pressure Facts',
    description: 'What you need to know about hypertension and its risks.',
    learnMoreUrl: 'https://www.who.int/news-room/fact-sheets/detail/hypertension',
    imageUrl: PlaceHolderImages.find(img => img.id === 'bloodPressure')?.imageUrl || 'https://picsum.photos/seed/bloodpressure/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'bloodPressure')?.imageHint || 'medical sphygmomanometer',
  },
  {
    title: 'What is a Migraine?',
    description: 'Understanding the symptoms and triggers of migraines.',
    learnMoreUrl: 'https://www.ninds.nih.gov/health-information/disorders/migraine',
    imageUrl: PlaceHolderImages.find(img => img.id === 'migraine')?.imageUrl || 'https://picsum.photos/seed/migraine/600/400',
    imageHint: PlaceHolderImages.find(img => img.id === 'migraine')?.imageHint || 'medical neurology',
  }
];


export default function HealthFeed() {
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-primary">Health Awareness Feed</h1>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[autoplayPlugin.current]}
        onMouseEnter={autoplayPlugin.current.stop}
        onMouseLeave={autoplayPlugin.current.reset}
        className="w-full max-w-full"
      >
        <CarouselContent>
          {staticFeedItems.map((item, index) => (
            <CarouselItem key={index}>
              <div className="p-1 h-full">
                <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:shadow-accent/20 h-full">
                  <div className="relative h-48 w-full bg-secondary">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      data-ai-hint={item.imageHint}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto">
                    <Button variant="link" className="px-0 text-primary" asChild>
                      <Link href={item.learnMoreUrl} target="_blank" rel="noopener noreferrer">
                        Learn More
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
