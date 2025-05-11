import StatCard from './StatCard';
import TrendChart from './charts/TrendChart';
import TasksChart from './charts/TasksChart';
import HabitsChart from './charts/HabitsChart';
import RoutinesChart from './charts/RoutinesChart';
import RecentActivities from './RecentActivities';
import { getDashboardStats } from '@/services/dashboardService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import API_BASE_URL from '@/config';
import useUserStore from '@/stores/userStore';
import CalendarHeatmap from './CalendarHeatmap';
import LoadingCenter from '@/components/LoadingCenter';
import ErrorMessage from '@/components/ErrorMessage';

const Dashboard = () => {
  const { user } = useUserStore();
  const [timezone] = useState(() => {
    // Get the user's timezone offset in minutes
    return new Date().getTimezoneOffset();
  });

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats', timezone],
    queryFn: async () => {
      // Add timezone offset to API request headers for accurate date calculations
      const response = await getDashboardStats({
        headers: {
          'x-timezone-offset': timezone.toString()
        }
      });
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingCenter />;
  if (error) return <ErrorMessage message="Failed to load dashboard statistics" error={error} />;

  return (
    <Container sx={{ pb: 5 }}>
      <Typography variant="h4" gutterBottom mt={2} className="animate__animated animate__fadeIn">
        {greeting}, {user?.name?.split(' ')[0] || 'there'}!
      </Typography>
      
      <Box sx={{ mb: 4 }} className="animate__animated animate__fadeIn animate__delay-1s">
        <Typography variant="h6" gutterBottom>Today's Focus</Typography>
        <Paper sx={{ p: 2 }}>
          <ProgressWidget 
            tasksToday={stats.tasksToday}
            habitsToday={stats.habitsToday}
            routinesToday={stats.routinesToday}
            currentDate={new Date()}
          />
        </Paper>
      </Box>

      <Grid container spacing={3} className="animate__animated animate__fadeIn animate__delay-2s">
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tasks"
            total={stats.tasks.total}
            completed={stats.tasks.completed}
            overdue={stats.tasks.overdue}
            color="primary"
            icon={<TaskIcon />}
            linkTo="/tasks"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Routines"
            total={stats.routines.total}
            completed={stats.routines.completed}
            active={stats.routines.active}
            color="secondary"
            icon={<AutorenewIcon />}
            linkTo="/routines"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Habits"
            total={stats.habits.total}
            completed={stats.habits.completedToday}
            streak={stats.habits.longestStreak}
            color="success"
            icon={<RepeatIcon />}
            linkTo="/habits"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TrendChart 
              weeklyData={stats.productivityTrend.weeklyData} 
              change={stats.productivityTrend.change}
              detailedStats={stats.productivityTrend.detailedStats}
              isNewUser={stats.productivityTrend.isNewUser}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <TasksChart 
              completedTasks={stats.taskCompletion?.completed || []} 
              pendingTasks={stats.taskCompletion?.pending || []} 
            />
          </Paper>
        </Grid>

        {/* Heat Map - Showing Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Your Activity</Typography>
            <CalendarHeatmap completionData={stats.completionHeatmap} />
          </Paper>
        </Grid>

        {/* Additional Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <HabitsChart 
              adherenceData={stats.habitAdherence || {}} 
              streakData={stats.habitStreaks || {}}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <RoutinesChart frequencyData={stats.routineFrequency || {}} />
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <RecentActivities activities={stats.recentActivities || []} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 