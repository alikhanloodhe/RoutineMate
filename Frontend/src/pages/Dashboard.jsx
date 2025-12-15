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

// Import 3D visualization (Computer Graphics concepts 7, 9, 10)
import { Progress3DTrophy } from '../components/graphics';

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

        {/* 3D Trophy Progress Row */}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 3D Progress Trophy - Computer Graphics: 3D, lighting, shading, particles */}
          <div className="lg:col-span-1">
            <Progress3DTrophy
              routineProgress={45}
              taskProgress={60}
              habitProgress={75}
              goalProgress={30}
            />
          </div>

          {/* Streak Progress */}
          <div className="lg:col-span-2">
            <StreakProgress
              routineStreak={{ current: 0, longest: 0 }}
              taskStreak={{ current: 0, longest: 0 }}
              habitStreak={{ current: 0, longest: 0 }}
            />
          </div>
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
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;