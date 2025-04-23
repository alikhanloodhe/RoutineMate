import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Authform.css';
  const Login = ({setName}) => {
  const [formData, setFormData] = useState({ email: '', password: '' }); // React Hooks by default formData is "". changed when setFormData is called.
  
  const navigate = useNavigate(); // for redirection

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (login process)
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, { // send the formData using POST method and receives the response in res variable
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Use formData directly
      });

      const data = await res.json(); // get the res json data in data variable

      if (res.ok) {
        localStorage.setItem('token', data.token); // Save JWT token for later use
        alert('Login Successful');
        console.log(data.user.name);
        setName(data.user.name);
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
      <span >Don't have an this? <a href="/signup">Create one</a></span>
    </div>
  );
};

export default Login;
