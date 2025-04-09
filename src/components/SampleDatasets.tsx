
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Database, BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Sample dataset descriptions
const datasets = [
  {
    id: 'sales',
    title: 'Retail Sales',
    description: 'Monthly sales data with product categories and regional breakdown',
    icon: ShoppingCart,
    color: 'text-neon-cyan',
    records: 120,
  },
  {
    id: 'stocks',
    title: 'Stock Market',
    description: 'Historical stock prices with volume and market indicators',
    icon: TrendingUp,
    color: 'text-neon-green',
    records: 250,
  },
  {
    id: 'demographics',
    title: 'Demographics',
    description: 'Population statistics with age, income, and education data',
    icon: Users,
    color: 'text-neon-purple',
    records: 85,
  },
  {
    id: 'performance',
    title: 'Web Analytics',
    description: 'Website performance metrics including traffic and conversions',
    icon: BarChart3,
    color: 'text-neon-pink',
    records: 150,
  },
];

// Sample data for each dataset
const generateSampleData = (datasetId: string) => {
  switch (datasetId) {
    case 'sales':
      return Array.from({ length: 120 }, (_, i) => ({
        month: new Date(2024, i % 12, 1).toLocaleString('default', { month: 'short' }),
        product: ['Electronics', 'Clothing', 'Food', 'Home Goods', 'Books'][Math.floor(Math.random() * 5)],
        sales: Math.round(1000 + Math.random() * 9000),
        units: Math.round(10 + Math.random() * 90),
        region: ['North', 'South', 'East', 'West', 'Central'][Math.floor(Math.random() * 5)],
        profit: Math.round(100 + Math.random() * 900),
      }));
    
    case 'stocks':
      return Array.from({ length: 250 }, (_, i) => {
        const basePrice = 100 + Math.sin(i / 20) * 50 + Math.random() * 10;
        return {
          date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
          price: parseFloat(basePrice.toFixed(2)),
          volume: Math.round(1000 + Math.random() * 9000),
          change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
          symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'FB'][Math.floor(Math.random() * 5)],
          sector: ['Tech', 'Finance', 'Healthcare', 'Energy', 'Consumer'][Math.floor(Math.random() * 5)],
        };
      });
    
    case 'demographics':
      return Array.from({ length: 85 }, (_, i) => ({
        region: ['North America', 'Europe', 'Asia', 'South America', 'Africa'][Math.floor(Math.random() * 5)],
        age_group: ['0-18', '19-35', '36-50', '51-65', '65+'][Math.floor(Math.random() * 5)],
        population: Math.round(10000 + Math.random() * 990000),
        income: Math.round(20000 + Math.random() * 80000),
        education: ['High School', 'Bachelor', 'Master', 'PhD', 'Other'][Math.floor(Math.random() * 5)],
        employment: Math.round(50 + Math.random() * 50),
      }));
      
    case 'performance':
      return Array.from({ length: 150 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        page_views: Math.round(1000 + Math.random() * 9000),
        unique_visitors: Math.round(500 + Math.random() * 4500),
        bounce_rate: parseFloat((20 + Math.random() * 60).toFixed(1)),
        conversion: parseFloat((1 + Math.random() * 10).toFixed(1)),
        source: ['Organic', 'Social', 'Email', 'Referral', 'Direct'][Math.floor(Math.random() * 5)],
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
      }));
      
    default:
      return [];
  }
};

interface SampleDatasetsProps {
  onSelectDataset: (data: Array<Record<string, any>>) => void;
  className?: string;
}

const SampleDatasets: React.FC<SampleDatasetsProps> = ({ onSelectDataset, className }) => {
  const handleSelectDataset = (datasetId: string) => {
    const data = generateSampleData(datasetId);
    onSelectDataset(data);
    
    const dataset = datasets.find(d => d.id === datasetId);
    toast.success(`Loaded sample dataset: ${dataset?.title}`, {
      description: `${dataset?.records} records loaded successfully.`
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Database className="h-5 w-5 text-neon-cyan" />
        <h3 className="text-lg font-semibold">Sample Datasets</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {datasets.map((dataset) => (
          <Card key={dataset.id} className="glass overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-md flex items-center gap-1.5">
                    <dataset.icon className={cn("h-4 w-4", dataset.color)} />
                    <span>{dataset.title}</span>
                  </CardTitle>
                  <CardDescription className="text-white/60 text-xs">
                    {dataset.records} records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-white/80">{dataset.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20"
                onClick={() => handleSelectDataset(dataset.id)}
              >
                Load Dataset
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SampleDatasets;
