import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Users, Server, DollarSign, LogOut, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '../utils/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, forums: 0, revenue: 0 });
    const [users, setUsers] = useState([]);
    const [forums, setForums] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    const apiUrl = getApiUrl();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [statsRes, usersRes, forumsRes] = await Promise.all([
                    axios.get(`${apiUrl}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${apiUrl}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${apiUrl}/api/admin/forums`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                setStats(statsRes.data);
                setUsers(usersRes.data.users);
                setForums(forumsRes.data.forums);
            } catch (error) {
                console.error('Admin data fetch failed:', error);
                if (error.response?.status === 403) {
                    navigate('/dashboard');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, apiUrl]);

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
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center font-bold text-white">A</div>
                        <span className="text-xl font-bold">Admin Panel</span>
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
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                    >
                        <Users className="h-5 w-5" />
                        Kullanıcılar
                    </button>
                    <button
                        onClick={() => setActiveTab('forums')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'forums' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}
                    >
                        <Server className="h-5 w-5" />
                        Forumlar
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-gray-900 rounded-lg transition-colors font-medium text-sm mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard'a Dön
                    </button>
                    <button
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-900 rounded-lg transition-colors font-medium text-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <header className="mb-12">
                    <h1 className="text-3xl font-black mb-2">
                        {activeTab === 'overview' && 'Admin Genel Bakış'}
                        {activeTab === 'users' && 'Kullanıcı Yönetimi'}
                        {activeTab === 'forums' && 'Tüm Forumlar'}
                    </h1>
                </header>

                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-gray-500 font-bold mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" /> Toplam Kullanıcı
                            </div>
                            <div className="text-4xl font-black">{stats.users}</div>
                        </div>
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-gray-500 font-bold mb-2 flex items-center gap-2">
                                <Server className="h-4 w-4" /> Toplam Forum
                            </div>
                            <div className="text-4xl font-black">{stats.forums}</div>
                        </div>
                        <div className="bg-white p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="text-gray-500 font-bold mb-2 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Tahmini Gelir
                            </div>
                            <div className="text-4xl font-black">${stats.revenue}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b-2 border-black font-bold">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">İsim</th>
                                    <th className="p-4">Kayıt Tarihi</th>
                                    <th className="p-4">Admin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-4">{user.id}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.name}</td>
                                        <td className="p-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {user.is_admin ? (
                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">Admin</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-bold">User</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'forums' && (
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b-2 border-black font-bold">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Forum Adı</th>
                                    <th className="p-4">Sahibi</th>
                                    <th className="p-4">Durum</th>
                                    <th className="p-4">Oluşturulma</th>
                                </tr>
                            </thead>
                            <tbody>
                                {forums.map(forum => (
                                    <tr key={forum.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-4">{forum.id}</td>
                                        <td className="p-4 font-bold">{forum.name}</td>
                                        <td className="p-4">
                                            <div>{forum.user_name}</div>
                                            <div className="text-xs text-gray-500">{forum.user_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${forum.status === 'active' ? 'bg-green-100 text-green-800' :
                                                    forum.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {forum.status}
                                            </span>
                                        </td>
                                        <td className="p-4">{new Date(forum.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
