// frontend/src/pages/Home.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUserMd, FaHeartbeat, FaMicroscope, FaArrowRight, FaStar,
  FaCalendarAlt, FaCheckCircle, FaFlask, FaComment, FaBroom, FaUsers,
  FaBell, FaClock, FaShieldAlt
} from 'react-icons/fa';

const skinTips = [
  { icon: '🔍', title: 'Early Detection', desc: 'Catching skin changes early can make a critical difference.', color: 'blue' },
  { icon: '☀️', title: 'Sun Damage Check', desc: 'UV exposure is a leading cause of skin cancer. Assess sun damage instantly.', color: 'amber' },
  { icon: '🧬', title: 'Mole Monitoring', desc: 'Track changes in moles and spots over time with AI.', color: 'violet' },
  { icon: '💧', title: 'Hydration & Texture', desc: 'Get personalised guidance for dry, oily, or flaky skin.', color: 'cyan' },
  { icon: '🩺', title: 'Dermatologist Ready', desc: 'Generate scan reports to share with your specialist.', color: 'emerald' },
  { icon: '📊', title: 'Skin History Tracking', desc: 'Build a visual timeline of your skin health.', color: 'rose' },
];

const stats = [
  { value: 50000, label: 'Patients Served', suffix: '+' },
  { value: 200, label: 'Expert Doctors', suffix: '+' },
  { value: 98, label: 'Satisfaction Rate', suffix: '%' },
  { value: 24, label: 'Hour Support', suffix: '/7' },
];

const testimonials = [
  { name: 'Amara Silva', role: 'Patient', text: 'The AI skin scanner flagged a mole I\'d ignored for years. This app may have saved my life.', rating: 5, avatar: 'AS' },
  { name: 'Rohan Perera', role: 'Patient', text: 'Booking appointments used to take days. Now I find a slot and confirm in under two minutes.', rating: 5, avatar: 'RP' },
  { name: 'Dilini Fernando', role: 'Patient', text: 'Clear results, easy interface, and the scan history feature is genuinely useful.', rating: 5, avatar: 'DF' },
];

// Services with explicit Tailwind classes (no dynamic colors)
const services = [
  { icon: FaCalendarAlt, title: 'Smart Appointments', desc: 'Book, reschedule, or cancel appointments with real‑time doctor availability.', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  { icon: FaMicroscope, title: 'AI Skin Scanner', desc: 'Upload a photo and receive an instant AI-powered skin analysis. Track changes over time.', bgColor: 'bg-violet-100', textColor: 'text-violet-600' },
  { icon: FaFlask, title: 'Lab Results', desc: 'Doctors request tests; lab technicians upload results securely. View them instantly.', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  { icon: FaComment, title: 'Patient Feedback', desc: 'Share your experience, rate doctors, and help others make informed choices.', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  { icon: FaBroom, title: 'Cleaning Tasks', desc: 'Cleaning staff receive daily tasks; administrators can track completion.', bgColor: 'bg-teal-100', textColor: 'text-teal-600' },
  { icon: FaUsers, title: 'Role‑Based Access', desc: 'Patients, doctors, receptionists, lab techs, admins, and cleaning staff each have tailored dashboards.', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
];

export default function Home() {
  useEffect(() => {
    // Intersection Observer for fade-up animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    // Counter animation for stats
    const counters = document.querySelectorAll('.stat-value');
    const animateCounter = (counter) => {
      const target = parseInt(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      let count = 0;
      const increment = target / 60;
      const updateCount = () => {
        if (count < target) {
          count += increment;
          counter.innerText = Math.ceil(count);
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target + suffix;
        }
      };
      updateCount();
    };
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.stat-value').forEach((counter) => statObserver.observe(counter));

    return () => {
      observer.disconnect();
      statObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-white font-sans antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Medi<span className="text-gray-800">Care</span>+
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 transition px-3 py-2 rounded-lg">
              Login
            </Link>
            <Link
              to="/register/patient"
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2 rounded-full shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <div className="container mx-auto px-6 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              AI-Powered Healthcare Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Health, <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Our Priority</span>
            </h1>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              Book appointments with top specialists, get AI-powered skin analysis, and manage your health journey — all in one seamless platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                to="/register/patient"
                className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition transform hover:-translate-y-0.5"
              >
                Get Started Free <FaArrowRight className="text-sm group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full font-semibold transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-y border-gray-100 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="fade-up opacity-0 translate-y-8 transition-all duration-700">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 stat-value" data-target={stat.value} data-suffix={stat.suffix}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-blue-600 font-semibold uppercase tracking-wide">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">What we offer</h2>
            <p className="text-gray-600 mt-4">Comprehensive tools for patients, doctors, and hospital staff.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={i}
                  className="fade-up opacity-0 translate-y-8 transition-all duration-700 delay-100 group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-xl ${service.bgColor} ${service.textColor} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition`}>
                    <Icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.desc}</p>
                  <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    <span className="text-sm">Learn more</span>
                    <FaArrowRight className="ml-1 text-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Skin Health Hub */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-blue-600 font-semibold uppercase tracking-wide">Skin Health Hub</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Why regular skin checks <span className="text-blue-600">matter</span></h2>
            <p className="text-gray-600 mt-4">
              Skin cancer is one of the most common and preventable cancers. Our AI scanner and specialist network help you stay one step ahead.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skinTips.map((tip, i) => {
              const colorMap = {
                blue: 'text-blue-600 bg-blue-50',
                amber: 'text-amber-600 bg-amber-50',
                violet: 'text-violet-600 bg-violet-50',
                cyan: 'text-cyan-600 bg-cyan-50',
                emerald: 'text-emerald-600 bg-emerald-50',
                rose: 'text-rose-600 bg-rose-50',
              };
              const badgeClass = colorMap[tip.color] || 'text-gray-600 bg-gray-50';
              return (
                <div
                  key={i}
                  className="fade-up opacity-0 translate-y-8 transition-all duration-700 delay-150 group bg-white rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition inline-block">{tip.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                  <p className="text-gray-500 text-sm mt-2">{tip.desc}</p>
                  <span className={`inline-block mt-4 text-xs font-medium px-3 py-1 rounded-full ${badgeClass}`}>
                    AI Assisted
                  </span>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/register/patient"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              Try the AI Scanner Free <FaArrowRight className="text-sm group-hover:translate-x-1 transition" />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required · Demo results</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-blue-600 font-semibold uppercase tracking-wide">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Up and running in <span className="text-blue-600">minutes</span></h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { n: '1', title: 'Create Account', desc: 'Sign up free in under 60 seconds. No credit card needed.' },
              { n: '2', title: 'Choose a Doctor', desc: 'Search by specialty, rating, and availability to find your match.' },
              { n: '3', title: 'Book a Slot', desc: 'Pick a date and time that works for you. Instant confirmation.' },
              { n: '4', title: 'Get Care', desc: 'Attend your appointment and use the AI scanner anytime.' },
            ].map((step, i) => (
              <div key={i} className="fade-up opacity-0 translate-y-8 transition-all duration-700 delay-200 text-center group">
                <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-110 transition">
                  {step.n}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-500 text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-blue-600 font-semibold uppercase tracking-wide">Patient Stories</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Trusted by <span className="text-blue-600">thousands</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="fade-up opacity-0 translate-y-8 transition-all duration-700 delay-300 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="text-gray-600 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white flex items-center justify-center font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control of <span className="italic">your health?</span></h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who manage their health smarter with MediCare+. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/patient"
              className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              Create Free Account <FaArrowRight className="text-sm group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-transparent border border-white text-white hover:bg-white/10 px-8 py-3 rounded-full font-semibold transition"
            >
              Sign In
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-blue-100">
            {['No credit card required', 'Free skin scan included', 'Cancel anytime'].map((f, i) => (
              <span key={i} className="flex items-center gap-2">
                <FaCheckCircle className="text-green-300" /> {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MediCare+</div>
          <p className="text-sm">© 2025 MediCare+. All rights reserved. Demo only — not real medical advice.</p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .fade-up {
          transition: opacity 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
      `}</style>
    </div>
  );
}