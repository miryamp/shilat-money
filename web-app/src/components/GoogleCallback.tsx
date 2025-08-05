import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from "lucide-react";
import { AuthResponse } from 'shared/entities/auth.interface';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  useEffect(() => {
    const processLogin = async () => {
      const token = searchParams.get('token');
      if (token) {
        try {
          // Parse the JWT token to get user info
          const [, payload] = token.split('.');
          const decodedUser = JSON.parse(atob(payload));
          
          const authResponse: AuthResponse = {
            accessToken: token,
            user: {
              id: decodedUser.sub,
              email: decodedUser.email,
              firstName: decodedUser.firstName || '',
              lastName: decodedUser.lastName || '',
              householdId: decodedUser.householdId,
              language: decodedUser.language || 'en',
              password: '' // Password is not used for Google auth
            },
            isNewUser: !!decodedUser.isNewUser
          };
          
          login(authResponse);
          navigate('/transactions');
        } catch (error) {
          console.error('Error processing Google login:', error);
          navigate('/login');
        }
      } else {
        console.error('No token received from Google OAuth');
        navigate('/login');
      }
    };

    processLogin();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Completing sign in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
