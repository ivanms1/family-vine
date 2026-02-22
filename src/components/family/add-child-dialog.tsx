'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Plus } from 'lucide-react';
import { useAddChild } from '@/hooks/use-family';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { toast } from 'sonner';

const addChildSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(50),
  dateOfBirth: z.string().optional(),
  pin: z
    .string()
    .regex(/^\d{4}$/, 'PIN must be 4 digits')
    .optional()
    .or(z.literal('')),
});

type AddChildFormValues = z.infer<typeof addChildSchema>;

export function AddChildDialog() {
  const [open, setOpen] = useState(false);
  const addChild = useAddChild();

  const form = useForm<AddChildFormValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      displayName: '',
      dateOfBirth: '',
      pin: '',
    },
  });

  function onSubmit(values: AddChildFormValues) {
    addChild.mutate(
      {
        displayName: values.displayName,
        dateOfBirth: values.dateOfBirth || undefined,
        pin: values.pin || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Child profile created');
          form.reset();
          setOpen(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to add child');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Child</DialogTitle>
          <DialogDescription>
            Create a new child profile for your family. Children log in through
            your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Child&apos;s Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Sarah' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dateOfBirth'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth (optional)</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormDescription>
                    Used for age-appropriate content filtering
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='pin'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='text'
                      inputMode='numeric'
                      maxLength={4}
                      placeholder='1234'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional 4-digit PIN for child privacy between siblings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={addChild.isPending}>
                {addChild.isPending ? 'Adding...' : 'Add Child'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
