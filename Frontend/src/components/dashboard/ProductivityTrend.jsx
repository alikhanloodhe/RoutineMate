import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProductivityTrend = ({ weeklyData }) => {
  // Calculate the change from last week
  const lastWeek = weeklyData[weeklyData.length - 1];
  const previousWeek = weeklyData[weeklyData.length - 2];
  const change = lastWeek - previousWeek;
  const isPositive = change >= 0;

  const data = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Completion Rate',
        data: weeklyData,
        borderColor: '#4A2BAF',
        backgroundColor: 'rgba(74, 43, 175, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Productivity Trend</h2>
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}% from last week
        </div>
      </div>
      
      <div className="h-[200px]">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default ProductivityTrend; 