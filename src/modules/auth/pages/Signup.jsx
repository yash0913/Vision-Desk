import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/auth.api';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.signup({ fullName, email, password, countryCode, phoneNumber });
      login(data.token, data.user);
      navigate('/workspace/messages', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const PasswordIcon = showPassword ? EyeOff : Eye;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] transition-colors duration-500 p-4">
      
      <div className="w-full max-w-md bg-[#1e293b] border-t-4 border-blue-600 rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/50 relative">
        
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white tracking-tight">
          Welcome Back!
        </h1>
        <p className="text-base mb-8 text-slate-400">
          Sign in to access your VisionDesk workspace.
        </p>

        {error && (
          <div className="mb-6 text-sm font-medium text-red-400 bg-red-900/20 rounded-lg px-4 py-3 border border-red-800/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold mb-2 text-slate-200">Full Name</label>
            <input
              id="fullName"
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Jane Doe"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-slate-200">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold mb-2 text-slate-200">Phone Number</label>
            <div className="flex gap-2">
              <div className="relative w-1/3">
                <select
                  id="countryCode"
                  className="appearance-none w-full h-full px-3 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-8 cursor-pointer"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 w-4 h-4" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                className="flex-1 px-4 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Mobile number"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-slate-200">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12 placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-blue-400 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <PasswordIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all text-lg font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-8 text-sm text-center text-slate-400">
          New to VisionDesk?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}