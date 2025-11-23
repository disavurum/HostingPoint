import { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, AlertCircle, Globe, Server, Sparkles, ExternalLink } from 'lucide-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import CustomDomainGuide from './CustomDomainGuide'

const DeployModal = ({ isOpen, onClose, onSuccess }) => {
  // Check if running on localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const domain = isLocalhost ? 'localhost' : (import.meta.env.VITE_DOMAIN || 'hostingpoint.net')
  const [forumName, setForumName] = useState('')
  const [useCustomDomain, setUseCustomDomain] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [autoGenerate, setAutoGenerate] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [forumUrl, setForumUrl] = useState('')
  const [showDomainGuide, setShowDomainGuide] = useState(false)
  const [selectedServer, setSelectedServer] = useState('eunorth')

  // Auto-generate subdomain
  useEffect(() => {
    if (autoGenerate && !useCustomDomain && !forumName) {
      generateRandomSubdomain()
    }
  }, [autoGenerate, useCustomDomain])

  const generateRandomSubdomain = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'app-'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setForumName(result)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (loading) {
      return
    }
    
    // If using custom domain, validate it
    if (useCustomDomain) {
      if (!customDomain) {
        setStatus('error')
        setStatusMessage('Lütfen özel domain adresinizi girin.')
        return
      }
      // Basic domain validation
      const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
      if (!domainRegex.test(customDomain)) {
        setStatus('error')
        setStatusMessage('Geçerli bir domain adresi girin (örn: example.com)')
        return
      }
    } else {
      // Validate auto-generated or manual subdomain
      if (!forumName) {
        setStatus('error')
        setStatusMessage('Lütfen bir subdomain adı girin veya otomatik oluşturmayı seçin.')
        return
      }

      if (!/^[a-z0-9-]+$/.test(forumName)) {
        setStatus('error')
        setStatusMessage('Sadece küçük harf, rakam ve tire kullanılabilir.')
        return
      }
    }

    setLoading(true)
    setStatus('deploying')
    setStatusMessage('İşlem başlatılıyor...')

    try {
      setTimeout(() => setStatusMessage('Altyapı hazırlanıyor...'), 2000)
      setTimeout(() => setStatusMessage('Discourse forum kuruluyor...'), 4000)
      
      const payload = {
        forumName: useCustomDomain ? null : forumName,
        customDomain: useCustomDomain ? customDomain : null,
        autoGenerate: !useCustomDomain && autoGenerate,
        server: selectedServer
      }
      
      const response = await axios.post('/api/deploy', payload)

      setStatus('success')
      setStatusMessage('Kurulum tamamlandı!')
      
      // Handle localhost URL with port
      if (isLocalhost && response.data.port) {
        setForumUrl(`http://localhost:${response.data.port}`)
      } else {
        setForumUrl(response.data.forumUrl)
      }
      
      // Notify parent component of successful deployment
      if (onSuccess) {
        onSuccess(response.data)
      }
      } catch (error) {
        setStatus('error')
        if (error.response?.status === 401) {
          setStatusMessage('Oturum süreniz dolmuş. Lütfen sayfayı yenileyip tekrar giriş yapın.')
        } else if (error.response?.status === 403) {
          // Limit exceeded error
          const errorData = error.response?.data
          if (errorData?.error === 'Limit exceeded' || errorData?.error === 'Storage limit exceeded') {
            setStatusMessage(errorData.message || 'Plan limitinize ulaştınız. Lütfen planınızı yükseltin.')
          } else {
            setStatusMessage(errorData?.message || 'Plan limitinize ulaştınız.')
          }
        } else {
          setStatusMessage(error.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
        }
      } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForumName('')
    setCustomDomain('')
    setUseCustomDomain(false)
    setAutoGenerate(true)
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
          className="relative bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black bg-[#f4f4f0] sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full">
                <Server className="h-4 w-4" />
              </div>
              Discourse Forum Kurulumu
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
                    className="block w-full bg-black text-white font-bold py-4 px-6 hover:bg-gray-900 transition-colors text-center border-2 border-black mb-4"
                  >
                    <ExternalLink className="inline h-5 w-5 mr-2" />
                    Foruma Git
                  </a>
                )}
                <button
                  onClick={handleReset}
                  className="block w-full py-4 text-black font-bold hover:underline"
                >
                  Yeni Kurulum
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Domain Type Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    Domain Seçeneği
                  </label>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomDomain(false)
                        setAutoGenerate(true)
                        if (!forumName) generateRandomSubdomain()
                      }}
                      className={`flex-1 p-4 border-2 font-bold transition-all ${
                        !useCustomDomain
                          ? 'bg-[#ffc900] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white border-gray-300 hover:border-black'
                      }`}
                    >
                      <Sparkles className="h-5 w-5 mx-auto mb-2" />
                      Ücretsiz Subdomain
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setUseCustomDomain(true)}
                      className={`flex-1 p-4 border-2 font-bold transition-all ${
                        useCustomDomain
                          ? 'bg-[#ffc900] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white border-gray-300 hover:border-black'
                      }`}
                    >
                      <Globe className="h-5 w-5 mx-auto mb-2" />
                      Özel Domain
                    </button>
                  </div>
                </div>

                {/* Server Selection */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                    Sunucu Seçimi
                  </label>
                  <select
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="w-full bg-white border-2 border-black p-4 text-black font-medium outline-none focus:bg-yellow-50"
                  >
                    <option value="eunorth">EU North (Avrupa)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    Forumunuzun kurulacağı sunucu lokasyonu
                  </p>
                </div>

                {!useCustomDomain ? (
                  <>
                    {/* Auto-generated Subdomain */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                        Subdomain
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={forumName}
                          onChange={(e) => {
                            setForumName(e.target.value.toLowerCase())
                            setAutoGenerate(false)
                          }}
                          placeholder="otomatik-oluşturulacak"
                          className="flex-1 bg-white border-2 border-black p-4 text-black font-medium outline-none focus:bg-yellow-50 placeholder-gray-400"
                          required
                        />
                        <div className="bg-gray-100 border-2 border-l-0 border-black px-4 flex items-center text-gray-500 font-medium">
                          .{domain}
                        </div>
                        <button
                          type="button"
                          onClick={generateRandomSubdomain}
                          className="bg-gray-100 border-2 border-black px-4 font-bold hover:bg-gray-200 transition-colors"
                          title="Yeni subdomain oluştur"
                        >
                          <Sparkles className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Otomatik oluşturulan ücretsiz subdomain: <strong>{forumName}.{domain}</strong>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Custom Domain */}
                    <div>
                      <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wide">
                        Özel Domain
                      </label>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                        placeholder="example.com"
                        className="w-full bg-white border-2 border-black p-4 text-black font-medium outline-none focus:bg-yellow-50 placeholder-gray-400"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Özel domain eklemek için DNS ayarlarınızı yapılandırmanız gerekecek.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDomainGuide(true)}
                        className="mt-2 text-sm text-blue-600 hover:underline font-bold"
                      >
                        DNS Yapılandırma Rehberi →
                      </button>
                    </div>
                  </>
                )}

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

      {/* Custom Domain Guide Modal */}
      {showDomainGuide && (
        <CustomDomainGuide
          isOpen={showDomainGuide}
          onClose={() => setShowDomainGuide(false)}
          customDomain={customDomain}
        />
      )}
    </AnimatePresence>
  )
}

export default DeployModal
