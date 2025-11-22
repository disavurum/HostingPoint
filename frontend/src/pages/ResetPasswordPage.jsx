import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (formData.password !== formData.confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        try {
            await axios.post(`${getApiUrl()}/api/auth/reset-password`, {
                token,
                password: formData.password
            });
            setStatus('success');
            setMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black mb-4">Invalid Link</h1>
                    <p className="mb-4">This password reset link is invalid or missing.</p>
                    <Link to="/forgot-password" className="font-bold underline">Request a new one</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2 font-bold hover:underline">
                    <ArrowLeft className="h-5 w-5" /> Back to Home
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h1 className="text-3xl font-black mb-2">Reset Password</h1>
                        <p className="text-gray-600 font-medium mb-8">
                            Enter your new password below.
                        </p>

                        {status === 'success' ? (
                            <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 mb-6 font-medium">
                                {message}
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {status === 'error' && (
                                    <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-medium">
                                        {message}
                                    </div>
                                )}

                                <div>
                                    <label className="block font-bold mb-2 flex items-center gap-2">
                                        <Lock className="h-4 w-4" /> New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2 flex items-center gap-2">
                                        <Lock className="h-4 w-4" /> Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-black text-white py-4 font-bold text-lg hover:bg-gray-800 transition-all border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Resetting...' : 'Set New Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
