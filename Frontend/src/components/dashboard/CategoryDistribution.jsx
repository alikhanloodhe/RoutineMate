import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getCategoryDistribution } from '../../services/dashboardService';
import Spinner from '../ui/Spinner';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

  // Colors for different categories
  const backgroundColors = [
    '#10B981', // green (Physical)
    '#6366F1', // indigo (Mental)
    '#F472B6', // pink (Spiritual) 
    '#F59E0B', // amber (Social)
    '#60A5FA', // blue
    '#8B5CF6', // purple
    '#EC4899', // hotpink
    '#EF4444', // red
    '#34D399', // emerald
    '#A3E635'  // lime
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCategoryDistribution();
        
        if (response.success && response.categoryData) {
          setCategoryData(response.categoryData);
        } else {
          setError('Failed to load category data');
        }
      } catch (err) {
        console.error('Error fetching category distribution:', err);
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format the data for the pie chart
  const chartData = {
    labels: categoryData.map(item => `${item.category} (${item.percentage}%)`),
    datasets: [
      {
        data: categoryData.map(item => item.percentage),
        backgroundColor: backgroundColors.slice(0, categoryData.length),
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Handle case when there is no data
  if (categoryData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
        <div className="text-gray-500 flex flex-col items-center justify-center h-60">
          <p>No category data available</p>
          <p className="text-sm mt-2">Complete tasks to see distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
      <div className="h-60">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CategoryDistribution; 