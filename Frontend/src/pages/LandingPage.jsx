import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Menu, X, Calendar, CheckCircle, Clock, BarChart3, Target, User, ChevronRight, Users, Bookmark, Star, Award, Bell, Zap, TrendingUp, Settings, ArrowRight } from "lucide-react";
// Import dashboard and activity images
import dashboardImg from '../assets/ourdashboard.jpg';
import activityImg from '../assets/activity.jpg';

// Import graphics component (Computer Graphics concepts)
import { ParticleBackground } from '../components/graphics';

const LandingPage = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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

      {/* Scroll to top button */}
      {showScrollButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#4A2BAF] text-white flex items-center justify-center shadow-lg hover:bg-[#5D4EFF] transition-all z-50"
        >
          <ArrowRight className="transform rotate-270" />
        </motion.button>
      )}
    </div>
  );
};

// Navbar Component
const Navbar = () => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileDrawerOpen]);

  const toggleNavbar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Collaboration", href: "#collaboration" }
  ];

  return (
    <nav
      className={`sticky top-0 z-[100] py-3 backdrop-blur-lg transition-all duration-300 border-b ${scrolled ? "border-gray-200 bg-white/95 shadow-sm" : "border-transparent bg-white/80"
        }`}
    >
      <div className="container px-4 mx-auto relative">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="h-10 w-10 mr-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] rounded-md flex items-center justify-center shadow-md">
              <Calendar className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">
              RoutineMate
            </span>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:flex ml-14 space-x-10 text-gray-700"
          >
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="hover:text-[#4A2BAF] transition-all font-medium relative group"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector(item.href).scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A2BAF] transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex items-center space-x-4"
          >
            <Link
              to="/login"
              className="py-2 px-4 border border-[#4A2BAF] text-[#4A2BAF] rounded-md hover:bg-[#4A2BAF]/5 transition-all"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="py-2 px-4 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md hover:shadow-md transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </motion.div>

          <div className="lg:hidden relative z-[110]">
            <button
              onClick={toggleNavbar}
              className="w-10 h-10 relative focus:outline-none rounded-md flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col justify-between items-center">
                <span
                  className={`bg-[#4A2BAF] block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${mobileDrawerOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                    }`}
                ></span>
                <span
                  className={`bg-[#4A2BAF] block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm my-0.5 ${mobileDrawerOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                ></span>
                <span
                  className={`bg-[#4A2BAF] block transition-all duration-300 ease-out h-0.5 w-5 rounded-sm ${mobileDrawerOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                    }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Backdrop Overlay */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[101]"
            onClick={toggleNavbar}
          ></div>
        )}

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 right-0 w-[75%] max-w-xs h-screen bg-white z-[102] shadow-xl transition-transform duration-300 ease-in-out transform ${mobileDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            } overflow-y-auto`}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-4">
              <button
                onClick={toggleNavbar}
                className="p-2 rounded-full text-[#4A2BAF] hover:bg-[#4A2BAF]/5 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center justify-center mb-8 mt-2">
              <div className="h-12 w-12 mr-3 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] rounded-md flex items-center justify-center shadow-md">
                <Calendar className="text-white" size={26} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">
                RoutineMate
              </span>
            </div>

            <div className="px-6 flex-1">
              <ul className="flex flex-col space-y-4">
                {navItems.map((item, index) => (
                  <li
                    key={index}
                    className="border-b border-gray-100 pb-3"
                  >
                    <a
                      href={item.href}
                      className="flex items-center text-lg font-medium py-2 text-gray-800 hover:text-[#4A2BAF] transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(item.href).scrollIntoView({ behavior: 'smooth' });
                        toggleNavbar();
                      }}
                    >
                      {item.label}
                      <ChevronRight className="ml-auto" size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100">
              <div className="flex flex-col space-y-4 w-full">
                <Link
                  to="/login"
                  className="py-3 px-4 border border-[#4A2BAF] text-[#4A2BAF] rounded-md text-center block font-medium transition-colors hover:bg-[#4A2BAF]/5"
                  onClick={toggleNavbar}
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="py-3 px-4 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-md text-center block font-medium transition-all hover:opacity-90"
                  onClick={toggleNavbar}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="flex flex-col items-center pt-8 lg:pt-16 text-center px-4 pb-16 relative overflow-hidden min-h-[500px]">
      {/* Animated Particle Background - Computer Graphics: 2D rendering, particle systems */}
      <div className="absolute inset-0 w-full h-full" style={{ minHeight: '500px' }}>
        <ParticleBackground
          particleCount={60}
          interactive={true}
          showConnections={true}
        />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-4 py-1.5 mb-6 relative z-10"
      >
        Your Personal Productivity Assistant
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight relative z-10"
      >
        Build Better{" "}
        <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
          Routines
        </span>{" "}
        <br className="hidden sm:block" />
        Achieve More{" "}
        <span className="bg-gradient-to-r from-[#5D4EFF] to-[#4A2BAF] text-transparent bg-clip-text">
          Together
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl relative z-10"
      >
        RoutineMate helps you organize your life, track your progress, and achieve your goals
        through smart routine building, task management, and habit tracking with AI-powered insights.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row justify-center mt-10 space-y-4 sm:space-y-0 sm:space-x-6 relative z-10"
      >
        <Link
          to="/signup"
          className="px-8 py-3.5 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white font-medium rounded-lg shadow-md hover:shadow-lg flex items-center justify-center transform transition-all hover:scale-105"
        >
          Get Started Free <ChevronRight className="ml-2" size={18} />
        </Link>
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            document.querySelector('#features').scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-8 py-3.5 bg-white border border-[#4A2BAF] text-[#4A2BAF] rounded-lg hover:bg-[#4A2BAF]/5 flex items-center justify-center transition-all"
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
      description: "Intelligently organize your day with AI-powered scheduling that works around your preferences and peak productivity times."
    },
    {
      icon: <CheckCircle />,
      text: "Habit Tracking",
      description: "Create and maintain positive habits with reminders, streak tracking, and visual progress indicators that motivate consistency."
    },
    {
      icon: <Clock />,
      text: "Time Management",
      description: "Use focused work sessions and break reminders to maximize productivity and prevent burnout with our Pomodoro-inspired system."
    },
    {
      icon: <BarChart3 />,
      text: "Analytics Dashboard",
      description: "Gain insights into your productivity trends with detailed reports and visualizations that help optimize your routines."
    },
    {
      icon: <Target />,
      text: "Goal Setting",
      description: "Set personal and group goals with milestones, deadlines, and track your progress visually with completion metrics."
    },
    {
      icon: <Users />,
      text: "Collaboration",
      description: "Connect with friends to share goals, celebrate achievements, and stay motivated together through our social features."
    }
  ];

  return (
    <section id="features" className="relative mt-24 border-b border-gray-200 pb-20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#5D4EFF]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4A2BAF]/5 rounded-full blur-3xl -z-10"></div>

      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1 uppercase tracking-wide"
        >
          Features
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl mt-6 font-bold tracking-tight"
        >
          What makes RoutineMate{" "}
          <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
            special
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg"
        >
          A comprehensive solution designed to transform how you manage your daily routines
          and achieve your goals with AI-powered insights and social motivation.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 group"
          >
            <div className="h-14 w-14 flex items-center justify-center bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-xl mb-6 group-hover:bg-[#4A2BAF] group-hover:text-white transition-all">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-[#4A2BAF] transition-all">{feature.text}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* New section - AI Assistant teaser
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20 bg-gradient-to-r from-[#4A2BAF]/5 to-[#5D4EFF]/5 rounded-2xl p-8 border border-[#5D4EFF]/20"
      >
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
            <div className="inline-block mb-4 bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1">
              AI-Powered Assistance
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Let AI help optimize your day</h3>
            <p className="text-gray-600 mb-6">
              RoutineMate's AI assistant analyzes your tasks, habits, and routines to suggest the most efficient 
              schedule. It identifies patterns in your productivity and helps you make better decisions about when and how to work.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center">
                <div className="mr-3 bg-[#5D4EFF]/10 p-1 rounded-full">
                  <CheckCircle2 className="text-[#4A2BAF]" size={18} />
                </div>
                <span>Smart scheduling based on your productivity patterns</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 bg-[#5D4EFF]/10 p-1 rounded-full">
                  <CheckCircle2 className="text-[#4A2BAF]" size={18} />
                </div>
                <span>Deadline-aware task prioritization</span>
              </li>
              <li className="flex items-center">
                <div className="mr-3 bg-[#5D4EFF]/10 p-1 rounded-full">
                  <CheckCircle2 className="text-[#4A2BAF]" size={18} />
                </div>
                <span>Personalized habit building recommendations</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A2BAF]/20 to-[#5D4EFF]/20 rounded-xl transform rotate-3 scale-105"></div>
            <div className="relative p-6 bg-white rounded-xl shadow-lg">
              <div className="bg-[#F9F9FF] p-4 rounded-lg border border-[#5D4EFF]/20">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#4A2BAF] text-white flex items-center justify-center mr-3">
                    <Settings size={16} />
                  </div>
                  <div className="font-medium">RoutineMate AI Assistant</div>
                </div>
                <div className="space-y-3 ml-11">
                  <p className="p-3 bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                    Good morning! Based on your calendar, I've optimized your schedule.
                    Your high-priority task is due at 3PM, so I've scheduled focused work time at 11AM when you're most productive.
                  </p>
                  <p className="p-3 bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                    Don't forget your workout habit - you've maintained a 7-day streak! 
                    I've added it at 5PM, your preferred exercise time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div> */}
    </section>
  );
};

// Workflow Component
const Workflow = () => {
  const checklistItems = [
    {
      title: "Plan Your Day",
      description: "Create daily routines and schedules that align with your productivity peaks and energy levels for optimal performance."
    },
    {
      title: "Track Progress",
      description: "Monitor habit streaks and task completion with visual indicators and get motivated by your ongoing achievements."
    },
    {
      title: "Set & Achieve Goals",
      description: "Break down large goals into manageable milestones and track your progress with deadlines and completion metrics."
    },
    {
      title: "Analyze Patterns",
      description: "Review performance reports to identify strengths and areas for improvement with AI-powered insights."
    },
    {
      title: "Adjust & Optimize",
      description: "Refine your routines based on data insights for continuous improvement and sustained productivity growth."
    }
  ];

  return (
    <section id="workflow" className="mt-32 border-b border-gray-200 pb-20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -left-20 top-1/4 w-40 h-40 rounded-full bg-[#4A2BAF]/5 blur-3xl"></div>
      <div className="absolute right-0 bottom-20 w-60 h-60 rounded-full bg-[#5D4EFF]/5 blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1 uppercase tracking-wide">
          Your Workflow
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-6 font-bold tracking-tight">
          Build your flow.{" "}
          <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
            Own your day.
          </span>
        </h2>
        <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg">
          RoutineMate's intuitive system helps you create a personalized workflow
          that maximizes productivity and reduces stress through smart organization.
        </p>
      </motion.div>

      <div className="flex flex-col-reverse lg:flex-row justify-center items-center gap-12 lg:gap-8">
        {/* Checklist Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-1/2 space-y-8"
        >
          {checklistItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start group"
            >
              <div className="shrink-0 bg-[#5D4EFF]/10 text-[#4A2BAF] h-12 w-12 p-3 mr-5 rounded-full flex justify-center items-center shadow-sm group-hover:bg-[#4A2BAF] group-hover:text-white transition-all">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="text-xl font-semibold mb-2 group-hover:text-[#4A2BAF] transition-all">{item.title}</h5>
                <p className="text-md text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}

          <div className="pl-16 pt-4">
            <Link
              to="/signup"
              className="inline-flex items-center text-[#4A2BAF] font-medium hover:text-[#5D4EFF] transition-colors"
            >
              Start building your workflow <ChevronRight className="ml-1" size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Dashboard Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full lg:w-1/2 flex justify-center"
        >
          <div className="rounded-lg w-full max-w-lg relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A2BAF]/20 to-[#5D4EFF]/20 rounded-3xl transform rotate-3 scale-105"></div>
            <div className="relative bg-white p-6 rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <img
                src={dashboardImg}
                alt="RoutineMate Dashboard"
                className="rounded-lg shadow-sm w-full object-cover"
              />

              {/* Floating badges */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-lg shadow-md p-3 flex items-center border border-gray-100">
                <div className="bg-green-100 text-green-600 p-1 rounded-md mr-2">
                  <CheckCircle size={16} />
                </div>
                <span className="text-sm font-medium">Task completed</span>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white rounded-lg shadow-md p-3 flex items-center border border-gray-100">
                <div className="bg-blue-100 text-blue-600 p-1 rounded-md mr-2">
                  <Bell size={16} />
                </div>
                <span className="text-sm font-medium">Routine reminder</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature highlight box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#5D4EFF]/10 flex items-center justify-center text-[#4A2BAF] mb-5">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Task Management</h3>
          <p className="text-gray-600">Organize tasks with deadlines, subtasks, and priority levels. Track completion and stay on top of your commitments.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#5D4EFF]/10 flex items-center justify-center text-[#4A2BAF] mb-5">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Routine Building</h3>
          <p className="text-gray-600">Create consistent daily routines that automate your schedule and help you maintain productivity throughout the day.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-lg bg-[#5D4EFF]/10 flex items-center justify-center text-[#4A2BAF] mb-5">
            <Award size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2">Achievement System</h3>
          <p className="text-gray-600">Earn achievements, maintain streaks, and celebrate your wins with a system designed to keep you motivated.</p>
        </div>
      </motion.div>
    </section>
  );
};

// Collaboration Section Component
const CollaborationSection = () => {
  const collaborationFeatures = [
    {
      icon: <Users />,
      title: "Group Goals",
      description: "Create shared goals with friends, track collective progress, and stay motivated together through real-time updates and notifications."
    },
    {
      icon: <Bookmark />,
      title: "Memory Storage",
      description: "Save photos and memories of reaching important goals for motivation, creating a visual journey of your achievements over time."
    },
    {
      icon: <Star />,
      title: "Achievement Sharing",
      description: "Celebrate your wins with friends and get support when you need extra motivation with likes, comments, and encouraging messages."
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      content: "RoutineMate has completely transformed how our team tracks goals. The collaboration features make accountability fun rather than stressful!",
      author: "Sarah J.",
      role: "Marketing Team Lead"
    },
    {
      content: "I've tried many productivity apps, but the social aspect of RoutineMate keeps me consistent. Sharing progress with friends makes all the difference.",
      author: "Michael T.",
      role: "Software Developer"
    },
    {
      content: "The memory feature is brilliant! Looking back at my completed goals gives me motivation when I'm facing new challenges.",
      author: "Emma R.",
      role: "Fitness Coach"
    }
  ];

  return (
    <section id="collaboration" className="mt-32 pb-10 relative">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#4A2BAF]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 left-10 w-60 h-60 bg-[#5D4EFF]/5 rounded-full blur-3xl -z-10"></div>

      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#5D4EFF]/10 text-[#5D4EFF] rounded-full text-sm font-medium px-3 py-1 uppercase tracking-wide"
        >
          Collaboration
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl mt-6 font-bold tracking-tight"
        >
          Achieve
          <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-transparent bg-clip-text">
            {" "}together
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg"
        >
          Connect with friends to share goals, celebrate achievements, and stay motivated
          with RoutineMate's powerful social and collaboration features.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        {collaborationFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="mb-6 p-4 bg-[#5D4EFF]/10 w-16 h-16 rounded-xl flex items-center justify-center text-[#4A2BAF]">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20 bg-white rounded-xl p-8 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Capture your journey</h3>
            <p className="text-gray-600 mb-6">
              RoutineMate helps you document your growth, store memories of achievements,
              and build a visual history of your progress over time. Share milestones with
              your network for added motivation and celebration.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-[#5D4EFF]/10 flex items-center justify-center">
                  <CheckCircle2 className="text-[#4A2BAF]" size={16} />
                </div>
                <div>
                  <span className="font-medium block mb-1">Save photos of completed goals</span>
                  <span className="text-sm text-gray-500">Create a visual record of your achievements to reflect on later</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-[#5D4EFF]/10 flex items-center justify-center">
                  <CheckCircle2 className="text-[#4A2BAF]" size={16} />
                </div>
                <div>
                  <span className="font-medium block mb-1">Create motivational milestone memories</span>
                  <span className="text-sm text-gray-500">Mark important achievements with special entries in your journey</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 h-6 w-6 rounded-full bg-[#5D4EFF]/10 flex items-center justify-center">
                  <CheckCircle2 className="text-[#4A2BAF]" size={16} />
                </div>
                <div>
                  <span className="font-medium block mb-1">Share accomplishments with your network</span>
                  <span className="text-sm text-gray-500">Get likes, comments and support from friends on your progress</span>
                </div>
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

                {/* Social interaction overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="text-white">
                    <div className="text-sm opacity-90 mb-1">Goal Completed</div>
                    <div className="font-medium mb-2">Finished my first 5K marathon! 🏃‍♂️</div>
                    <div className="flex items-center text-xs opacity-80">
                      <span className="mr-3">❤️ 24 likes</span>
                      <span>💬 8 comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Testimonials section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-24"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">What our users say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
            >
              <div className="absolute -top-3 left-6 text-4xl text-[#4A2BAF]/20">"</div>
              <p className="mb-6 text-gray-700 relative z-10 pt-3">{testimonial.content}</p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-[#5D4EFF]/10 text-[#4A2BAF] flex items-center justify-center mr-3">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div> */}
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