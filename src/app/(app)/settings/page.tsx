'use client';

import { useState } from 'react';
import { Settings, User, Shield, CreditCard, Check, Link2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { SUBSCRIPTION_TIERS } from '@/lib/constants';
import { BlockchainSettingsCard } from '@/components/blockchain/blockchain-settings-card';

export default function SettingsPage() {
  const { data: userData, isLoading } = useCurrentUser();
  const { data: familyData } = useFamily();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    );
  }

  const user = userData?.user;
  const family = familyData?.family;

  return (
    <div className='space-y-6 max-w-3xl'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Settings className='h-6 w-6' />
          Settings
        </h1>
        <p className='text-muted-foreground mt-1'>
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue='profile'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
          <TabsTrigger value='blockchain'>
            <Link2 className='h-3.5 w-3.5 mr-1' />
            Blockchain
          </TabsTrigger>
        </TabsList>

        <TabsContent value='profile' className='mt-4 space-y-4'>
          <ProfileCard
            displayName={user?.displayName ?? ''}
            email={user?.email ?? ''}
            familyName={family?.familyName ?? ''}
          />
        </TabsContent>

        <TabsContent value='security' className='mt-4 space-y-4'>
          <PasswordCard />
          <Card>
            <CardHeader>
              <CardTitle className='text-base flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Privacy & Safety
              </CardTitle>
              <CardDescription>
                COPPA-compliant child data protection
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-start gap-3'>
                <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  Child accounts have no email or password — only parents can manage access
                </p>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  All authentication uses httpOnly cookies — not accessible by JavaScript
                </p>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  Child sessions expire after 4 hours for safety
                </p>
              </div>
              <div className='flex items-start gap-3'>
                <Check className='h-4 w-4 text-green-500 mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                  Token spending requires parent approval
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='subscription' className='mt-4 space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5' />
                Your Plan
              </CardTitle>
              <CardDescription>
                Current tier:{' '}
                <Badge variant='secondary'>
                  {user?.subscription?.tier ?? 'FREE'}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 sm:grid-cols-3'>
                {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
                  const isActive = user?.subscription?.tier === key;
                  return (
                    <div
                      key={key}
                      className={`rounded-lg border p-4 ${
                        isActive ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <h3 className='font-semibold flex items-center gap-2'>
                        {tier.label}
                        {isActive && (
                          <Badge variant='default' className='text-xs'>
                            Current
                          </Badge>
                        )}
                      </h3>
                      <ul className='mt-2 space-y-1'>
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className='text-xs text-muted-foreground flex items-center gap-1.5'
                          >
                            <Check className='h-3 w-3 text-primary shrink-0' />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {!isActive && key !== 'FREE' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='mt-3 w-full'
                          disabled
                        >
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='blockchain' className='mt-4'>
          <BlockchainSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileCard({
  displayName: initialName,
  email: initialEmail,
  familyName,
}: {
  displayName: string;
  email: string;
  familyName: string;
}) {
  const [displayName, setDisplayName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.patch('/api/auth/update-profile', {
        displayName,
        email,
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base flex items-center gap-2'>
          <User className='h-4 w-4' />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Email</label>
            <Input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>Family Name</label>
            <Input value={familyName} disabled className='mt-1' />
            <p className='text-xs text-muted-foreground mt-1'>
              Edit family name from the Family page
            </p>
          </div>
          <Button type='submit' disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch('/api/auth/update-profile', {
        currentPassword,
        newPassword,
      });
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base flex items-center gap-2'>
          <Shield className='h-4 w-4' />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Current Password</label>
            <Input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <label className='text-sm font-medium'>New Password</label>
            <Input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='mt-1'
              minLength={6}
            />
          </div>
          <Button type='submit' disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
