import { useState, useEffect } from 'react'
import { ArrowRight, Check, Globe, Layout, Shield, Users, Zap, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import DeployModal from '../components/DeployModal'
import { getApiUrl } from '../utils/api'

// Currency conversion rates (approximate)
const CURRENCY_RATES = {
  USD: { TRY: 34.5, symbol: '$' },
  TRY: { USD: 1/34.5, symbol: '₺' }
}

const PRICING_USD = {
  starter: 29,
  pro: 79,
  enterprise: 'Custom'
}

const PRICING_TRY = {
  starter: 600,
  pro: 2500,
  enterprise: 'Özel'
}

const API_URL = getApiUrl()

function HomePage() {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [stars, setStars] = useState([])
  const [user, setUser] = useState(null)
  const [currency, setCurrency] = useState('TRY') // Default to TRY

  const carouselImages = [
    "https://canada1.discourse-cdn.com/discover/original/2X/7/7034d28025e75a326950174b531286f5946ff021.png",
    "https://canada1.discourse-cdn.com/discover/original/2X/5/5978a1e176979aa85c667d87f2e79870a9ba59c8.jpeg",
    "https://canada1.discourse-cdn.com/discover/original/2X/e/e9dd2c703948f002c08db11088712cdf76028428.png",
    "https://canada1.discourse-cdn.com/discover/original/1X/d5651aee0aff7c9dd2b9cfa0cb616e74f1aaa35e.png"
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 3000) // Change every 3 seconds
    return () => clearInterval(timer)
  }, [carouselImages.length])

  // Generate stars for the Social Proof section
  useEffect(() => {
    const count = 30
    const newStars = []
    for (let i = 0; i < count; i++) {
      newStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 2 + 1}px`,
        duration: `${Math.random() * 3 + 2}s`,
        delay: `${Math.random() * 5}s`
      })
    }
    setStars(newStars)
  }, [])

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Navbar */}
      <nav className="border-b-2 border-black sticky top-0 bg-white/95 backdrop-blur z-40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <span className="text-2xl font-bold tracking-tight">HostingPoint</span>
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#features" className="hover:underline decoration-2">{t('nav.features')}</a>
            <a href="#showcase" className="hover:underline decoration-2">{t('nav.showcase')}</a>
            <a href="#pricing" className="hover:underline decoration-2">{t('nav.pricing')}</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <a href="/dashboard" className="font-bold hover:underline flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {user.name?.[0] || 'U'}
                  </div>
                  {user.name}
                </a>
                <a href="/dashboard"
                  className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] block text-center"
                >
                  {t('nav.dashboard')}
                </a>
              </>
            ) : (
              <>
                <a href="/login" className="hidden md:block font-medium hover:underline">{t('nav.login')}</a>
                <a href="/register"
                  className="bg-black text-white px-6 py-3 font-bold hover:bg-gray-800 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_#9ca3af] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] block text-center"
                >
                  {t('nav.start')}
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="border-b-2 border-black bg-[#ffc900]">
        <div className="container mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-white border-2 border-black px-4 py-2 font-bold transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {t('hero.badge')}
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
              {t('hero.title_part1')} <br />
              <span className="bg-white px-2 border-2 border-black inline-block transform rotate-1">{t('hero.title_part2')}</span> {t('hero.title_suffix')}
            </h1>
            <p className="text-xl font-medium leading-relaxed max-w-md">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <a href="/dashboard"
                  className="bg-black text-white px-8 py-4 text-lg font-bold border-2 border-black shadow-[6px_6px_0px_0px_#fff] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2 justify-center"
                >
                  {t('hero.cta_dashboard')} <ArrowRight className="h-5 w-5" />
                </a>
              ) : (
                <a href="/register"
                  className="bg-black text-white px-8 py-4 text-lg font-bold border-2 border-black shadow-[6px_6px_0px_0px_#fff] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center gap-2 justify-center"
                >
                  {t('hero.cta_primary')} <ArrowRight className="h-5 w-5" />
                </a>
              )}
              <button className="bg-white text-black px-8 py-4 text-lg font-bold border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
                {t('hero.cta_secondary')}
              </button>
            </div>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            {/* Hero Image */}
            <div className="w-full max-w-[600px] bg-white border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
              <img
                src="https://discourse.org/a/img/customers/tech_openai-2x.jpg"
                alt="Discourse Hero"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Social Proof - Black with Stars */}
      <section className="border-b-2 border-black py-16 bg-black text-white relative overflow-hidden">
        {/* Stars Background */}
        <div className="absolute inset-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                '--duration': star.duration,
                '--delay': star.delay
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <p className="text-center font-bold mb-12 text-gray-400 uppercase tracking-widest text-sm">{t('social_proof.label')}</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-100 transition-all">
            <a href="https://community.openai.com/" target="_blank" rel="noreferrer" className="hover:scale-105 transition-transform brightness-0 invert opacity-80 hover:opacity-100">
              <img src="/images/Frame 2 (1).svg" alt="OpenAI Logo" className="h-8 w-auto" />
            </a>
            <a href="https://devforum.zoom.us/" target="_blank" rel="noreferrer" className="hover:scale-105 transition-transform brightness-0 invert opacity-80 hover:opacity-100">
              <img src="/images/Zz01ZGU4MDMzZWJmNDcxMWVkOTI4NGEyNDU1OWRiZTc5Zg==.svg" alt="Zoom Logo" className="h-8 w-auto" />
            </a>
            <a href="https://forums.unrealengine.com/" target="_blank" rel="noreferrer" className="hover:scale-105 transition-transform brightness-0 invert opacity-80 hover:opacity-100">
              <img src="/images/Logo Unreal Engine.svg" alt="Unreal Engine Logo" className="h-10 w-auto" />
            </a>
          </div>
        </div>
      </section>

      {/* Value Props Grid */}
      <section id="features" className="border-b-2 border-black">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x-2 divide-black">
          <div className="p-12 hover:bg-yellow-50 transition-colors group">
            <div className="w-16 h-16 bg-[#ff90e8] border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <Zap className="h-8 w-8" />
            </div>

            <div className="mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
              <video
                src="https://discourse.org/a/vid/scroll.webm"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              />
            </div>

            <h3 className="text-2xl font-bold mb-4">{t('features.modern.title')}</h3>
            <p className="font-medium text-gray-600 leading-relaxed">
              {t('features.modern.desc')}
            </p>
          </div>
          <div className="p-12 hover:bg-blue-50 transition-colors group">
            <div className="w-16 h-16 bg-[#23a094] border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <Shield className="h-8 w-8 text-white" />
            </div>

            <div className="mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
              <img
                src="https://discourse.org/a/img/features/moderation-2x.jpg"
                alt="Moderation"
                className="w-full h-auto"
              />
            </div>

            <h3 className="text-2xl font-bold mb-4">{t('features.security.title')}</h3>
            <p className="font-medium text-gray-600 leading-relaxed">
              {t('features.security.desc')}
            </p>
          </div>
          <div className="p-12 hover:bg-pink-50 transition-colors group">
            <div className="w-16 h-16 bg-[#f1f333] border-2 border-black mb-6 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
              <Users className="h-8 w-8" />
            </div>

            <div className="mb-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
              <img
                src="https://discourse.org/a/img/features/mobile-2x.png"
                alt="Mobile Friendly"
                className="w-full h-auto"
              />
            </div>

            <h3 className="text-2xl font-bold mb-4">{t('features.mobile.title')}</h3>
            <p className="font-medium text-gray-600 leading-relaxed">
              {t('features.mobile.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 1 */}
      <section className="border-b-2 border-black">
        <div className="grid md:grid-cols-2">
          <div className="p-12 md:p-24 flex flex-col justify-center bg-[#b2fffb]">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('deep_dive_1.title')}</h2>
            <p className="text-xl font-medium mb-8">
              {t('deep_dive_1.desc')}
            </p>
            <ul className="space-y-4 font-bold">
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 bg-black text-white rounded-full p-1" />
                {t('deep_dive_1.list.themes')}
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 bg-black text-white rounded-full p-1" />
                {t('deep_dive_1.list.categories')}
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-6 w-6 bg-black text-white rounded-full p-1" />
                {t('deep_dive_1.list.plugins')}
              </li>
            </ul>
          </div>
          <div className="bg-gray-100 border-l-2 border-black p-12 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
            <div className="w-full h-full min-h-[400px] bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
              <img
                src="https://d11a6trkgmumsb.cloudfront.net/original/4X/f/e/1/fe100ef4d40c4082c248a9e7ebe48717c1e65a62.png"
                alt="Admin Panel"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive 2 - Customizable */}
      <section className="border-b-2 border-black">
        <div className="grid md:grid-cols-2">
          <div className="bg-gray-100 border-r-2 border-black p-12 flex items-center justify-center relative order-2 md:order-1">
            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
            <div className="w-full h-full min-h-[400px] bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden relative group">
              {/* Carousel Images */}
              {carouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Theme Example ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                />
              ))}

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {carouselImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-black w-4' : 'bg-black/30'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="p-12 md:p-24 flex flex-col justify-center bg-[#ffc900] order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('deep_dive_2.title')}</h2>
            <p className="text-xl font-medium mb-8">
              {t('deep_dive_2.desc')}
            </p>
            <button className="self-start bg-black text-white px-8 py-4 font-bold border-2 border-black hover:bg-gray-800 transition-all">
              {t('deep_dive_2.cta')}
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="border-b-2 border-black py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('pricing.title')}</h2>
            <p className="text-xl text-gray-600 font-medium mb-8">{t('pricing.subtitle')}</p>
            
            {/* Currency Switcher */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm font-bold text-gray-600">Para Birimi:</span>
              <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => setCurrency('TRY')}
                  className={`px-6 py-2 font-bold transition-all ${
                    currency === 'TRY'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  ₺ TL
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-6 py-2 font-bold border-l-2 border-black transition-all ${
                    currency === 'USD'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Pro Plan - Left */}
            <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
              <div className="bg-[#23a094] text-white inline-block px-4 py-1 border-2 border-black font-bold mb-4 text-sm uppercase tracking-wider">
                {t('pricing.plans.pro.name')}
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-black">
                  {currency === 'TRY' ? `₺${PRICING_TRY.pro}` : `$${PRICING_USD.pro}`}
                </span>
                <span className="text-gray-600 font-bold ml-2">{t('pricing.monthly')}</span>
              </div>
              <ul className="space-y-4 mb-8 font-medium">
                {t('pricing.plans.pro.features', { returnObjects: true }).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={3} /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-black border-2 border-black py-4 font-bold hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {t('pricing.cta')}
              </button>
            </div>

            {/* Starter Plan - Center (Featured) */}
            <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all bg-[#ffc900] relative transform scale-105 z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 font-bold border-2 border-black transform rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                EN POPÜLER
              </div>
              {/* Starter Plan Image */}
              <div className="mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                <img
                  src="/src/assets/images/starter-plan.png"
                  alt="Starter Plan"
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="bg-black text-white inline-block px-4 py-1 border-2 border-black font-bold mb-4 text-sm uppercase tracking-wider">
                {t('pricing.plans.starter.name')}
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-black">
                  {currency === 'TRY' ? `₺${PRICING_TRY.starter}` : `$${PRICING_USD.starter}`}
                </span>
                <span className="text-gray-600 font-bold ml-2">{t('pricing.monthly')}</span>
              </div>
              <ul className="space-y-4 mb-8 font-bold">
                {t('pricing.plans.starter.features', { returnObjects: true }).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-6 w-6 bg-black text-white rounded-full p-0.5 flex-shrink-0 mt-0.5" strokeWidth={3} /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-black text-white border-2 border-black py-4 font-bold hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_#fff]">
                {t('pricing.cta')}
              </button>
            </div>

            {/* Enterprise Plan - Right */}
            <div className="border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
              <div className="bg-[#ff90e8] inline-block px-4 py-1 border-2 border-black font-bold mb-4 text-sm uppercase tracking-wider">
                {t('pricing.plans.enterprise.name')}
              </div>
              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-black">
                  {currency === 'TRY' ? PRICING_TRY.enterprise : PRICING_USD.enterprise}
                </span>
              </div>
              <ul className="space-y-4 mb-8 font-medium">
                {t('pricing.plans.enterprise.features', { returnObjects: true }).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" strokeWidth={3} /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-white text-black border-2 border-black py-4 font-bold hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b-2 border-black py-24 bg-black text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-16">{t('stats.title')}</h2>
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="text-6xl font-black text-[#ffc900] mb-2">10K+</div>
              <div className="font-bold text-xl">{t('stats.members')}</div>
            </div>
            <div>
              <div className="text-6xl font-black text-[#ff90e8] mb-2">99.9%</div>
              <div className="font-bold text-xl">{t('stats.uptime')}</div>
            </div>
            <div>
              <div className="text-6xl font-black text-[#23a094] mb-2">50+</div>
              <div className="font-bold text-xl">{t('stats.countries')}</div>
            </div>
            <div>
              <div className="text-6xl font-black text-[#f1f333] mb-2">24/7</div>
              <div className="font-bold text-xl">{t('stats.support')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            {t('cta_section.title')}
          </h2>
          <p className="text-xl font-medium text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('cta_section.desc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <a href="/dashboard"
                className="bg-[#ffc900] text-black px-12 py-6 text-xl font-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all block text-center"
              >
                {t('cta_section.button_dashboard')}
              </a>
            ) : (
              <a href="/register"
                className="bg-[#ffc900] text-black px-12 py-6 text-xl font-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all block text-center"
              >
                {t('cta_section.button')}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t-2 border-black">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <h3 className="text-2xl font-bold mb-4">HostingPoint</h3>
              <p className="text-gray-400 max-w-sm">
                {t('footer.desc')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-500">{t('footer.product')}</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.features')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.pricing')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.showcase')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.changelog')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-500">{t('footer.company')}</h4>
              <ul className="space-y-2 font-medium">
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.about')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.careers')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.blog')}</a></li>
                <li><a href="#" className="hover:text-[#ffc900]">{t('footer.links.contact')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-medium text-gray-500">
              {t('footer.rights')}
            </div>
            <div className="flex gap-6 font-medium">
              <a href="#" className="hover:text-white">{t('footer.links.privacy')}</a>
              <a href="#" className="hover:text-white">{t('footer.links.terms')}</a>
            </div>
          </div>
        </div>
      </footer>

      <DeployModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default HomePage
