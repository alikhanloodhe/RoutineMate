import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './My Components/Auth/login';
import Signup from './My Components/Auth/signup';
import Dashboard from './My Components/Dashboard';
import './My Components/Auth/Authform.css';
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Login />} /> {/* Default route to login */}
      </Routes>
    </Router>
  )
}

export default App
