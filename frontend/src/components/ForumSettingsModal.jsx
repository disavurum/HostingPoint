import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Globe, Database, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../utils/api';

const ForumSettingsModal = ({ isOpen, onClose, forumName }) => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [backups, setBackups] = useState([]);
    const [customDomain, setCustomDomain] = useState('');
    const [backupLoading, setBackupLoading] = useState(false);

    const apiUrl = getApiUrl();

    useEffect(() => {
        if (isOpen && forumName && activeTab === 'backups') {
            fetchBackups();
        }
    }, [isOpen, forumName, activeTab]);

    const fetchBackups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/forums/${forumName}/backups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBackups(response.data.backups || []);
        } catch (error) {
            console.error('Failed to fetch backups:', error);
        }
    };

    const handleCreateBackup = async () => {
        setBackupLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${apiUrl}/api/forums/${forumName}/backups`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchBackups();
            alert('Yedekleme başarıyla oluşturuldu.');
        } catch (error) {
            console.error('Backup failed:', error);
            alert('Yedekleme oluşturulamadı.');
        } finally {
            setBackupLoading(false);
        }
    };

    const handleSaveDomain = async () => {
        alert('Custom Domain özelliği şu anda bakımda.');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold">Forum Ayarları: {forumName}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex-1 py-3 font-medium text-sm ${activeTab === 'general' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Genel
                    </button>
                    <button
                        onClick={() => setActiveTab('domain')}
                        className={`flex-1 py-3 font-medium text-sm ${activeTab === 'domain' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Alan Adı (Domain)
                    </button>
                    <button
                        onClick={() => setActiveTab('backups')}
                        className={`flex-1 py-3 font-medium text-sm ${activeTab === 'backups' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
                    >
                        Yedeklemeler
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-800">Dikkat</h4>
                                    <p className="text-sm text-yellow-700">
                                        Forumu silmek geri alınamaz bir işlemdir. Tüm verileriniz kalıcı olarak silinir.
                                    </p>
                                </div>
                            </div>
                            <button className="w-full bg-red-600 text-white py-3 font-bold hover:bg-red-700 transition-colors rounded">
                                Forumu Sil
                            </button>
                        </div>
                    )}

                    {activeTab === 'domain' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2">Özel Alan Adı</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="forum.ornek.com"
                                        value={customDomain}
                                        onChange={(e) => setCustomDomain(e.target.value)}
                                        className="flex-1 p-3 border-2 border-black rounded focus:outline-none"
                                    />
                                    <button
                                        onClick={handleSaveDomain}
                                        className="bg-black text-white px-6 font-bold rounded hover:bg-gray-800"
                                    >
                                        Kaydet
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    CNAME kaydınızı <code>vibehost.io</code> adresine yönlendirmeyi unutmayın.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'backups' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Yedekleme Geçmişi</h3>
                                <button
                                    onClick={handleCreateBackup}
                                    disabled={backupLoading}
                                    className="bg-black text-white px-4 py-2 rounded font-bold text-sm hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {backupLoading ? 'Oluşturuluyor...' : 'Yeni Yedek Al'}
                                </button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 font-bold">
                                        <tr>
                                            <th className="p-3">Tarih</th>
                                            <th className="p-3">Boyut</th>
                                            <th className="p-3">Durum</th>
                                            <th className="p-3">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.length > 0 ? (
                                            backups.map((backup) => (
                                                <tr key={backup.id} className="border-t">
                                                    <td className="p-3">{new Date(backup.timestamp).toLocaleDateString()}</td>
                                                    <td className="p-3">{backup.size}</td>
                                                    <td className="p-3">
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                                                            {backup.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <button className="text-blue-600 hover:underline font-medium">İndir</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="p-6 text-center text-gray-500 italic">
                                                    Henüz yedekleme bulunmuyor.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForumSettingsModal;
