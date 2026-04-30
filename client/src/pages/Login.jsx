import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { login, register, googleLogin } from '../services/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('Traveler');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const getRedirectPath = (role) => {
    if (role === 'Doctor') return '/doctor-dashboard';
    if (role === 'Admin') return '/admin-dashboard';
    return '/dashboard';
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = isRegister 
        ? await register({ name, email, password, role })
        : await login({ email, password });

      if (res.data.success) {
        localStorage.setItem('caretrip_token', res.data.token);
        localStorage.setItem('caretrip_user', JSON.stringify(res.data.user));
        navigate(getRedirectPath(res.data.user.role));
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await googleLogin({
        credential: credentialResponse.credential,
        role // Pass role in case they are registering via Google for the first time
      });

      if (res.data.success) {
        localStorage.setItem('caretrip_token', res.data.token);
        localStorage.setItem('caretrip_user', JSON.stringify(res.data.user));
        navigate(getRedirectPath(res.data.user.role));
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError('Google Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">

      {/* Left side: Authentication Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden z-20">
        <div className="w-full max-w-sm">

          {/* Logo / Header */}
          <div className="mb-2 text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-1">
              <img
                src="https://res.cloudinary.com/dgcmeb8ec/image/upload/v1776876267/cf4aebc6-9a38-4ca1-8439-a2f8ecafc8aa_rxtljz.png"
                alt="CareTrip Logo"
                className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-full shadow-md bg-white border border-gray-100"
              />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 mt-3 text-lg leading-relaxed">
              {isRegister ? 'Join CareTrip and access global verified healthcare.' : 'Enter your details to access your dashboard.'}
            </p>
          </div>

          {/* Role Selector Pills */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-3">
            {['Traveler', 'Doctor', 'Admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 text-sm font-semibold py-1.5 rounded-lg transition-all ${role === r
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Manual Auth Form */}
          <form onSubmit={handleManualAuth} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none text-base"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none text-base"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none text-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-700 hover:bg-primary-800 active:bg-primary-900 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-primary-700/30 flex justify-center items-center mt-2 select-none focus:outline-none focus:ring-0"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center mt-4 mb-4">
            <span className="bg-white px-4 text-xs tracking-wider text-gray-400 font-bold uppercase z-10">Or continue with</span>
            <div className="absolute w-full h-px bg-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 overflow-hidden w-full select-none focus:outline-none focus:ring-0">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login failed. Please try again.')}
              useOneTap
              theme="outline"
              size="large"
              shape="rectangular"
              text={isRegister ? 'signup_with' : 'signin_with'}
              width="100%"
            />
          </div>

          {/* Toggle Register/Login */}
          <p className="text-center mt-4 text-sm text-gray-600">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
            >
              {isRegister ? 'Sign in instead' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>

      {/* Right side: Visual Collage */}
      <div className="hidden md:flex md:w-1/2 relative bg-white items-center justify-center z-10">
        <img
          src="https://res.cloudinary.com/dgcmeb8ec/image/upload/v1776919656/8892f2dc-4f94-4203-ab7a-f372689f183b_wdtmtt.png"
          alt="CareTrip Medical Collage"
          className="w-[90%] h-full object-contain max-h-screen scale-[1.02]"
        />
      </div>
    </div>
  );
};

export default Login;
