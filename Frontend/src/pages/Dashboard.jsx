/*
* IMPORTANT: Page Content Structure
* 
* Each page should now only contain its main content, as the Header and Sidebar
* are rendered by the Layout component.
*/

// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';

// Import dashboard components
import DailyQuote from '../components/dashboard/DailyQuote';
import TodaySchedule from '../components/dashboard/TodaySchedule';
import RecentActivity from '../components/dashboard/RecentActivity';
import WeeklyActivityChart from '../components/dashboard/WeeklyActivityChart';
import TaskCategoryChart from '../components/dashboard/TaskCategoryChart';
import ProductivityTrend from '../components/dashboard/ProductivityTrend';
import StreakProgress from '../components/dashboard/StreakProgress';

const Dashboard = () => {
  const [currentQuote, setCurrentQuote] = useState({ text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock user data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  
  // Mock data for today's schedule
  const todaySchedule = [
    { id: 1, title: "Morning Workout", time: "07:30 AM", type: "routine", completed: true },
    { id: 2, title: "Team Meeting", time: "10:00 AM", type: "task", completed: false },
    { id: 3, title: "Lunch Break", time: "01:00 PM", type: "routine", completed: false },
    { id: 4, title: "Project Review", time: "03:30 PM", type: "task", completed: false },
    { id: 5, title: "Evening Meditation", time: "07:00 PM", type: "habit", completed: false }
  ];
  
  // Mock data for recent activities
  const recentActivities = [
    { type: 'task', description: 'Completed "Morning Workout" task', time: 'Today, 8:30 AM' },
    { type: 'goal', description: 'Updated goal "Read 10 books"', time: 'Yesterday, 7:45 PM' },
    { type: 'routine', description: 'Created new routine "Evening Meditation"', time: '2 days ago, 9:15 PM' }
  ];
  
  // List of quotes for daily inspiration
  const quotes = [
    { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "It's not what we do once in a while that shapes our lives, but what we do consistently.", author: "Tony Robbins" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "Good habits formed at youth make all the difference.", author: "Aristotle" },
    { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" }
  ];
  
  // Set a new quote for each day
  useEffect(() => {
    // Get today's date and use it to seed a random quote
    const today = new Date().setHours(0, 0, 0, 0);
    const savedDate = localStorage.getItem('quoteDate');
    
    if (savedDate !== today.toString()) {
      // It's a new day, set a new quote
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      localStorage.setItem('quoteDate', today.toString());
      localStorage.setItem('currentQuote', JSON.stringify(quotes[randomIndex]));
    } else {
      // Same day, use saved quote if available
      const savedQuote = localStorage.getItem('currentQuote');
      if (savedQuote) {
        setCurrentQuote(JSON.parse(savedQuote));
      }
    }
    
    // Update current date for the greeting
    setCurrentDate(new Date());
    
    // Set up interval to check time every minute
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format greeting based on time of day
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Format today's date
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Sample data for ProductivityTrend
  const weeklyData = [65, 72, 68, 76]; // Example completion rates for last 4 weeks

  // Sample data for StreakProgress
  const streakData = {
    routineStreak: { current: 5, longest: 12 },
    taskStreak: { current: 3, longest: 8 },
    habitStreak: { current: 7, longest: 15 }
  };

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <PageHeader 
          title="Dashboard" 
          subtitle={`${getGreeting()}, ${user.name}!`} 
          rightContent={<p className="text-sm text-gray-500">{formattedDate}</p>} 
        />
        
        {/* Daily Quote Component */}
        <DailyQuote quote={currentQuote} />
        
        {/* First Row - Schedule and Weekly Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left column - Schedule */}
          <div className="lg:col-span-1">
            <TodaySchedule schedule={todaySchedule} />
          </div>
          
          {/* Right column - Weekly Activity Chart */}
          <div className="lg:col-span-2">
            <WeeklyActivityChart />
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TaskCategoryChart />
          <ProductivityTrend weeklyData={weeklyData} />
        </div>

        {/* Streak Progress */}
        <div className="mb-6">
          <StreakProgress 
            routineStreak={streakData.routineStreak}
            taskStreak={streakData.taskStreak}
            habitStreak={streakData.habitStreak}
          />
        </div>
        
        {/* Recent Activity Section */}
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;