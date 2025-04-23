import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Login from './components/Auth/login';
import Signup from './components/Auth/signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/Auth/PrivateRoute';
import Tasks from './pages/Tasks';
import { useState } from 'react';

function App() {
  const isAuthenticated = true;

  const [name,getName] = useState("User");
 
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
        <Route path="*" element={<Login />} /> {/* Default route to login */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard name={name}/> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tasks" 
          element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/routines" 
          element={isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/goals" 
          element={isAuthenticated ? <Navigate to="/login" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/habits" 
          element={isAuthenticated ? <Navigate to="/login" />: <Navigate to="/login" />} 
        />
        
        {/* Redirect to Dashboard name="{name}"if authenticated, otherwise to login */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  )
}

export default App


