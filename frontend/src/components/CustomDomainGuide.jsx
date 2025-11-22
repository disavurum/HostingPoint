import { useState } from 'react'
import { X, Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CustomDomainGuide = ({ isOpen, onClose, customDomain }) => {
  const [copiedStep, setCopiedStep] = useState(null)
  const domain = import.meta.env.VITE_DOMAIN || 'hostingpoint.net'
  const serverIP = process.env.VITE_SERVER_IP || 'YOUR_SERVER_IP' // Bu environment variable'dan gelecek

  const steps = [
    {
      id: 1,
      title: 'DNS Kayıtlarınızı Düzenleyin',
      description: 'Domain sağlayıcınızın DNS yönetim paneline giriş yapın.',
      details: [
        'GoDaddy, Namecheap, Cloudflare gibi domain sağlayıcınızın yönetim paneline giriş yapın',
        'DNS ayarları bölümüne gidin'
      ]
    },
    {
      id: 2,
      title: 'A Kaydı Ekleyin',
      description: 'Domain\'inizi sunucumuza yönlendirmek için A kaydı ekleyin.',
      details: [
        'Yeni bir A kaydı oluşturun',
        `Host/Name: @ veya ${customDomain.split('.')[0]}`,
        `Value/IP: ${serverIP}`,
        'TTL: 3600 (veya otomatik)'
      ],
      copyable: serverIP
    },
    {
      id: 3,
      title: 'CNAME Kaydı Ekleyin (Opsiyonel)',
      description: 'www subdomain\'i için CNAME kaydı ekleyin.',
      details: [
        'Yeni bir CNAME kaydı oluşturun',
        'Host/Name: www',
        `Value/Points to: ${customDomain}`,
        'TTL: 3600 (veya otomatik)'
      ],
      copyable: customDomain
    },
    {
      id: 4,
      title: 'DNS Yayılımını Bekleyin',
      description: 'DNS değişikliklerinin yayılması 5 dakika ile 48 saat arasında sürebilir.',
      details: [
        'DNS değişiklikleri genellikle 5-30 dakika içinde aktif olur',
        'Bazı durumlarda 48 saate kadar sürebilir',
        'DNS yayılımını kontrol etmek için: whatsmydns.net veya dnschecker.org kullanabilirsiniz'
      ]
    },
    {
      id: 5,
      title: 'Forumu Başlatın',
      description: 'DNS ayarları tamamlandıktan sonra forumu başlatın.',
      details: [
        'DNS kayıtlarının yayılmasını bekleyin',
        'Forum kurulum modalına geri dönün',
        'Özel domain ile kurulumu başlatın'
      ]
    }
  ]

  const copyToClipboard = (text, stepId) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepId)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-black bg-[#f4f4f0] sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-black flex items-center gap-3">
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-full">
                <ExternalLink className="h-4 w-4" />
              </div>
              Özel Domain Ekleme Rehberi
            </h2>
            <button onClick={onClose} className="text-black hover:opacity-70">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="bg-blue-50 border-2 border-blue-300 p-4 mb-6 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-blue-900 mb-1">Önemli Notlar:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• DNS ayarları tamamlanmadan forumu başlatmayın</li>
                    <li>• DNS yayılımı 5 dakika ile 48 saat arasında sürebilir</li>
                    <li>• Domain: <strong>{customDomain || 'example.com'}</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="border-2 border-black p-6 bg-white">
                  <div className="flex items-start gap-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {step.id}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">
                              {detail.includes(serverIP) || detail.includes(customDomain) ? (
                                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                                  {detail}
                                </code>
                              ) : (
                                detail
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Copyable Value */}
                      {step.copyable && (
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-300 rounded flex items-center justify-between">
                          <code className="font-mono text-sm flex-1">{step.copyable}</code>
                          <button
                            onClick={() => copyToClipboard(step.copyable, step.id)}
                            className="ml-4 p-2 bg-black text-white hover:bg-gray-800 transition-colors"
                            title="Kopyala"
                          >
                            {copiedStep === step.id ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpful Links */}
            <div className="mt-8 p-6 bg-gray-50 border-2 border-black">
              <h4 className="font-bold mb-3">Yardımcı Kaynaklar:</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://whatsmydns.net" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    DNS Yayılımını Kontrol Et (whatsmydns.net)
                  </a>
                </li>
                <li>
                  <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    DNS Checker (dnschecker.org)
                  </a>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 bg-black text-white font-bold py-3 px-6 hover:bg-gray-800 transition-colors border-2 border-black"
              >
                Anladım, Devam Et
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CustomDomainGuide

