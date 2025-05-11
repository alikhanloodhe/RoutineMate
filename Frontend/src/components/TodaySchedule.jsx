import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, IconButton, CircularProgress, Divider } from '@mui/material';
import { CalendarToday, RefreshOutlined, AccessTimeOutlined, ExpandMore, ExpandLess, Info } from '@mui/icons-material';
import { getDashboardService } from '../services/dashboardService';
import { formatDate } from '../utils/dateUtils';
import { styled } from '@mui/material/styles';

// Styled components
const TimelineContainer = styled(Box)(({ theme }) => ({
  maxHeight: '320px',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider,
    borderRadius: '3px',
  }
}));

const TimelineItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2),
  position: 'relative',
}));

const TimelineBar = styled(Box)(({ color, theme }) => ({
  width: '4px',
  borderRadius: '2px',
  backgroundColor: color || theme.palette.primary.main,
  marginRight: theme.spacing(2),
  minHeight: '70px',
}));

const TimelineDot = styled(Box)(({ theme }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.primary.main}`,
  position: 'absolute',
  top: theme.spacing(1),
  left: '-4px',
}));

const TypeChip = styled(Chip)(({ theme }) => ({
  borderRadius: '14px',
  height: '28px',
  fontSize: '0.75rem',
  backgroundColor: '#f0f0ff',
}));

const AiChip = styled(Chip)(({ theme }) => ({
  borderRadius: '16px',
  height: '24px',
  fontSize: '0.75rem',
  backgroundColor: '#eaecff',
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(1),
}));

const TodaySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [today, setToday] = useState({ date: '', dayOfWeek: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOptimized, setShowOptimized] = useState(false);

  const fetchTodaySchedule = async () => {
    try {
      setLoading(true);
      const data = await getDashboardService().getTodaySchedule();
      
      if (data && data.data) {
        // Only keep items with time information
        const timeSchedule = data.data.schedule || [];
        setSchedule(timeSchedule);
        setToday(data.data.today || { date: '', dayOfWeek: '' });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching today\'s schedule:', err);
      setError('Failed to load schedule');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySchedule();
  }, []);

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return '#f44336'; // High - Red
      case 2: return '#ff9800'; // Medium - Orange
      case 3: return '#4caf50'; // Low - Green
      case 4: return '#4caf50'; // Low - Green (P4 in image)
      default: return '#9e9e9e'; // Default - Grey
    }
  };

  // Get type label and color
  const getTypeInfo = (type) => {
    switch (type) {
      case 'routine':
        return { label: 'routine', color: '#8e24aa' };
      case 'habit':
        return { label: 'habit', color: '#9c27b0' };
      case 'task':
        return { label: 'task', color: '#3f51b5' };
      case 'goal':
        return { label: 'goal', color: '#009688' };
      default:
        return { label: type, color: '#9e9e9e' };
    }
  };

  // Format priority label for display
  const getPriorityLabel = (priority) => {
    if (typeof priority === 'number') {
      return `P${priority}`;
    }
    return '';
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3, height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={30} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" size="small" onClick={fetchTodaySchedule} sx={{ mt: 1 }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 3, overflow: 'hidden', p: 3, boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', borderRadius: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" component="div" fontWeight="600">
              {showOptimized ? 'Smart Schedule' : 'Today\'s Schedule'}
            </Typography>
            {showOptimized && <AiChip label="AI" size="small" />}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {showOptimized ? 'Optimized for your productivity' : `${today.dayOfWeek}, ${formatDate(today.date)}`}
          </Typography>
        </Box>
        <Box>
          <IconButton 
            size="small" 
            sx={{ 
              width: '48px', 
              height: '48px', 
              background: '#f0f0ff',
              borderRadius: '12px'
            }}
          >
            <AccessTimeOutlined color="primary" />
          </IconButton>
        </Box>
      </Box>

      {schedule.length > 0 ? (
        <TimelineContainer>
          {schedule.map((item, index) => {
            const typeInfo = getTypeInfo(item.type);
            const priorityColor = getPriorityColor(item.priority);
            const priorityLabel = getPriorityLabel(item.priority);
            
            return (
              <TimelineItem key={index}>
                <TimelineBar color={priorityColor} />
                <TimelineDot sx={{ borderColor: priorityColor }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle1" component="div" fontWeight="600">
                      {item.title}
                    </Typography>
                    {priorityLabel && (
                      <Chip 
                        label={priorityLabel} 
                        size="small" 
                        sx={{ 
                          height: 24, 
                          backgroundColor: priorityColor, 
                          color: 'white', 
                          fontWeight: 'bold',
                          borderRadius: '8px',
                          minWidth: '34px'
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {item.interval || item.time}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TypeChip 
                      label={typeInfo.label}
                      icon={
                        typeInfo.label === 'task' 
                          ? <AccessTimeOutlined fontSize="small" sx={{ color: typeInfo.color, ml: '-4px' }} />
                          : <CalendarToday fontSize="small" sx={{ color: typeInfo.color, ml: '-4px' }} />
                      }
                      size="small"
                      sx={{ 
                        color: typeInfo.color,
                        borderColor: typeInfo.color,
                        variant: 'outlined'
                      }}
                    />
                  </Box>
                </Box>
              </TimelineItem>
            );
          })}
        </TimelineContainer>
      ) : (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary">
            No timed activities scheduled for today
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="text"
          startIcon={<RefreshOutlined />}
          onClick={() => setShowOptimized(false)}
          sx={{ color: 'text.secondary' }}
        >
          Reset
        </Button>
        <Button
          variant="text"
          color="primary"
          endIcon={<CalendarToday />}
          onClick={() => setShowOptimized(!showOptimized)}
        >
          View full schedule
        </Button>
      </Box>
    </Card>
  );
};

export default TodaySchedule; 