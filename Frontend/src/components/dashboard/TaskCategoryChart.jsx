import React from 'react';
import { motion } from 'framer-motion';

const TaskCategoryChart = () => {
  // Mock data for task categories with physical, mental, spiritual, and social
  const categories = [
    { name: 'Physical', percentage: 28, color: '#10B981' },
    { name: 'Mental', percentage: 42, color: '#6366F1' },
    { name: 'Spiritual', percentage: 12, color: '#F472B6' },
    { name: 'Social', percentage: 18, color: '#F59E0B' }
  ];

  // Calculate the placement of each segment on the pie chart
  let cumulativePercentage = 0;
  const segments = categories.map(category => {
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += category.percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    
    return {
      ...category,
      startAngle,
      endAngle
    };
  });

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

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-6">Task Categories</h2>
      
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
        {categories.map((category, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-2" 
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-sm text-gray-700">
              {category.name} ({category.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TaskCategoryChart; 