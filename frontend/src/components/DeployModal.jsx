import { useState } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Globe, Server } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

const DeployModal = ({ isOpen, onClose }) => {
  const domain = import.meta.env.VITE_DOMAIN || 'vibehost.io'
  const [forumName, setForumName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [forumUrl, setForumUrl] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!forumName || !email) return

    if (!/^[a-z0-9-]+$/.test(forumName)) {
      setStatus('error')
      setStatusMessage('Sadece küçük harf ve rakam kullanılabilir.')
      return
    }

    setLoading(true)
    setStatus('deploying')
    setStatusMessage('İşlem başlatılıyor...')

    try {
      setTimeout(() => setStatusMessage('Altyapı hazırlanıyor...'), 2000)
      setTimeout(() => setStatusMessage('Veritabanı kuruluyor...'), 4000)
      
      // Use global axios instance which handles base URL and token
      const response = await axios.post('/api/deploy', { forumName, email })

      setStatus('success')
      setStatusMessage('Kurulum tamamlandı.')
      setForumUrl(response.data.forumUrl)
    } catch (error) {
      setStatus('error')
      if (error.response?.status === 401) {
        setStatusMessage('Oturum süreniz dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.')
      } else {
        setStatusMessage(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForumName('')
    setEmail('')
    setStatus(null)
    setStatusMessage('')
    setForumUrl('')
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/90 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-lg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black bg-[#f4f4f0]">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full">
                <Server className="h-4 w-4" />
              </div>
              Forum Kurulumu
            </h2>
            <button onClick={onClose} className="text-black hover:opacity-70">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {status === 'success' ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Harika!</h3>
                <p className="text-gray-600 mb-8 text-lg">{statusMessage}</p>
                
                {forumUrl && (
                  <a
                    href={forumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-black text-white font-bold py-4 px-6 hover:bg-gray-900 transition-colors text-center border-2 border-black"
                  >
                    Foruma Git
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="block w-full mt-4 py-4 text-black font-bold hover:underline"
                >
                  Yeni Kurulum
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Forum Adı
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={forumName}
                      onChange={(e) => setForumName(e.target.value.toLowerCase())}
                      placeholder="topluluk-ismi"
                      className="flex-1 bg-white border-2 border-black p-4 text-black font-medium outline-none focus:bg-yellow-50 placeholder-gray-400"
                      required
                    />
                    <div className="bg-gray-100 border-2 border-l-0 border-black px-4 flex items-center text-gray-500 font-medium">
                      .{domain}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Yönetici E-posta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sirket.com"
                    className="w-full bg-white border-2 border-black p-4 text-black font-medium outline-none focus:bg-yellow-50 placeholder-gray-400"
                    required
                  />
                </div>

                {status === 'deploying' && (
                  <div className="bg-yellow-100 border-2 border-black p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-bold">{statusMessage}</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="bg-red-100 border-2 border-black p-4 flex items-center gap-3 text-red-900">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-bold">{statusMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ffc900] border-2 border-black text-black font-bold py-4 hover:bg-[#ffc900]/90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Kuruluyor...' : 'Forumu Başlat ->'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DeployModal
