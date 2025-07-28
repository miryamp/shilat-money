import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import LoginForm from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { HouseholdDetailsDto } from 'shared/dto/household-details.dto';

const JoinHousehold = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  const [householdDetails, setHouseholdDetails] = useState<HouseholdDetailsDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    if (isAuthenticated) {
      fetchHouseholdDetails();
    }
  }, [token, isAuthenticated]);

  const fetchHouseholdDetails = async () => {
    try {
      const details = await authService.getHouseholdDetailsByToken(token!);
      setHouseholdDetails(details);
      setIsModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid or expired invitation link",
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const handleJoinHousehold = async () => {
    try {
      await authService.joinHousehold(token!);
      toast({
        title: "Success",
        description: "Successfully joined the household",
      });
      navigate('/transactions');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join household",
        variant: "destructive",
      });
    }
  };

  const handleDecline = () => {
    navigate('/transactions');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white shadow-sm rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-4">Join a Household</h2>
            <p className="text-gray-600 mb-6">
              To join the household, you need to {' '}
              <button
                onClick={() => setShowLogin(true)}
                className="text-blue-600 hover:underline"
              >
                sign in
              </button>
              {' '} or create an account first.
            </p>
          </div>

          {showLogin ? (
            <LoginForm redirectWithToken={token} />
          ) : (
            <RegisterForm prefilledToken={token} />
          )}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Join Household</DialogTitle>
        </DialogHeader>
        
        {householdDetails && (
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Household Details</h3>
                <p className="text-gray-500">{householdDetails.name}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Members</h3>
                <ul className="mt-2 divide-y divide-gray-100">
                  {householdDetails.users.map(member => (
                    <li key={member.id} className="py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {user?.householdId && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-700">
                    Warning: Accepting this invitation will remove you from your current household 
                    and all associated data will be deleted.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="flex-1"
          >
            Decline
          </Button>
          <Button
            onClick={handleJoinHousehold}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Join Household
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinHousehold;
