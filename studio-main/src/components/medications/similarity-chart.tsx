'use client';

import { Check, X } from 'lucide-react';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

type SimilarityChartProps = {
  similarity: number;
  recommendation: string;
};

export default function SimilarityChart({ similarity, recommendation }: SimilarityChartProps) {
  const chartData = [{ name: 'similarity', value: similarity, fill: 'var(--color-similarity)' }];

  const getChartColor = () => {
    if (similarity >= 90) return 'hsl(142.1 76.2% 41.2%)'; // Green
    if (similarity >= 80) return 'hsl(47.9 95.8% 53.1%)'; // Yellow-ish
    return 'hsl(0 84.2% 60.2%)'; // Red
  };

  const Icon = () => {
    if (recommendation.includes('✅')) return <Check className="h-12 w-12 text-green-600" />;
    if (recommendation.includes('❌')) return <X className="h-12 w-12 text-destructive" />;
    return <span className="text-xl font-bold text-yellow-600">Good</span>;
  };

  return (
    <div className="relative w-full h-full">
      <ChartContainer
        config={{
          similarity: {
            label: 'Similarity',
            color: getChartColor(),
          },
        }}
        className="mx-auto aspect-square h-full"
      >
        <RadialBarChart
          data={chartData}
          startAngle={-90}
          endAngle={270}
          innerRadius="75%"
          outerRadius="105%"
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} dataKey="value" tick={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: 'hsla(var(--muted))' }}
            roundCaps
            className="[&>path]:stroke-none"
          />
        </RadialBarChart>
      </ChartContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <Icon />
        <span className="text-3xl font-bold mt-1">
          {similarity}%
        </span>
      </div>
    </div>
  );
}
