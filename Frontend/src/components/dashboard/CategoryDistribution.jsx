import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getCategoryDistribution } from '../../services/dashboardService';
import { fetchCategories } from '../../services/categoryService';
import Spinner from '../ui/Spinner';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});

  // Colors for different categories
  const backgroundColors = [
    '#10B981', // green
    '#6366F1', // indigo
    '#F472B6', // pink 
    '#F59E0B', // amber
    '#60A5FA', // blue
    '#8B5CF6', // purple
    '#EC4899', // hotpink
    '#EF4444', // red
    '#34D399', // emerald
    '#A3E635'  // lime
  ];

  // Load categories and assign colors
  useEffect(() => {
    const loadCategoryColors = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        const colors = {};
        
        // Assign colors to each category
        fetchedCategories.forEach((cat, index) => {
          colors[cat.name] = backgroundColors[index % backgroundColors.length];
        });
        
        setCategoryColors(colors);
      } catch (err) {
        console.error('Error loading categories for colors:', err);
      }
    };
    
    loadCategoryColors();
  }, []);

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

    if (Object.keys(categoryColors).length > 0) {
      fetchData();
    }
  }, [categoryColors]);

  // Format the data for the pie chart
  const chartData = {
    labels: categoryData.map(item => `${item.category} (${item.percentage}%)`),
    datasets: [
      {
        data: categoryData.map(item => item.percentage),
        backgroundColor: categoryData.map(item => categoryColors[item.category] || backgroundColors[0]),
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
          usePointStyle: true,
          boxWidth: 10,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label.split(' (')[0]}: ${value}%`;
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-64 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-64 flex items-center justify-center">
        <p className="text-gray-500">No category data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories Distribution</h3>
      <div className="h-64">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default CategoryDistribution; 