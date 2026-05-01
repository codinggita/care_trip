import { Globe, Shield, Heart, Users, Award, Zap } from 'lucide-react';
import SEO from '../components/SEO';

export default function About() {
  const values = [
    {
      title: "Global Accessibility",
      description: "We believe healthcare should have no borders. Whether you're traveling for work or leisure, expert care is always within reach.",
      icon: <Globe className="w-6 h-6" />
    },
    {
      title: "Vetted Professionals",
      description: "Every doctor and hospital on our platform undergoes a rigorous verification process to ensure international standards of care.",
      icon: <Shield className="w-6 h-6" />
    },
    {
      title: "Patient-First Approach",
      description: "Your health and comfort are our top priorities. We provide 24/7 support and English-speaking medical coordinators.",
      icon: <Heart className="w-6 h-6" />
    }
  ];

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      <SEO 
        title="About CareTrip" 
        description="Learn more about CareTrip's mission to provide world-class healthcare for global travelers. Verified doctors and emergency support worldwide."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary-900 text-white p-8 sm:p-16">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-800/50 skew-x-12 translate-x-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
            Redefining Healthcare <br />
            <span className="text-primary-400">For The Global Traveler</span>
          </h1>
          <p className="text-lg text-primary-100 leading-relaxed mb-8">
            CareTrip was born from a simple observation: navigating foreign healthcare systems is stressful. 
            We've built the world's most trusted network of verified medical professionals to ensure you're 
            never alone in a medical emergency.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md text-sm font-bold border border-white/20">
              Verified Network
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="grid lg:grid-cols-2 gap-12 items-center px-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed text-lg mb-6">
            To provide every traveler with immediate access to high-quality, verified medical care, 
            eliminating language barriers and systemic confusion in foreign countries.
          </p>
          <div className="space-y-4">
            {values.map((value, idx) => (
              <div key={idx} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-700 text-white flex items-center justify-center">
                  {value.icon}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{value.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary-100 rounded-[2rem] blur-2xl opacity-50"></div>
          <img 
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
            alt="Healthcare professionals" 
            className="relative rounded-[2rem] shadow-2xl border-4 border-white object-cover h-[500px] w-full"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="card p-8 lg:p-16 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-8">Why CareTrip?</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-4xl">🌎</div>
              <h4 className="font-bold">Global Presence</h4>
              <p className="text-xs text-slate-400">Available in over 500 major travel destinations.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🚑</div>
              <h4 className="font-bold">24/7 Support</h4>
              <p className="text-xs text-slate-400">Real-time emergency assistance and medical flight support.</p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">💬</div>
              <h4 className="font-bold">English First</h4>
              <p className="text-xs text-slate-400">All doctors are verified for fluent English communication.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
