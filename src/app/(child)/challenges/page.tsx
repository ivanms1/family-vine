import { Trophy } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ChallengesPage() {
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>Family Challenges</h1>
        <p className='mt-2 text-muted-foreground'>
          Complete challenges together with your family!
        </p>
      </div>

      <Card>
        <CardHeader className='text-center'>
          <Trophy className='mx-auto h-12 w-12 text-primary' />
          <CardTitle>No Active Challenges</CardTitle>
          <CardDescription>
            Ask your parents to create a family challenge!
          </CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Challenges let you earn extra tokens by completing a set of lessons.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
