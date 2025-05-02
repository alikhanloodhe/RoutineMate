import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/Dashboard';
import Routines from './pages/Routines';
import Tasks from './pages/Tasks';
import Goals from './pages/Goals';
import HabitPage from './pages/HabitPage';
import Friends from './pages/Friends';
import Help from './pages/Help';

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
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/routines" element={
          <ProtectedRoute>
            <Routines />
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } />
        
        <Route path="/goals" element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        } />
        
        <Route path="/habits" element={
          <ProtectedRoute>
            <HabitPage />
          </ProtectedRoute>
        } />
        
        <Route path="/friends" element={
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
