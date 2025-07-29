import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HouseholdSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateInvite = async () => {
    try {
      const response = await authService.generateHouseholdInvite();
      const fullLink = `${window.location.origin}/join-household?token=${response.inviteToken}`;
      setInviteLink(fullLink);
      toast({
        title: 'Success',
        description: 'Invite link generated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invite link',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authService.shareHouseholdByEmail(email);
      setEmail('');
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  if (!user?.householdId) {
    navigate('/');
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Household Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Invite Link</CardTitle>
            <CardDescription>
              Create a shareable link that allows others to join your household
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {inviteLink ? (
              <>
                <div className="flex gap-2">
                  <Input 
                    value={inviteLink} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button onClick={copyToClipboard} variant="outline">
                    Copy
                  </Button>
                </div>
                <Button onClick={handleGenerateInvite} variant="outline">
                  Generate New Link
                </Button>
              </>
            ) : (
              <Button onClick={handleGenerateInvite}>
                Generate Link
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Invite by Email</CardTitle>
            <CardDescription>
              Directly send an invitation email to someone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HouseholdSettings;
