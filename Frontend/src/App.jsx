import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Login from './components/Auth/login';
import Signup from './components/Auth/signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/Auth/PrivateRoute';
import TaskLayout from './pages/TaskLayout';
import VerifyEmail from './pages/verifyEmail';
import { useState } from 'react';

function App() {
  const [name,getName] = useState("User");

 console.log(name);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setName = {getName}/>} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard name={name}/>
              
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Login setName = {getName}/>} /> {/* Default route to login */}

        <Route 
          path="/tasks" 
          element={<TaskLayout />} 
        />
        <Route 
          path="/routines" 
          element={<Navigate to="/dashboard" />} 
        />
        <Route 
          path="/goals" 
          element={<Navigate to="/dashboard" />} 
        />
        <Route 
          path="/habits" 
          element={<Navigate to="/dashboard" />}  
        />
        
        {/* Redirect to Dashboard name="{name}"if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={<Login setName = {getName}/>} 
        />
        <Route path="/verify-email" element={<VerifyEmail />} />

      </Routes>
    </Router>
  )
}

export default App


