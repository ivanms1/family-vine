import { Coins } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function MyRewardsPage() {
  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold'>My Rewards</h1>
        <p className='mt-2 text-muted-foreground'>
          Earn tokens by completing lessons!
        </p>
      </div>

      <Card>
        <CardHeader className='text-center'>
          <Coins className='mx-auto h-12 w-12 text-primary' />
          <CardTitle className='text-5xl font-bold mt-2'>0</CardTitle>
          <CardDescription>tokens earned</CardDescription>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Complete lessons to earn reward tokens. You can use them to unlock
            special content!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
