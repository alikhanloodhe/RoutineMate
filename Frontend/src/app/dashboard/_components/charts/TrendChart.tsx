import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { alpha } from '@mui/material/styles';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type DetailedStat = {
  week: number;
  productivityScore: number | null;
  taskScore: number;
  routineScore: number;
  habitScore: number;
  tasks: { completed: number; total: number; due: number };
  routines: { completed: number; total: number };
  habits: { completed: number; total: number; opportunities: number };
  hasData: boolean;
  hasRealData: boolean;
  weekLabel?: string | null;
};

type TrendChartProps = {
  weeklyData: number[];
  change: number;
  detailedStats?: DetailedStat[];
  isNewUser?: boolean;
};

const TrendChart: React.FC<TrendChartProps> = ({ 
  weeklyData, 
  change, 
  detailedStats = [],
  isNewUser = false
}) => {
  // Get weeks in right order (oldest to newest)
  const reversedData = [...weeklyData].reverse();
  const weekLabels = ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Last week'];

  // Format tooltips to show detailed stats for each week
  const getTooltipLabel = (tooltipItem: any) => {
    if (!detailedStats || detailedStats.length === 0) return '';
    
    // Get week index (reversed from the data)
    const weekIndex = 3 - tooltipItem.dataIndex;
    const weekStat = detailedStats.find(s => s.week === weekIndex + 1);
    
    if (!weekStat || !weekStat.hasData) {
      return 'No data for this week';
    }
    
    // Calculate completion rates
    const taskCompletion = weekStat.tasks.due > 0 
      ? Math.round((weekStat.tasks.completed / weekStat.tasks.due) * 100) 
      : (weekStat.tasks.total > 0 
        ? Math.round((weekStat.tasks.completed / weekStat.tasks.total) * 100)
        : 0);
    
    const routineCompletion = weekStat.routines.total > 0 
      ? Math.round((weekStat.routines.completed / weekStat.routines.total) * 100)
      : 0;
    
    const habitCompletion = weekStat.habits.opportunities > 0
      ? Math.round((weekStat.habits.completed / weekStat.habits.opportunities) * 100)
      : 0;
    
    // Format the tooltip
    return [
      `Productivity: ${weekStat.productivityScore}%`,
      `Tasks: ${weekStat.tasks.completed}/${weekStat.tasks.due || weekStat.tasks.total} (${taskCompletion}%)`,
      `Routines: ${weekStat.routines.completed}/${weekStat.routines.total} (${routineCompletion}%)`,
      `Habits: ${weekStat.habits.completed}/${weekStat.habits.opportunities} (${habitCompletion}%)`
    ].join('\n');
  };

  // Get change icon based on trend
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUpIcon color="success" />;
    if (change < 0) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="action" />;
  };

  // Get change text
  const getChangeText = () => {
    if (isNewUser) return "Getting started!";
    if (change > 0) return `Up ${change}%`;
    if (change < 0) return `Down ${Math.abs(change)}%`;
    return "No change";
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Productivity (%)',
        },
        ticks: {
          callback: (value: any) => `${value}%`,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Week',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: getTooltipLabel,
        },
      },
    },
  };

  // Chart data
  const data = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Productivity',
        data: reversedData,
        fill: true,
        backgroundColor: (ctx: any) => {
          const chart = ctx.chart;
          const { ctx: context, chartArea } = chart;
          if (!chartArea) {
            return null;
          }
          const gradient = context.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, alpha('#3f51b5', 0.1));
          gradient.addColorStop(1, alpha('#3f51b5', 0.4));
          return gradient;
        },
        borderColor: '#3f51b5',
        tension: 0.4,
        pointBackgroundColor: '#3f51b5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Productivity Trend</Typography>
        <Box display="flex" alignItems="center">
          {getTrendIcon()}
          <Typography variant="body2" color="textSecondary" ml={1}>
            {getChangeText()}
          </Typography>
        </Box>
      </Box>
      <Box height={300}>
        <Line options={options} data={data} />
      </Box>
      {isNewUser && (
        <Typography variant="body2" mt={2} textAlign="center" color="text.secondary">
          Keep using RoutineMate to see your productivity trends over time!
        </Typography>
      )}
    </Box>
  );
};

export default TrendChart; 