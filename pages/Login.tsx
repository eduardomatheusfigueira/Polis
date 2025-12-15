import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import { Icons } from '../constants';

interface LoginProps {
  onLogin: (username: string, additionalData?: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form'); // For email verification simulation

  // Form State
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (!email || !username || !fullName) {
        setError("All fields are required.");
        return;
      }
      // Mock sending email
      setStep('verify');
    } else {
      // Mock Login
      if (email && password) {
        // Use part of email as username if logging in, or just a dummy one
        onLogin(email.split('@')[0]);
        navigate('/');
      } else {
        setError("Invalid credentials.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Use email handle or display name as the basis for the game username
      const polisUsername = user.email
        ? user.email.split('@')[0]
        : (user.displayName || "User").replace(/\s+/g, '_');

      onLogin(polisUsername, {
        email: user.email,
        fullName: user.displayName,
        avatarUrl: user.photoURL
      });
      navigate('/');
    } catch (error: any) {
      console.error("Google Sign-In Error", error);
      setError("Google Sign-In failed: " + error.message);
    }
  };

  const handleVerification = () => {
    onLogin(username);
    navigate('/profile'); // Redirect to profile to finish setup after reg
  };

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-800 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
            <Icons.Mail className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">Check your Email</h2>
          <p className="text-slate-400 mb-6">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>.
            Please confirm your account to continue.
          </p>
          <div className="space-y-3">
            <Button fullWidth onClick={handleVerification}>
              I have confirmed my email
            </Button>
            <button onClick={() => setStep('form')} className="text-sm text-slate-500 hover:text-slate-300">
              Back to registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50">
          <h1 className="text-3xl font-serif font-bold text-center text-amber-500 tracking-widest mb-2">POLIS</h1>
          <p className="text-center text-slate-400 text-sm">
            {isRegistering ? 'Begin your political career' : 'Welcome back, Senator'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">

            {isRegistering && (
              <>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Username"
                  placeholder="Senator_Doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </>
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {isRegistering && (
              <Input
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" fullWidth className="mt-6">
              {isRegistering ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button variant="outline" fullWidth onClick={handleGoogleLogin} className="flex gap-2 items-center justify-center">
                <Icons.Google />
                <span>Google</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-400">
              {isRegistering ? "Already have an account?" : "New to Polis?"}
            </span>
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="ml-2 text-amber-500 hover:text-amber-400 font-medium"
            >
              {isRegistering ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;