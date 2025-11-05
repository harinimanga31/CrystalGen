import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Target, 
  Cpu, 
  Shield, 
  ArrowRight,
  Sparkles,
  Database,
  BarChart3,
  Eye
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'Property-Driven Design',
      description: 'Generate crystals with specific band gaps, magnetic properties, and mechanical characteristics.'
    },
    {
      icon: Cpu,
      title: 'AI-Powered Generation',
      description: 'Advanced neural networks trained on vast crystal structure databases for accurate predictions.'
    },
    {
      icon: Shield,
      title: 'Stability Validation',
      description: 'Built-in thermodynamic and kinetic stability analysis for reliable material candidates.'
    },
    {
      icon: Database,
      title: 'Structure Database',
      description: 'Access to comprehensive crystal structure database with CIF import/export capabilities.'
    }
  ];

  const stats = [
    { label: 'Crystal Structures', value: '2.5M+' },
    { label: 'Property Predictions', value: '500K+' },
    { label: 'Symmetry Groups', value: '230' },
    { label: 'Active Users', value: '12K+' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2 text-blue-600 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Next-Generation Materials Discovery</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
            AI-Powered
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Crystal Generation
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover novel crystalline materials with tailored properties using advanced generative AI. 
            Design crystals with specific band gaps, magnetic characteristics, and structural constraints.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/generate"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Zap className="w-5 h-5" />
            <span>Start Generating</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/visualization"
            className="flex items-center space-x-2 bg-white text-slate-700 px-8 py-3 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <Eye className="w-5 h-5" />
            <span>View Structures</span>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Advanced Crystal Engineering
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Leverage cutting-edge AI to design materials with unprecedented precision and control.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to Discover New Materials?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join researchers worldwide using CrystalGen to accelerate materials discovery 
            and unlock the potential of AI-designed crystals.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;