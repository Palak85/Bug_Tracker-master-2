import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  X, Loader2, User, Mail, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Shield, Pencil, KeyRound,
} from 'lucide-react';

const labelCls  = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5';
const inputCls  = 'w-full bg-[#f3f5f9] border border-gray-200 rounded-2xl px-4 py-3 text-gray-700 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

/* Role badge colours */
const roleMeta = {
  admin:   { label: 'Administrator',      bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-200'  },
  manager: { label: 'Project Manager',    bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-200'  },
  dev:     { label: 'Software Developer', bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200'  },
};

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useContext(AuthContext);

  const [name,            setName]            = useState('');
  const [email,           setEmail]           = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [changingPw,      setChangingPw]      = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [successMsg,      setSuccessMsg]      = useState('');
  const [errorMsg,        setErrorMsg]        = useState('');

  /* Populate fields whenever user changes or modal opens */
  useEffect(() => {
    if (user) {
      setName(user.name  || '');
      setEmail(user.email || '');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('');
    setErrorMsg('');
    setChangingPw(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const role = roleMeta[user.role] ?? roleMeta.dev;
  const initials = (user.name || 'U').slice(0, 2).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (changingPw && newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({
        name,
        email,
        ...(changingPw && newPassword
          ? { current_password: currentPassword, password: newPassword, password_confirmation: confirmPassword }
          : {}),
      });
      setSuccessMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setChangingPw(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' ')
        : 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-800/30 backdrop-blur-md" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-[30px] w-full max-w-lg shadow-[0_25px_60px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-[30px] flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Profile</h2>
            <p className="text-xs text-gray-400 mt-0.5">View and update your account</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f3f5f9] flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-6">

          {/* Avatar + role badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 select-none">
              {initials}
            </div>
            <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
            <p className="text-sm text-gray-400 mb-3">{user.email}</p>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${role.bg} ${role.text} ${role.border}`}>
              <Shield className="w-3 h-3" />
              {role.label}
            </span>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2">
              <CheckCircle size={14} /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className={labelCls}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="text"
                  required
                  className={`${inputCls} pl-11`}
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelCls}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <input
                  type="email"
                  required
                  className={`${inputCls} pl-11`}
                  placeholder="Your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Change password toggle */}
            <div>
              <button
                type="button"
                onClick={() => { setChangingPw(v => !v); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setErrorMsg(''); }}
                className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-indigo-600 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                {changingPw ? 'Cancel password change' : 'Change password'}
              </button>
            </div>

            {changingPw && (
              <div className="space-y-4 bg-[#f8f9fc] rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Password Update
                </p>

                {/* Current password */}
                <div>
                  <label className={labelCls}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className={`${inputCls} pr-11`}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowCurrent(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500">
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className={labelCls}>New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      className={`${inputCls} pr-11`}
                      placeholder="Min 8 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm new password */}
                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className={`${inputCls} pr-11`}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
              <button type="button" onClick={onClose}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-500 bg-[#f3f5f9] hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
