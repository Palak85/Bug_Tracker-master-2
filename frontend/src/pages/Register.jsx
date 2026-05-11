import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Bug, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Register() {
  useDarkMode(); // apply stored theme preference
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'dev'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await register(formData.name, formData.email, formData.password, formData.password_confirmation, formData.role);
      toast.success('Account created! Awaiting admin approval.');
      navigate('/login', { state: { message: response.message } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  /* shared input class — matches login page's pill inputs */
  const inputCls = 'flex items-center gap-3 bg-[#f3f5f9] px-5 py-3 rounded-full shadow-inner';
  const fieldCls = 'bg-transparent outline-none w-full text-gray-700 text-sm placeholder-gray-400';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9edf5] relative overflow-hidden py-10">
      {/* Background blobs — same as Login */}
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] top-[-200px] left-[-200px] opacity-40" />
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full blur-[150px] bottom-[-200px] right-[-200px] opacity-40" />

      <div className="absolute top-8 left-8 z-20">
        <Link to="/" className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors group bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-sm border border-white/50">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>
      </div>

      {/* Card — mirrors Login split layout */}
      <div className="relative w-full max-w-[900px] mx-4 bg-white rounded-[30px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[580px]">

        {/* LEFT — form */}
        <div className="flex-1 flex flex-col justify-center px-12 py-10 z-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm mb-6">Join the team and start tracking bugs</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-5 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={inputCls}>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Full Name"
                  className={fieldCls}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className={inputCls}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Work Email"
                  className={fieldCls}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password + Confirm row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={inputCls}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Password"
                  className={fieldCls}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-purple-500 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className={inputCls}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  required
                  placeholder="Confirm Password"
                  className={fieldCls}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-purple-500 transition-colors">
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className={inputCls}>
              <select
                name="role"
                required
                className="bg-transparent outline-none w-full text-gray-700 text-sm cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="dev">Software Developer</option>
                <option value="manager">Project Manager</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-500 hover:underline font-medium">Sign In</Link>
          </p>
        </div>

        {/* RIGHT — purple accent panel, mirrors Login */}
        <div className="hidden md:flex w-[42%] relative items-center justify-center text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-l-[120px]" />
          <div className="relative z-10 text-center px-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5 shadow-xl">
              <Bug className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome!</h2>
            <p className="text-purple-100 text-sm leading-relaxed">
              Register to report bugs, manage tasks, and collaborate with your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
