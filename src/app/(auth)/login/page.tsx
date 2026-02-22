import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your FamilyVine account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className='justify-center'>
        <p className='text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link href='/register' className='text-primary hover:underline'>
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
