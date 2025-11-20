import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Layout, Plus, Settings, LogOut, Server, ExternalLink, Lock, User, Mail } from 'lucide-react';
import DeployModal from '../components/DeployModal';
import { getApiUrl } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, forums, settings

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const apiUrl = getApiUrl();
  const domain = import.meta.env.VITE_DOMAIN || 'vibehost.io';

  useEffect(() => {
    // Check URL hash to set active tab on initial load
    if (location.hash === '#forums') setActiveTab('forums');
    if (location.hash === '#settings') setActiveTab('settings');
  }, [location]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setSettingsForm(prev => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || ''
      }));
      
      try {
        const response = await axios.get(`${apiUrl}/api/forums`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForums(response.data.forums || []);
      } catch (err) {
        console.error('Failed to fetch forums:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        }
        setError('Forumlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, apiUrl]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setError('');
    setSuccessMessage('');

    if (settingsForm.newPassword && settingsForm.newPassword !== settingsForm.confirmPassword) {
      setError('Yeni şifreler uyuşmuyor.');
      setSettingsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${apiUrl}/api/auth/profile`, {
        name: settingsForm.name,
        email: settingsForm.email,
        currentPassword: settingsForm.currentPassword,
        newPassword: settingsForm.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMessage('Profil başarıyla güncellendi.');
      setSettingsForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'deploying': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'deploying': return 'Kuruluyor...';
      case 'failed': return 'Hata';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-white rounded-full"></div>
            <span className="text-xl font-bold">VibeHost</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
          >
            <Layout className="h-5 w-5" />
            Genel Bakış
          </button>
          <button 
            onClick={() => setActiveTab('forums')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'forums' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
          >
            <Server className="h-5 w-5" />
            Forumlarım
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'settings' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
          >
            <Settings className="h-5 w-5" />
            Ayarlar
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center font-bold">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold truncate">{user?.name}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-900 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2">
              {activeTab === 'overview' && `Hoş Geldin, ${user?.name?.split(' ')[0]} 👋`}
              {activeTab === 'forums' && 'Forumlarım'}
              {activeTab === 'settings' && 'Hesap Ayarları'}
            </h1>
            <p className="text-gray-600 font-medium">
              {activeTab === 'overview' && 'İşte topluluklarının genel durumu.'}
              {activeTab === 'forums' && 'Kurulu olan tüm Discourse forumların.'}
              {activeTab === 'settings' && 'Profil bilgilerinizi ve şifrenizi güncelleyin.'}
            </p>
          </div>
          {activeTab !== 'settings' && (
            <button 
              onClick={() => setIsDeployModalOpen(true)}
              className="bg-black text-white px-6 py-3 font-bold flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Plus className="h-5 w-5" />
              Yeni Forum Kur
            </button>
          )}
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-gray-500 font-bold mb-2">Toplam Forum</div>
                <div className="text-4xl font-black">{forums.length}</div>
              </div>
              <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-gray-500 font-bold mb-2">Aktif Forum</div>
                <div className="text-4xl font-black">{forums.filter(f => f.status === 'active').length}</div>
              </div>
              <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-gray-500 font-bold mb-2">Hızlı İşlemler</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setIsDeployModalOpen(true)} className="text-sm font-bold underline">Forum Kur</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setActiveTab('settings')} className="text-sm font-bold underline">Ayarlar</button>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6">Son Aktiviteler</h2>
            {forums.length > 0 ? (
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-gray-500 italic">Henüz aktivite kaydı yok.</p>
              </div>
            ) : (
              <p className="text-gray-500">Henüz işlem yapılmadı.</p>
            )}
          </>
        )}

        {/* Forums Tab (Detailed List) */}
        {(activeTab === 'forums' || activeTab === 'overview') && (
          <>
            {activeTab === 'forums' && <div className="mb-6"></div>}
            {(activeTab === 'overview' && forums.length > 0) && <h2 className="text-2xl font-bold mb-6">Forumlarım</h2>}
            
            {forums.length === 0 ? (
              activeTab === 'forums' && (
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Server className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Henüz Forumunuz Yok</h3>
                  <p className="text-gray-500 mb-6">İlk topluluğunuzu oluşturmak için hemen başlayın.</p>
                  <button 
                    onClick={() => setIsDeployModalOpen(true)}
                    className="text-[#ffc900] font-bold hover:underline"
                  >
                    Forum Oluştur &rarr;
                  </button>
                </div>
              )
            ) : (
              <div className="grid gap-6">
                {forums.slice(0, activeTab === 'overview' ? 3 : undefined).map((forum) => (
                  <div key={forum.id} className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 border-2 border-black flex items-center justify-center font-bold text-xl">
                        {forum.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{forum.url ? new URL(forum.url).hostname : `${forum.name}.${domain}`}</h3>
                        <div className="flex items-center gap-2 text-sm font-medium mt-1">
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(forum.status)}`}></span>
                          <span className="capitalize text-gray-600">{getStatusText(forum.status)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {forum.status === 'active' && (
                        <a 
                          href={forum.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 md:flex-none text-center bg-white text-black px-4 py-2 font-bold border-2 border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                          Foruma Git <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button className="p-2 border-2 border-black hover:bg-gray-100 transition-colors">
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {activeTab === 'overview' && forums.length > 3 && (
                  <button onClick={() => setActiveTab('forums')} className="text-center font-bold underline mt-4">
                    Tümünü Gör ({forums.length})
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 mb-6 font-medium">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border-2 border-green-500 text-green-700 p-4 mb-6 font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSettingsUpdate} className="space-y-6">
                <div>
                  <label className="block font-bold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                    className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({...settingsForm, email: e.target.value})}
                    className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    required
                  />
                </div>

                <div className="border-t-2 border-gray-100 pt-6 mt-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Şifre Değiştir
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Mevcut Şifre</label>
                      <input
                        type="password"
                        value={settingsForm.currentPassword}
                        onChange={(e) => setSettingsForm({...settingsForm, currentPassword: e.target.value})}
                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-gray-500 mt-1">Sadece şifrenizi değiştirmek istiyorsanız doldurun.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Yeni Şifre</label>
                      <input
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm({...settingsForm, newPassword: e.target.value})}
                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm({...settingsForm, confirmPassword: e.target.value})}
                        className="w-full p-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="bg-black text-white px-8 py-3 font-bold hover:bg-gray-800 transition-all border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                  >
                    {settingsLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DeployModal 
          isOpen={isDeployModalOpen} 
          onClose={() => setIsDeployModalOpen(false)}
          apiUrl={apiUrl}
        />
      </main>
    </div>
  );
};

export default Dashboard;
