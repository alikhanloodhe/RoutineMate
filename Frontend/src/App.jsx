import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Layout from './components/layout/Layout';
import { TimerProvider } from './context/TimerContext';
import PersistentTimer from './components/tasks/PersistentTimer';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <TimerProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
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
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        
        {/* PersistentTimer is outside of routes so it persists across navigation */}
        <PersistentTimer />
      </Router>
    </TimerProvider>
  );
}

export default App;
