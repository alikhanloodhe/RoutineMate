import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCategoryDistribution } from '../../services/dashboardService';
import { fetchCategories } from '../../services/categoryService';
import Spinner from '../ui/Spinner';

const CategoryDistribution = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryColors, setCategoryColors] = useState({});

  // Define default colors for categories
  const defaultColors = [
    '#10B981', // green
    '#6366F1', // indigo
    '#F472B6', // pink
    '#F59E0B', // amber
    '#60A5FA', // blue
    '#8B5CF6', // purple
    '#EC4899', // hotpink
    '#34D399', // emerald
  ];

  // Load available categories and assign colors
  useEffect(() => {
    const loadCategoryColors = async () => {
      try {
        const fetchedCategories = await fetchCategories();
        const colors = {};
        
        // Assign colors to each category
        fetchedCategories.forEach((cat, index) => {
          colors[cat.name] = defaultColors[index % defaultColors.length];
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
              color: categoryColors[item.category] || defaultColors[0] // Use default color if not found
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
        setError('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(categoryColors).length > 0) {
      fetchData();
    }
  }, [categoryColors]);

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

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 h-64 flex items-center justify-center">
        <p className="text-gray-500">No category data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Categories</h3>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
              <span className="text-sm text-gray-500">{category.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                className="h-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, category.percentage))}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDistribution; 