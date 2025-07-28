import React, { useState } from 'react';
import { Currency } from 'shared/entities/currency.enum';
import { Language } from 'shared/entities/language.enum';
import { RegisterDto, NewHouseholdData } from 'shared/entities/auth.interface';
import { authService } from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterDto>>({
    language: Language.EN,
  });
  const [error, setError] = useState<string | null>(null);

  const handleUserDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
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
      navigate('/transactions');
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
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
            onClick={() => setFormData(prev => ({ ...prev, householdToken: undefined }))}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
              ${!formData.householdToken ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            Create New Household
          </button>
          <button
            onClick={() => setFormData(prev => ({ ...prev, newHousehold: undefined }))}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${formData.householdToken ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          >
            Join Existing Household
          </button>
        </div>

        {!formData.householdToken ? (
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
