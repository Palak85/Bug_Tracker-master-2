
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowRight, Loader2, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9edf5] relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] top-[-200px] left-[-200px] opacity-40"></div>
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] bottom-[-200px] right-[-200px] opacity-40"></div>

      {/* Main Card */}
      <div className="relative w-[900px] h-[500px] bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-1/2 flex flex-col justify-center px-12 z-10">

          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hello!
          </h1>
          <p className="text-gray-500 mb-6">
            Sign in to your account
          </p>

          {/* Success */}
          {successMessage && (
            <div className="bg-green-100 text-green-600 text-sm p-2 rounded mb-3 flex items-center gap-2">
              <CheckCircle size={14} /> {successMessage}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-3 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="flex items-center gap-3 bg-[#f3f5f9] px-5 py-3 rounded-full shadow-inner">
              <Mail size={18} className="text-purple-500" />
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
              />
            </div>

            {/* Password */}
            <div className="flex items-center gap-3 bg-[#f3f5f9] px-5 py-3 rounded-full shadow-inner">
              <Lock size={18} className="text-purple-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-gray-700"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Options */}
            <div className="flex justify-between text-xs text-gray-400 px-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" />
                Remember me
              </label>
              <span className="hover:text-purple-500 cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  SIGN IN <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-5">
            Don’t have an account?{" "}
            <Link to="/register" className="text-purple-500 hover:underline">
              Create
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-1/2 relative flex items-center justify-center text-white">

          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-l-[120px]" />

          <div className="relative z-10 text-center px-10">
            <h2 className="text-3xl font-bold mb-4">
              Welcome Back!
            </h2>
            <p className="text-purple-100 text-sm">
              Manage your bugs efficiently and stay productive with your system.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

