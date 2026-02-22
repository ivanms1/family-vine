import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const categories = [
  {
    name: 'Faith',
    icon: '🙏',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Biblical values & wisdom',
  },
  {
    name: 'Language',
    icon: '🗣️',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Heritage language learning',
  },
  {
    name: 'Culture',
    icon: '🌍',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Cultural understanding',
  },
  {
    name: 'Digital Wisdom',
    icon: '💡',
    color: 'bg-emerald-100 dark:bg-emerald-900/30',
    description: 'Safe Web3 education',
  },
];

export default function LearnPage() {
  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>What do you want to learn?</h1>
        <p className='mt-2 text-muted-foreground'>
          Pick a category to get started
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {categories.map((cat) => (
          <Card
            key={cat.name}
            className={`cursor-pointer transition-all hover:scale-[1.02] ${cat.color}`}
          >
            <CardHeader className='text-center pb-2'>
              <div className='text-5xl'>{cat.icon}</div>
              <CardTitle className='mt-2'>{cat.name}</CardTitle>
              <CardDescription>{cat.description}</CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <p className='text-sm text-muted-foreground'>
                Coming soon - lessons will appear here!
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
