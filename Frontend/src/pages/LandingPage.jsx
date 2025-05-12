import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Menu, X, Calendar, CheckCircle, Clock, BarChart3, Target, User, ChevronRight, Users, Bookmark, Star } from "lucide-react";
// Import dashboard and activity images
import dashboardImg from '../assets/ourdashboard.jpg';
import activityImg from '../assets/activity.jpg';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen overflow-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto pt-20 px-6">
        <HeroSection />
        <FeatureSection />
        <Workflow />
        <CollaborationSection />
        <CallToAction />
        <Footer />
      </main>
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Collaboration", href: "#collaboration" }
  ];

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-gray-100 bg-white/90 transition-all">
      <div className="container px-4 mx-auto relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 mr-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] rounded-md flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">
              RoutineMate
            </span>
          </div>
          <ul className="hidden lg:flex ml-14 space-x-10 text-gray-700">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="hover:text-[#4A2BAF] transition-all font-medium"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/login"
              className="py-2 px-4 border border-[#4A2BAF] text-[#4A2BAF] rounded-md hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="py-2 px-4 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md hover:shadow-md transition-all"
            >
              Get Started
            </Link>
          </div>
          <div className="lg:hidden">
            <button onClick={toggleNavbar}>
              {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileDrawerOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-white z-50 pt-20 pb-10 px-6 overflow-y-auto">
            <button onClick={toggleNavbar} className="absolute top-5 right-5">
              <X size={24} />
            </button>
            
            <ul className="flex flex-col space-y-6 text-center mb-8">
              {navItems.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.href} 
                    className="block text-xl font-medium py-2 hover:text-[#4A2BAF]" 
                    onClick={toggleNavbar}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col space-y-4 w-full">
              <Link
                to="/login"
                className="py-3 px-4 border border-[#4A2BAF] text-[#4A2BAF] rounded-md text-center"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="py-3 px-4 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="flex flex-col items-center mt-12 lg:mt-24 text-center px-4">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
      >
        Build Better{" "}
        <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
          Routines
        </span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-lg text-gray-600 max-w-3xl"
      >
        RoutineMate helps you organize your life, track your progress, and achieve your goals through smart routine building, task management, and habit tracking.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row justify-center mt-10 space-y-4 sm:space-y-0 sm:space-x-6"
      >
        <Link
          to="/signup"
          className="px-8 py-3 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg shadow-md hover:shadow-lg flex items-center justify-center"
        >
          Get Started Free <ChevronRight className="ml-2" size={18} />
        </Link>
        <a
          href="#features"
          className="px-8 py-3 bg-white border border-[#4A2BAF] text-[#4A2BAF] rounded-lg hover:bg-gray-50 flex items-center justify-center"
        >
          Explore Features
        </a>
      </motion.div>
    </section>
  );
};

// Feature Section Component
const FeatureSection = () => {
  const features = [
    {
      icon: <Calendar />,
      text: "Smart Scheduling",
      description: "Intelligently organize your day with AI-powered scheduling that works around your preferences."
    },
    {
      icon: <CheckCircle />,
      text: "Habit Tracking",
      description: "Create and maintain positive habits with reminders and streak tracking."
    },
    {
      icon: <Clock />,
      text: "Time Management",
      description: "Use focused work sessions and break reminders to maximize productivity and prevent burnout."
    },
    {
      icon: <BarChart3 />,
      text: "Analytics Dashboard",
      description: "Gain insights into your productivity trends with detailed reports and visualizations."
    },
    {
      icon: <Target />,
      text: "Goal Setting",
      description: "Set personal and group goals with milestones and track your progress visually."
    },
    {
      icon: <Users />,
      text: "Collaboration",
      description: "Connect with friends to share goals, celebrate achievements, and stay motivated together."
    }
  ];

  return (
    <section id="features" className="relative mt-24 border-b border-gray-200 pb-20">
      <div className="text-center">
        <span className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1 uppercase tracking-wide">
          Features
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 font-bold tracking-tight">
          What makes RoutineMate{" "}
          <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
            special
          </span>
        </h2>
        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          A comprehensive solution designed to transform how you manage your daily routines and achieve your goals.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.2 }}
        className="flex flex-wrap justify-center gap-8 mt-16"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full sm:w-5/12 lg:w-3/10 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 flex items-center justify-center bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full">
                {feature.icon}
              </div>
              <h5 className="ml-4 text-xl font-semibold">{feature.text}</h5>
            </div>
            <p className="text-md text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

// Workflow Component
const Workflow = () => {
  const checklistItems = [
    {
      title: "Plan Your Day",
      description: "Create daily routines and schedules that align with your productivity peaks."
    },
    {
      title: "Track Progress",
      description: "Monitor habit streaks and task completion with visual indicators."
    },
    {
      title: "Analyze Patterns",
      description: "Review performance reports to identify strengths and areas for improvement."
    },
    {
      title: "Adjust & Optimize",
      description: "Refine your routines based on data insights for continuous improvement."
    }
  ];

  return (
    <section id="workflow" className="mt-32 border-b border-gray-200 pb-20">
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center font-bold tracking-tight">
        Build your flow.{" "}
        <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
          Own your day.
        </span>
      </h2>

      <div className="flex flex-wrap justify-center items-center mt-16">
        {/* Dashboard Image Section */}
        <div className="w-full lg:w-1/2 p-4 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-lg shadow-xl w-full lg:w-5/6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A2BAF]/20 to-[#5D4EFF]/20 rounded-3xl transform rotate-3 scale-105"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-lg">
              <img 
                src={dashboardImg} 
                alt="RoutineMate Dashboard" 
                className="rounded-lg shadow w-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Checklist Section */}
        <div className="w-full lg:w-1/2 pt-12 px-4">
          {checklistItems.map((item, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start mb-10"
            >
              <div className="text-[#4A2BAF] bg-[#5D4EFF]/10 h-10 w-10 p-2 mr-4 rounded-full flex justify-center items-center shadow-sm">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="text-xl font-semibold mb-1">{item.title}</h5>
                <p className="text-md text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Collaboration Section Component
const CollaborationSection = () => {
  const collaborationFeatures = [
    {
      icon: <Users />,
      title: "Group Goals",
      description: "Create shared goals with friends, track collective progress, and stay motivated together."
    },
    {
      icon: <Bookmark />,
      title: "Memory Storage",
      description: "Save memories of reaching important goals for motivation and meaningful reflections."
    },
    {
      icon: <Star />,
      title: "Achievement Sharing",
      description: "Celebrate your wins with friends and get support when you need extra motivation."
    }
  ];

  return (
    <section id="collaboration" className="mt-32">
      <div className="text-center">
        <span className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1 uppercase tracking-wide">
          Collaboration
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 font-bold tracking-tight">
          Achieve
          <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
            {" "}together
          </span>
        </h2>
        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          Connect with friends to share goals, celebrate achievements, and stay motivated with RoutineMate's social features.
        </p>
      </div>

      <div className="flex flex-wrap justify-center mt-16 gap-6">
        {collaborationFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-full md:w-5/12 lg:w-3/10 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="mb-6 p-3 bg-[#5D4EFF]/10 w-14 h-14 rounded-full flex items-center justify-center text-[#4A2BAF]">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Capture your journey</h3>
            <p className="text-gray-600 mb-6">
              RoutineMate helps you document your growth, store memories of achievements, and build a visual history of your progress over time.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle2 className="text-[#4A2BAF] mr-2" />
                <span>Save photos of completed goals</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="text-[#4A2BAF] mr-2" />
                <span>Create motivational milestone memories</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="text-[#4A2BAF] mr-2" />
                <span>Share accomplishments with your network</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A2BAF]/20 to-[#5D4EFF]/20 rounded-xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-lg border border-gray-100 w-full overflow-hidden shadow-md">
                <img 
                  src={activityImg} 
                  alt="RoutineMate Activity" 
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Call To Action Component
const CallToAction = () => {
  return (
    <section className="mt-32 py-16 px-6 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] rounded-2xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to build better routines?</h2>
      <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
        Join thousands of users who are achieving their goals with RoutineMate's powerful tools.
      </p>
      <Link
        to="/signup"
        className="inline-block py-3 px-8 bg-white text-[#4A2BAF] rounded-lg font-medium text-lg hover:shadow-lg transition-shadow"
      >
        Get Started Free <ChevronRight className="inline ml-2" size={18} />
      </Link>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const resourcesLinks = [
    { text: "Blog", href: "#" },
    { text: "Guides", href: "#" },
    { text: "Help Center", href: "#" }
  ];

  const platformLinks = [
    { text: "Features", href: "#features" },
    { text: "Workflow", href: "#workflow" },
    { text: "Collaboration", href: "#collaboration" }
  ];

  const communityLinks = [
    { text: "Twitter", href: "#" },
    { text: "Instagram", href: "#" },
    { text: "Discord", href: "#" }
  ];

  return (
    <footer className="mt-20 border-t border-gray-200 py-10 text-gray-600">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center">
              <span className="text-white font-bold">R</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">RoutineMate</span>
          </div>
          <p className="text-sm leading-relaxed">
            Build better days, one routine at a time.
          </p>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Resources</h3>
          <ul className="space-y-2">
            {resourcesLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="hover:text-[#4A2BAF] transition-colors">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Platform</h3>
          <ul className="space-y-2">
            {platformLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="hover:text-[#4A2BAF] transition-colors">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Community */}
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-4">Community</h3>
          <ul className="space-y-2">
            {communityLinks.map((link, index) => (
              <li key={index}>
                <a href={link.href} className="hover:text-[#4A2BAF] transition-colors">
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 text-sm text-center text-gray-500">
        &copy; {new Date().getFullYear()} RoutineMate. All rights reserved.
      </div>
    </footer>
  );
};

export default LandingPage; 