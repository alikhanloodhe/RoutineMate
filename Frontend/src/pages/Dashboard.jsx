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
import CategoryDistribution from '../components/dashboard/CategoryDistribution';
import ProductivityTrend from '../components/dashboard/ProductivityTrend';
import StreakProgress from '../components/dashboard/StreakProgress';

// Import quote service
import { getDailyQuote } from '../services/quoteService';

const Dashboard = () => {
  const [currentQuote, setCurrentQuote] = useState({ text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" });
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Mock user data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  
  // Fetch daily quote on component mount
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const quote = await getDailyQuote();
        setCurrentQuote(quote);
      } catch (error) {
        console.error('Error fetching daily quote:', error);
        // The default quote in state will be used as fallback
      }
    };
    
    fetchQuote();
    
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

  // Mock data for recent activities
  const recentActivities = [
    { type: 'task', description: 'Completed "Morning Workout" task', time: 'Today, 8:30 AM' },
    { type: 'goal', description: 'Updated goal "Read 10 books"', time: 'Yesterday, 7:45 PM' },
    { type: 'routine', description: 'Created new routine "Evening Meditation"', time: '2 days ago, 9:15 PM' }
  ];

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
        
        {/* Streak Progress - Moved to top for motivation */}
        <div className="mb-6">
          <StreakProgress 
            routineStreak={{ current: 5, longest: 14 }} 
            taskStreak={{ current: 3, longest: 10 }} 
            habitStreak={{ current: 7, longest: 21 }} 
          />
        </div>
        
        {/* First Row - Schedule and Weekly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left column - Today's Schedule */}
          <div>
            <TodaySchedule />
          </div>
          
          {/* Right column - Weekly Activity Chart */}
          <div>
            <WeeklyActivityChart />
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <CategoryDistribution />
          <ProductivityTrend />
        </div>
        
        {/* Recent Activity Section */}
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  );
};

export default Dashboard;