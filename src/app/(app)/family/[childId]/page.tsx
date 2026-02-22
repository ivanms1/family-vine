'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Trash2 } from 'lucide-react';
import { useChild, useDeleteChild, useUpdateChild, useSetChildPin, useRemoveChildPin } from '@/hooks/use-family';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

const editChildSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(50),
  dateOfBirth: z.string().optional(),
});

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

type EditChildValues = z.infer<typeof editChildSchema>;
type PinValues = z.infer<typeof pinSchema>;

export default function ChildDetailPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = use(params);
  const { data, isLoading } = useChild(childId);
  const updateChild = useUpdateChild();
  const deleteChild = useDeleteChild();
  const setPin = useSetChildPin();
  const removePin = useRemoveChildPin();
  const router = useRouter();

  const child = data?.child;

  const editForm = useForm<EditChildValues>({
    resolver: zodResolver(editChildSchema),
    values: {
      displayName: child?.displayName ?? '',
      dateOfBirth: child?.dateOfBirth?.split('T')[0] ?? '',
    },
  });

  const pinForm = useForm<PinValues>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: '' },
  });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className='text-center py-12'>
        <p className='text-muted-foreground'>Child not found</p>
        <Button asChild className='mt-4'>
          <Link href='/family'>Back to Family</Link>
        </Button>
      </div>
    );
  }

  const initials = child.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function onEditSubmit(values: EditChildValues) {
    updateChild.mutate(
      {
        childId,
        input: {
          displayName: values.displayName,
          dateOfBirth: values.dateOfBirth || undefined,
        },
      },
      {
        onSuccess: () => toast.success('Profile updated'),
        onError: (error) => toast.error(error.message),
      }
    );
  }

  function onPinSubmit(values: PinValues) {
    setPin.mutate(
      { childId, pin: values.pin },
      {
        onSuccess: () => {
          toast.success('PIN set');
          pinForm.reset();
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  function handleRemovePin() {
    removePin.mutate(childId, {
      onSuccess: () => toast.success('PIN removed'),
      onError: (error) => toast.error(error.message),
    });
  }

  function handleDelete() {
    if (!child) return;
    if (!confirm(`Remove ${child.displayName} from your family? This cannot be undone.`)) {
      return;
    }
    deleteChild.mutate(childId, {
      onSuccess: () => {
        toast.success('Child removed');
        router.push('/family');
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' asChild>
          <Link href='/family'>
            <ArrowLeft className='h-4 w-4' />
          </Link>
        </Button>
        <Avatar className='h-16 w-16'>
          <AvatarImage src={child.avatarUrl ?? undefined} />
          <AvatarFallback className='bg-primary/10 text-primary text-xl'>
            {initials || <User className='h-6 w-6' />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className='text-2xl font-bold'>{child.displayName}</h1>
          <div className='flex gap-2 mt-1'>
            <Badge variant='outline'>{child.tokenBalance} tokens</Badge>
            {child.hasPin && <Badge variant='secondary'>PIN enabled</Badge>}
          </div>
        </div>
      </div>

      <Tabs defaultValue='settings'>
        <TabsList>
          <TabsTrigger value='progress'>Progress</TabsTrigger>
          <TabsTrigger value='tokens'>Tokens</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value='progress' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>
                Track {child.displayName}&apos;s learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                No lessons completed yet. Start learning in Child Mode!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='tokens' className='mt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Token History</CardTitle>
              <CardDescription>
                {child.displayName}&apos;s reward tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-4'>
                <div className='text-4xl font-bold text-primary'>
                  {child.tokenBalance}
                </div>
                <p className='text-sm text-muted-foreground mt-1'>
                  Total tokens
                </p>
              </div>
              <p className='text-sm text-muted-foreground text-center'>
                No transactions yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='settings' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...editForm}>
                <form
                  onSubmit={editForm.handleSubmit(onEditSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={editForm.control}
                    name='displayName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name='dateOfBirth'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' disabled={updateChild.isPending}>
                    {updateChild.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PIN Settings</CardTitle>
              <CardDescription>
                An optional 4-digit PIN for privacy between siblings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {child.hasPin ? (
                <div className='flex items-center justify-between'>
                  <p className='text-sm text-muted-foreground'>
                    PIN is currently enabled
                  </p>
                  <Button
                    variant='outline'
                    onClick={handleRemovePin}
                    disabled={removePin.isPending}
                  >
                    Remove PIN
                  </Button>
                </div>
              ) : (
                <Form {...pinForm}>
                  <form
                    onSubmit={pinForm.handleSubmit(onPinSubmit)}
                    className='flex items-end gap-2'
                  >
                    <FormField
                      control={pinForm.control}
                      name='pin'
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormLabel>Set PIN</FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              inputMode='numeric'
                              maxLength={4}
                              placeholder='1234'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type='submit' disabled={setPin.isPending}>
                      Set PIN
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          <Card className='border-destructive/50'>
            <CardHeader>
              <CardTitle className='text-destructive'>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={deleteChild.isPending}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Remove {child.displayName}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
