import React, { useState, useEffect, useMemo } from 'react';
import { Currency } from 'shared/entities/currency.enum';
import { Language } from 'shared/entities/language.enum';
import { RegisterDto, NewHouseholdData } from 'shared/entities/auth.interface';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface RegisterFormProps {
  prefilledToken?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ prefilledToken }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [isJoining, setIsJoining] = useState(!!prefilledToken);
  
  const googleData = useMemo(() => {
    const data = searchParams.get('googleData');
    if (data) {
      try {
        return JSON.parse(decodeURIComponent(data));
      } catch (e) {
        console.error('Failed to parse Google data:', e);
      }
    }
    return null;
  }, [searchParams]);

  const [formData, setFormData] = useState<Partial<RegisterDto>>({
    email: googleData?.email || '',
    firstName: googleData?.firstName || '',
    lastName: googleData?.lastName || '',
    language: Language.EN,
    ...(prefilledToken 
      ? { householdToken: prefilledToken }
      : { newHousehold: { name: '', currency: Currency.USD } }
  )});
  const [error, setError] = useState<string | null>(null);

  const handleUserDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = googleData 
      ? [formData.email, formData.firstName, formData.lastName]
      : [formData.email, formData.password, formData.firstName, formData.lastName];
      
    if (requiredFields.some(field => !field)) {
      setError('All fields are required');
      return;
    }
    setStep(2);
  };

  const handleHouseholdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData as RegisterDto);
      login(response);
      if (prefilledToken) {
        navigate(`/join-household?token=${prefilledToken}`);
      } else {
        navigate('/transactions');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleNewHouseholdSubmit = (data: NewHouseholdData) => {
    setFormData(prev => ({
      ...prev,
      newHousehold: data,
    }));
  };

  const handleHouseholdTokenSubmit = (token: string) => {
    setFormData(prev => ({
      ...prev,
      householdToken: token,
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleUserDetailsSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div className="space-y-4">
              {googleData && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-md text-sm text-blue-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Completing Google Registration
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={!!googleData}
                />
              </div>
              {!googleData && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  value={formData.language}
                  onChange={e => setFormData(prev => ({ ...prev, language: e.target.value as Language }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {Object.values(Language).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join or Create Household
          </h2>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        <div className="flex space-x-4 mb-8">
          <button
            type="button"
            onClick={() => {
              setIsJoining(false);
              setFormData(prev => ({ 
                ...prev, 
                householdToken: undefined,
                newHousehold: { name: '', currency: Currency.USD }
              }));
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
              ${!isJoining ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            Create New Household
          </button>
          <button
            type="button"
            onClick={() => {
              setIsJoining(true);
              setFormData(prev => ({ 
                ...prev, 
                newHousehold: undefined,
                householdToken: ''
              }));
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${isJoining ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            Join Existing Household
          </button>
        </div>

        {!isJoining ? (
          <form onSubmit={handleHouseholdSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Household Name
              </label>
              <input
                type="text"
                onChange={e => handleNewHouseholdSubmit({ 
                  name: e.target.value, 
                  currency: formData.newHousehold?.currency || Currency.USD 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                value={formData.newHousehold?.currency || Currency.USD}
                onChange={e => handleNewHouseholdSubmit({ 
                  name: formData.newHousehold?.name || '', 
                  currency: e.target.value as Currency 
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {Object.values(Currency).map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleHouseholdSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Household Invite Token
              </label>
              <input
                type="text"
                value={formData.householdToken || ''}
                onChange={e => handleHouseholdTokenSubmit(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Household
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
