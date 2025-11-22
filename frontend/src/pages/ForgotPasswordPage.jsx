import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await axios.post(`${getApiUrl()}/api/auth/forgot-password`, { email });
            setStatus('success');
            setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'An error occurred. Please try again.');
        }
    };

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
                        <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
                        <p className="text-gray-600 font-medium mb-8">
                            Enter your email address and we'll send you a link to reset your password.
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
                                        <Mail className="h-4 w-4" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-black text-white py-4 font-bold text-lg hover:bg-gray-800 transition-all border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                                </button>
                            </form>
                        )}

                        <div className="mt-8 text-center">
                            <Link to="/login" className="font-bold hover:underline">
                                Remember your password? Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
