import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Car, ArrowLeft } from 'lucide-react';
import { auth } from '../lib/firebase';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err instanceof Error) {
        // Clean up Firebase error messages to be more user-friendly
        const errorMessage = err.message
          .replace('Firebase: ', '')
          .replace('auth/', '')
          .replace(/-/g, ' ');
        setError(errorMessage);
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkgray font-montserrat flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-lime p-3 rounded-full">
            <Car className="h-12 w-12 text-lightgray" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-lime">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-white">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 max-w-md w-full">
        <div className="bg-darkgray py-8 px-4 rounded-2xl border border-lime text-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            <Input
              id="email"
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="items-center hover:bg-lime/80 text-black w-full bg-lime"
                fullWidth 
                isLoading={isLoading}
              >
                Send Reset Link
              </Button>
              <Link 
                to="/login" 
                className="flex items-center justify-center gap-2 text-sm font-medium text-white hover:text-lime"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

