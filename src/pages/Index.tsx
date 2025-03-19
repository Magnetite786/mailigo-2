import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Send,
  Zap,
  BarChart3,
  BrainCircuit,
  Users, 
  Clock, 
  Shield,
  CheckCircle, 
  ArrowRight,
  TestTube2,
  UserRound,
  AlarmCheck,
  FileText,
  Star,
  MessageSquare,
  LineChart,
  PieChart,
  Target,
  TrendingUp,
  Menu,
  X,
  PlayCircle,
  BarChart,
  Sparkles,
  Brain,
  Rocket,
  MessageCircle,
  Calendar,
  BarChart4,
  ArrowUpRight,
  Users2,
  Gauge,
  Megaphone,
  Globe2,
  ChevronRight,
  Code2,
  Laptop,
  Layers,
  Settings,
  Workflow,
  Edit,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { AITechnologyShowcase } from "@/components/AITechnologyShowcase";

  const features = [
    {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: "AI-Powered Optimization",
    description: "Smart content suggestions and subject line optimization using advanced AI algorithms",
  },
  {
    icon: <TestTube2 className="h-6 w-6" />,
    title: "A/B Testing",
    description: "Test different email variants to maximize engagement and conversion rates",
  },
  {
    icon: <UserRound className="h-6 w-6" />,
    title: "Smart Personalization",
    description: "Dynamic content personalization that adapts to each recipient",
  },
  {
    icon: <AlarmCheck className="h-6 w-6" />,
    title: "Intelligent Scheduling",
    description: "AI-driven send time optimization for maximum impact",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Advanced Analytics",
    description: "Detailed insights and performance metrics to track campaign success",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Template Management",
    description: "Create and manage reusable email templates with ease",
  },
];

const stats = [
  { value: "99.9%", label: "Delivery Rate" },
  { value: "2M+", label: "Emails Sent" },
  { value: "50K+", label: "Happy Users" },
  { value: "24/7", label: "Support" },
];

const testimonials = [
  {
    quote: "MailiGo has transformed our email marketing strategy. The AI features are game-changing!",
    author: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
  },
  {
    quote: "The analytics and A/B testing capabilities have helped us increase our open rates by 45%.",
    author: "Michael Chen",
    role: "Growth Lead",
    company: "StartupX",
  },
  {
    quote: "Best email marketing platform we've used. The personalization features are incredible.",
    author: "Emma Davis",
    role: "CEO",
    company: "CreativeHub",
    },
  ];

  const pricingPlans = [
    {
    name: "Starter",
    price: "$29",
      features: [
      "Up to 10,000 emails/month",
      "Basic AI suggestions",
      "Email templates",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "$79",
      features: [
      "Up to 50,000 emails/month",
      "Advanced AI features",
      "A/B testing",
        "Priority support",
      ],
      cta: "Get Started",
      popular: true,
    },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited emails",
      "Custom AI models",
      "Dedicated support",
      "API access",
    ],
    cta: "Contact Sales",
  },
];

const chartData = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  openRates: [65, 72, 84, 78, 88, 92],
  clickRates: [32, 38, 45, 40, 42, 45],
};

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Add smooth scroll functionality
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated) {
      const loginBtn = document.getElementById('login-btn');
      const signupBtn = document.getElementById('signup-btn');
      if (loginBtn) loginBtn.style.display = 'none';
      if (signupBtn) signupBtn.style.display = 'none';
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              MailiGo
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Testimonials
            </button>
            <Link 
              to="/templates" 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Template Gallery
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-purple-600"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  variant="default"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
              </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-36 pb-20 px-4 relative overflow-hidden bg-gradient-to-b from-white to-purple-50/50">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
          opacity: 0.5
        }} />
        
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 lg:pr-12 mt-4"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-2"
                >
                  <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium border border-purple-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Next-Gen Email Marketing
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-gray-900"
                >
                  Transform Your{" "}
                  <span className="relative">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                      Email Marketing
                    </span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 424 18" fill="none">
                      <path d="M2 16C75.3333 9.33333 222.8 -4.00001 422 16" stroke="url(#paint0_linear)" strokeWidth="4" strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="paint0_linear" x1="2" y1="16" x2="422" y2="16" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#7C3AED"/>
                          <stop offset="0.5" stopColor="#8B5CF6"/>
                          <stop offset="1" stopColor="#6366F1"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  {" "}with AI-Powered Intelligence
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-gray-600 max-w-xl leading-relaxed"
                >
                  Experience the future of email marketing with our AI-driven platform. Create, optimize, and deliver high-performing campaigns with unprecedented precision and results.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 font-medium rounded-full"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 font-medium rounded-full"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Interactive Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative h-[460px] lg:h-[500px] w-full max-w-[960px] mx-auto lg:-mr-20 lg:-ml-4 mt-4"
            >
              {/* Main Dashboard Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-purple-200/50 overflow-hidden border border-purple-100 h-full">
                {/* Dashboard Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white/95">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Advanced Marketing Analytics</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-full">
                      <Globe2 className="h-3.5 w-3.5 text-purple-600" />
                      <span className="text-xs text-purple-600">Live Data</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">Last 30 days</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-3 space-y-3">
                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-4 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-purple-600" />
                        <span className="text-xs text-gray-600">Sent</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">124,892</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        +12.5%
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users2 className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-gray-600">Opens</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">92%</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        +8.3%
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-600">Conversions</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">45.8%</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        +15.2%
                      </div>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="h-4 w-4 text-orange-600" />
                        <span className="text-xs text-gray-600">Engagement</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">87.3%</div>
                      <div className="text-xs text-green-600 flex items-center">
                        <ArrowUpRight className="h-3 w-3" />
                        +5.7%
                    </div>
                    </motion.div>
                  </div>

                  {/* Main Analytics Grid */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Performance Chart - 8 columns */}
                    <div className="col-span-8 bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Campaign Performance</h4>
                          <p className="text-xs text-gray-500">Engagement metrics over time</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-xs text-gray-600">Opens</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-xs text-gray-600">Clicks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-gray-600">Conversions</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-[200px] relative">
                        {/* Enhanced Chart with Multiple Metrics */}
                        <motion.svg
                          className="w-full h-full"
                          viewBox="0 0 300 100"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        >
                          {/* Purple Line (Opens) */}
                          <path
                            d="M0 80 Q75 70, 150 40 T300 20"
                            fill="none"
                            stroke="url(#purple-gradient)"
                            strokeWidth="2"
                          />
                          {/* Blue Line (Clicks) */}
                          <path
                            d="M0 90 Q75 85, 150 60 T300 50"
                            fill="none"
                            stroke="url(#blue-gradient)"
                            strokeWidth="2"
                          />
                          {/* Green Line (Conversions) */}
                          <path
                            d="M0 95 Q75 90, 150 80 T300 70"
                            fill="none"
                            stroke="url(#green-gradient)"
                            strokeWidth="2"
                          />
                          <defs>
                            <linearGradient id="purple-gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#9333EA" />
                              <stop offset="100%" stopColor="#7C3AED" />
                            </linearGradient>
                            <linearGradient id="blue-gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#2563EB" />
                            </linearGradient>
                            <linearGradient id="green-gradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </motion.svg>
                        {/* Grid Lines */}
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className="border-r border-t border-gray-100" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Audience Insights - 4 columns */}
                    <div className="col-span-4 space-y-3">
                      {/* Engagement by Device */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Audience Engagement</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Mobile</span>
                            <span className="text-xs font-medium text-gray-900">68%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: "68%" }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Desktop</span>
                            <span className="text-xs font-medium text-gray-900">24%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "24%" }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Tablet</span>
                            <span className="text-xs font-medium text-gray-900">8%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: "8%" }} />
                          </div>
                        </div>
                      </div>

                      {/* Geographic Distribution */}
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Locations</h4>
                    <div className="space-y-2">
                          {[
                            { country: "United States", percentage: 35 },
                            { country: "United Kingdom", percentage: 25 },
                            { country: "Germany", percentage: 20 },
                            { country: "India", percentage: 15 },
                          ].map((location, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">{location.country}</span>
                              <span className="text-xs font-medium text-gray-900">{location.percentage}%</span>
                            </div>
                          ))}
                        </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Floating Element - Updated Text */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-3 -right-3 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2"
              >
                <div className="bg-purple-500 rounded-full p-1">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                <div>
                  <div className="text-xs font-medium">Performance</div>
                  <div className="text-sm text-purple-500 font-bold">Excellent</div>
                </div>
              </motion.div>
            </motion.div>
              </div>
            </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="mt-2 text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* New Section: Advanced Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Advanced Features for Modern Marketing
              </h2>
              <div className="space-y-6">
                {[
                  {
                    title: "Smart Segmentation",
                    description: "Target your audience with precision using AI-powered segmentation",
                    icon: <Users2 className="h-5 w-5 text-blue-600" />
                  },
                  {
                    title: "Automated Workflows",
                    description: "Create sophisticated email sequences that convert",
                    icon: <Workflow className="h-5 w-5 text-blue-600" />
                  },
                  {
                    title: "Real-time Analytics",
                    description: "Track and optimize your campaigns with detailed insights",
                    icon: <BarChart3 className="h-5 w-5 text-blue-600" />
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1 bg-blue-50 rounded-lg p-2">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-8 relative z-10">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: "Open Rate", value: "45%", trend: "+12%" },
                    { label: "Click Rate", value: "28%", trend: "+8%" },
                    { label: "Conversion", value: "12%", trend: "+15%" },
                    { label: "ROI", value: "350%", trend: "+25%" }
                  ].map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl p-4 shadow-sm"
                    >
                      <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-green-600 flex items-center gap-1">
                        <ArrowUpRight className="h-4 w-4" />
                        {stat.trend}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-2xl transform rotate-3" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Features That Set Us Apart
            </h2>
            <p className="text-lg text-gray-600">
              Leverage AI and automation to transform your email marketing
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                  {feature.icon}
                  </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* AI Technology Showcase */}
      <AITechnologyShowcase />

      {/* AI-Powered Intelligence Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Intelligence
            </h2>
            <p className="text-lg text-gray-600">
              Our platform uses advanced AI algorithms to optimize every aspect of your email campaigns
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Subject Lines
              </h3>
              <p className="text-gray-600 mb-4">
                AI analyzes your audience and optimizes subject lines for maximum open rates.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Original</span>
                  <span className="text-xs text-gray-400">45% open rate</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  "March Newsletter Update"
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600">AI Optimized</span>
                  <span className="text-xs text-green-500">92% open rate</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  "Unlock Your March Success Story 🚀"
              </p>
            </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white mb-4">
                <UserRound className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dynamic Personalization
              </h3>
              <p className="text-gray-600 mb-4">
                Create hyper-personalized content that resonates with each recipient.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Name Personalization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Behavior-based Content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Dynamic Offers</span>
                  </div>
                </div>
            </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center text-white mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Send-Time Optimization
              </h3>
              <p className="text-gray-600 mb-4">
                AI determines the perfect time to send emails for each recipient.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Best Time</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">9:30 AM</span>
                </div>
                <div className="h-16 flex items-end gap-1">
                  {[20, 45, 80, 60, 30, 70, 40].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-pink-200 to-pink-500"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
            </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* New Section: Email Health Score Predictor */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B5CF6' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: "60px 60px",
          opacity: 0.5
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-sm text-purple-600 mb-4"
            >
              <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse mr-2"></span>
              Exclusive Feature
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              Email Health Score™ Predictor
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600"
            >
              Analyze your emails before sending to predict performance, improve deliverability, and maximize engagement
            </motion.p>
          </div>
          
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-5 space-y-8"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-purple-600" />
                  Comprehensive Email Analysis
                </h3>
                <p className="text-gray-600">
                  Our unique Email Health Score™ analyzes every aspect of your email before sending, predicting performance and identifying improvement areas to ensure maximum impact.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Avoid Spam Filters & Improve Deliverability
                </h3>
                <p className="text-gray-600">
                  Get detailed insights on potential deliverability issues before you send. Our system detects spam triggers, problematic content patterns, and other factors that could affect inbox placement.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Predict Audience Engagement
                </h3>
                <p className="text-gray-600">
                  See predicted open rates, click rates, and overall engagement before sending a single email. Make data-driven decisions to optimize your content for maximum results.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  Actionable Improvement Suggestions
                </h3>
                <p className="text-gray-600">
                  Receive specific, actionable suggestions to improve your email's performance across content quality, subject line optimization, timing, and more.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="md:col-span-7 relative"
            >
              {/* Email Health Score Preview */}
              <div className="rounded-xl bg-white shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 border-b">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-white" />
                    <h2 className="text-lg font-bold text-white">Email Health Score Predictor</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <div className="w-full h-full rounded-full flex items-center justify-center border-8 border-emerald-200">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">87</div>
                          <div className="text-gray-500 text-xs">Health Score</div>
                        </div>
                      </div>
                      <svg className="absolute inset-0" width="128" height="128" viewBox="0 0 128 128">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="6"
                          strokeDasharray="365"
                          strokeDashoffset="47"
                          transform="rotate(-90, 64, 64)"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {["Content", "Subject", "Deliverability", "Timing", "Engagement"].map((category, index) => (
                      <div key={category} className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                          <div 
                            className="h-1.5 rounded-full bg-emerald-500"
                            style={{ width: `${index === 2 ? '95' : index === 3 ? '75' : index === 4 ? '85' : '90'}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">{category}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-xs text-gray-500">Opens</div>
                      <div className="text-sm font-medium text-gray-900">92%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-xs text-gray-500">Clicks</div>
                      <div className="text-sm font-medium text-gray-900">38%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="text-xs text-gray-500">Spam Risk</div>
                      <div className="text-sm font-medium text-gray-900">Low</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-100">
                          <Shield className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900">Deliverability</h4>
                      </div>
                      <div className="text-base font-bold text-emerald-600">95</div>
                    </div>
                    <div className="p-3 bg-gray-50 text-xs">
                      <div className="flex items-start gap-1.5 text-gray-600">
                        <CheckCircle className="h-3.5 w-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>Your email has excellent deliverability characteristics</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-sm"
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-purple-600 text-white text-sm"
                    >
                      Apply Suggestions
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 bg-purple-500/10 h-24 w-24 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 bg-indigo-500/10 h-32 w-32 rounded-full blur-2xl"></div>
            </motion.div>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: <Edit className="h-5 w-5" />,
                title: "Content Analysis",
                description: "Evaluates readability, spam triggers, and engagement factors"
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Subject Line Scoring",
                description: "Tests subject line strength and provides improvement suggestions"
              },
              {
                icon: <Clock className="h-5 w-5" />,
                title: "Timing Optimizer",
                description: "Suggests the best day and time to send for your audience"
              },
              {
                icon: <AlertCircle className="h-5 w-5" />,
                title: "Compliance Check",
                description: "Ensures your emails meet legal and technical requirements"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8"
            >
              Try Email Health Score Predictor
            </Button>
          </motion.div>
        </div>
      </section>
      
      {/* New Integration Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Seamless Integrations
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Connect with your favorite tools and automate your workflow
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Slack', 'HubSpot', 'Salesforce', 'Zapier'].map((integration, index) => (
              <motion.div
                key={integration}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {integration[0]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{integration}</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Integrate with {integration} to streamline your workflow
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400">Features</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Pricing</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Security</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400">Documentation</Link></li>
                <li><Link to="#" className="hover:text-blue-400">API Reference</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Blog</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Guides</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400">About</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Careers</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Contact</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="#" className="hover:text-blue-400">Privacy</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Terms</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Security</Link></li>
                <li><Link to="#" className="hover:text-blue-400">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <Mail className="h-6 w-6 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-white">MailiGo</span>
              </div>
              <div className="text-sm">
                <p>© 2024 MailiGo. All rights reserved.</p>
                <p className="mt-1 text-gray-400">Developed with ❤️ by Pravin Boopathi</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* New Section: Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how leading companies achieve remarkable results with MailiGo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: "TechCorp",
                metric: "2.5x",
                result: "Increase in Email Engagement",
                description: "Achieved record-breaking open rates with AI-optimized subject lines",
                logo: "TC"
              },
              {
                company: "GrowthX",
                metric: "45%",
                result: "Higher Conversion Rate",
                description: "Boosted sales through personalized email sequences",
                logo: "GX"
              },
              {
                company: "ScaleUp",
                metric: "12hrs",
                result: "Saved Per Week",
                description: "Automated email workflows reduced manual work significantly",
                logo: "SU"
              }
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-6 text-lg font-bold">
                  {story.logo}
                </div>
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {story.metric}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {story.result}
                  </div>
                  <p className="text-gray-600">
                    {story.description}
                  </p>
                  <div className="text-sm font-medium text-gray-900">
                    {story.company}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
