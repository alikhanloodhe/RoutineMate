import React,{useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { motion } from 'framer-motion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Routines from './pages/Routines';
import Tasks from './pages/Tasks';
import GoalsPage from './pages/GoalsPage';
import GoalDetail from './pages/GoalDetail';
import GroupGoalDetail from './pages/GroupGoalDetail';
import HabitPage from './pages/HabitPage';
import Friends from './pages/Friends';
import Help from './pages/Help';
import ProfileSettings from './pages/ProfileSettings';
import Notifications from './pages/Notifications';
import Layout from './components/layout/Layout';
import { TimerProvider } from './context/TimerContext';
import PersistentTimer from './components/tasks/PersistentTimer';
import LandingPage from './pages/LandingPage';

// Loading component with animated logo
const LoadingScreen = () => {
  // Define animation variants for the logo parts
  const logoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50">
      <motion.div
        className="flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={logoVariants}
      >
        {/* Animated Logo */}
        <motion.div
          className="relative mb-8"
          animate="pulse"
          variants={pulseVariants}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <motion.circle 
              cx="60" 
              cy="60" 
              r="50" 
              stroke="#5D4EFF" 
              strokeWidth="4" 
              fill="none"
              initial="hidden"
              animate="visible"
              variants={pathVariants}
            />
            <motion.path 
              d="M40,60 L55,75 L80,45" 
              stroke="#4A2BAF" 
              strokeWidth="6" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { 
                  pathLength: 1, 
                  opacity: 1,
                  transition: { 
                    delay: 0.5,
                    duration: 1,
                    ease: "easeOut"
                  }
                }
              }}
            />
          </svg>
          
          {/* Animated glow effect */}
          <div className="absolute inset-0 rounded-full bg-[#5D4EFF]/20 blur-xl -z-10"></div>
        </motion.div>
        
        {/* Text */}
        <motion.h1 
          className="text-3xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          RoutineMate
        </motion.h1>
        
        <motion.div 
          className="flex items-center space-x-2 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="w-2 h-2 rounded-full bg-[#5D4EFF] animate-pulse"></div>
          <p className="text-gray-600">Loading your journey...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Public route component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Auth check route that redirects to login if token is invalid
const AuthCheckRoute = ({ element }) => {
  const { checkTokenValidity } = useAuth();
  
  useEffect(() => {
    // Check if token is valid, redirect will happen in AuthProvider if invalid
    checkTokenValidity();
  }, [checkTokenValidity]);
  
  return element;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TimerProvider> {/* would be able to work in all components */}
          <Router>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } 
              />

              {/* Landing page - visible to all */}
              <Route path="/landing" element={<LandingPage />} />
              
              {/* Protected routes with shared layout */}
              <Route element={
                <ProtectedRoute>
                  <AuthCheckRoute element={<Layout />} />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/routines" element={<Routines />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/goals/:goalId" element={<GoalDetail />} />
                <Route path="/group-goals/:goalId" element={<GroupGoalDetail />} />
                <Route path="/habits" element={<HabitPage />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/help" element={<Help />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/notifications" element={<Notifications />} />
              </Route>
              
              {/* Fallback routes */}
              <Route path="/" element={<Navigate to="/landing" replace />} />
              <Route path="*" element={<Navigate to="/landing" replace />} />
            </Routes>
            
            {/* PersistentTimer is outside of routes so it persists across navigation */}
            <PersistentTimer />
          </Router>
        </TimerProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
