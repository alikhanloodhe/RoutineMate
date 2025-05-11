import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategoryDistribution } from '../../services/dashboardService';
import Spinner from '../ui/Spinner';

const CategoryDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // Define colors for categories
  const categoryColors = {
    'Physical': '#10B981',
    'Mental': '#6366F1',
    'Spiritual': '#F472B6',
    'Social': '#F59E0B',
    'Other': '#60A5FA',
    'Work': '#8B5CF6',
    'Personal': '#EC4899',
    'Health': '#34D399'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCategoryDistribution();
        
        console.log('Category Distribution API response:', response);
        
        if (response.success && response.categoryData) {
          // Map the API data to our format with colors
          const formattedData = response.categoryData.map(item => {
            // Ensure percentage is a valid number
            let percentage = 0;
            try {
              percentage = parseFloat(item.percentage);
              if (isNaN(percentage)) percentage = 0;
            } catch (e) {
              console.warn('Invalid percentage value:', item.percentage);
              percentage = 0;
            }
            
            return {
              name: item.category,
              percentage,
              color: categoryColors[item.category] || '#60A5FA' // Default to blue if color not found
            };
          });
          
          console.log('Formatted category data:', formattedData);
          
          setCategories(formattedData);
        } else {
          console.error('Invalid response format:', response);
          setError('Failed to load category data');
        }
      } catch (err) {
        console.error('Error fetching category distribution:', err);
        setError('Failed to load category data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate the placement of each segment on the pie chart
  let cumulativePercentage = 0;
  let segments = [];

  // Check if all percentages are zero
  if (categories.length > 0 && categories.every(cat => cat.percentage === 0)) {
    // If all percentages are zero, distribute segments equally
    const equalPercentage = 100 / categories.length;
    segments = categories.map((category, index) => {
      const startAngle = (index * equalPercentage / 100) * 360;
      const endAngle = ((index + 1) * equalPercentage / 100) * 360;
      
      return {
        ...category,
        percentage: equalPercentage, // Use equal percentage for display
        startAngle,
        endAngle
      };
    });
  } else {
    // Normal calculation with actual percentages
    segments = categories.map(category => {
      const startAngle = (cumulativePercentage / 100) * 360;
      cumulativePercentage += category.percentage;
      const endAngle = (cumulativePercentage / 100) * 360;
      
      return {
        ...category,
        startAngle,
        endAngle
      };
    });
  }

  const createSegmentPath = (startAngle, endAngle, radius = 70) => {
    // Convert angles to radians
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    // Calculate the end points of the arc
    const x1 = radius * Math.cos(startRad) + 100;
    const y1 = radius * Math.sin(startRad) + 100;
    const x2 = radius * Math.cos(endRad) + 100;
    const y2 = radius * Math.sin(endRad) + 100;
    
    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    
    // Create the SVG path
    return `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  if (loading) {
    return (
      <motion.div 
        className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6 flex justify-center items-center h-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Spinner />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-medium mb-6">Category Distribution</h2>
        <div className="text-red-500">{error}</div>
      </motion.div>
    );
  }

  // Handle case when there is no data
  if (categories.length === 0 || categories.every(cat => cat.percentage === 0)) {
    return (
      <motion.div 
        className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-medium mb-6">Category Distribution</h2>
        <div className="text-gray-500 flex flex-col items-center justify-center h-[200px]">
          <p>No category data available</p>
          <p className="text-sm mt-2">Complete tasks to see distribution</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-6">Category Distribution</h2>
      
      <div className="flex justify-center">
        <div className="relative w-[200px] h-[200px]">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {segments.map((segment, index) => (
              <motion.path
                key={index}
                d={createSegmentPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2 + (index * 0.1) 
                }}
              />
            ))}
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6">
        {categories.map((category, index) => {
          // Show actual percentage (0%) if all categories are zero
          const displayPercentage = categories.every(cat => cat.percentage === 0) ? 
            0 : // Always show 0 when all are zero 
            category.percentage;
            
          return (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="text-sm text-gray-700">
                {category.name} ({displayPercentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategoryDistribution; 