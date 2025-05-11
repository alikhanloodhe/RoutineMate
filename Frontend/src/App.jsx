import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import Layout from './components/layout/Layout';
import { TimerProvider } from './context/TimerContext';
import PersistentTimer from './components/tasks/PersistentTimer';

// Loading component
const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-[#FAF3E0]">
    <div className="text-center">
      <div className="w-16 h-16 border-t-4 border-b-4 border-[#5D4EFF] rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg text-gray-700">Loading RoutineMate...</p>
    </div>
  </div>
);

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
    return <Navigate to="/dashboard" />;
  }
  
  return children;
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
              
              {/* Protected routes with shared layout */}
              <Route element={
                <ProtectedRoute>
                  <Layout />
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
              </Route>
              
              {/* Fallback routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
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
