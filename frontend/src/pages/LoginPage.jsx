import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { getApiUrl } from '../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const response = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });

      console.log('Login response:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Token saved to localStorage:', localStorage.getItem('token'));
      // Force a hard redirect to ensure state is fresh, with a small delay
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        window.location.href = '/dashboard';
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Platform Intro */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#ffc900] border-r-2 border-black flex-col justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-6xl font-black mb-6 tracking-tight">
            Topluluğuna <br />
            Geri Dön.
          </h1>
          <p className="text-xl font-medium mb-12 leading-relaxed">
            Yönetim paneline eriş, forumlarını kontrol et ve topluluğunu büyütmeye devam et.
          </p>

          <div className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-black rounded-full"></div>
              <div>
                <div className="font-bold text-lg">HostingPoint</div>
                <div className="text-sm text-gray-500">Discourse Forum Hosting</div>
              </div>
            </div>
            <p className="font-medium">
              "HostingPoint sayesinde Discourse forumlarımızı kolayca kuruyoruz. EC2 sunucumuzda otomatik kurulum ve yönetim."
            </p>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-24">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-12">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-black rounded-full"></div>
              <span className="text-2xl font-bold tracking-tight">VibeHost</span>
            </Link>
            <h2 className="text-4xl font-black mb-2">Hoş Geldiniz</h2>
            <p className="text-gray-600 font-medium">Devam etmek için giriş yapın.</p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 font-medium rounded-none">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Email Adresi</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                placeholder="ornek@sirket.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold">Şifre</label>
                <Link to="/forgot-password" className="text-sm font-bold underline hover:text-gray-600">
                  Şifremi Unuttum?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-4 font-bold text-lg border-2 border-black hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? 'Giriş Yapılıyor...' : (
                <>
                  Giriş Yap <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center font-medium text-gray-600">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-black underline decoration-2 hover:text-gray-800">
              Hemen Kayıt Olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

