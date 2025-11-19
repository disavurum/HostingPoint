import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/auth/register`, {
        name,
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Platform Intro */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#b2fffb] border-r-2 border-black flex-col justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto">
          <h1 className="text-6xl font-black mb-6 tracking-tight">
            Topluluğunu <br/>
            İnşa Et.
          </h1>
          <p className="text-xl font-medium mb-12 leading-relaxed">
            Binlerce topluluk yöneticisine katıl. Kod yazmadan kendi Discourse forumunu başlat.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="font-black text-3xl mb-2">14 Gün</div>
              <div className="font-medium text-gray-600">Ücretsiz Deneme</div>
            </div>
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="font-black text-3xl mb-2">0</div>
              <div className="font-medium text-gray-600">Kredi Kartı Gerekmez</div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-24">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-12">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-black rounded-full"></div>
              <span className="text-2xl font-bold tracking-tight">VibeHost</span>
            </Link>
            <h2 className="text-4xl font-black mb-2">Kayıt Ol</h2>
            <p className="text-gray-600 font-medium">Birkaç saniye içinde hesabınızı oluşturun.</p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 font-medium rounded-none">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-bold mb-2">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                placeholder="Adınız Soyadınız"
                required
              />
            </div>

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
              <label className="block font-bold mb-2">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                placeholder="En az 8 karakter"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-4 font-bold text-lg border-2 border-black hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? 'Hesap Oluşturuluyor...' : (
                <>
                  Kayıt Ol <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center font-medium text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-black underline decoration-2 hover:text-gray-800">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

