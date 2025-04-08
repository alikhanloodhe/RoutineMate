import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate(); // for redirection

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (login process)
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Use formData directly
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token); // Save JWT token for later use
        alert('Login Successful');
        navigate('/dashboard'); // Redirect to dashboard on success
      } else {
        alert(data.message); // Show error message from backend
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login Failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to RoutineMate</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/signup">Create one</a></p>
    </div>
  );
};

export default Login;
