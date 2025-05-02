// Sample goals data for both personal and group goals
// This will be replaced with API calls in a real application

export const sampleGoals = [
  // Personal goals
  {
    goal_id: '1',
    title: 'Learn JavaScript',
    description: 'Complete a full JavaScript course and build 3 projects to showcase skills',
    goal_type: 'personal',
    category: 'education',
    start_date: '2025-01-15',
    end_date: '2025-05-30',
    status: 'active',
    progress: 65,
    created_at: '2024-12-20',
    visibility: 'private',
    milestones: [
      {
        id: '1',
        title: 'Complete Basic JavaScript',
        description: 'Master variables, functions, and control structures',
        due_date: '2025-02-15',
        status: 'completed',
        completion_date: '2025-02-10',
      },
      {
        id: '2',
        title: 'Learn DOM Manipulation',
        description: 'Understand how to interact with HTML elements',
        due_date: '2025-03-15',
        status: 'completed',
        completion_date: '2025-03-12',
      },
      {
        id: '3',
        title: 'Master ES6+ Features',
        description: 'Learn promises, async/await, and modern syntax',
        due_date: '2025-04-15',
        status: 'pending',
        completion_date: null,
      },
    ],
    activities: [
      {
        activity_id: '1',
        title: 'Completed First JavaScript Project',
        description: 'Built a to-do list app with local storage',
        timestamp: '2025-03-01T14:30:00',
        type: 'milestone_completed',
      },
      {
        activity_id: '2',
        title: 'Found helpful resources',
        description: 'Discovered MDN Web Docs and freeCodeCamp for learning',
        timestamp: '2025-01-20T09:30:00',
        type: 'note',
      }
    ]
  },
  {
    goal_id: '2',
    title: 'Daily Meditation',
    description: 'Meditate for at least 10 minutes every day to improve focus and reduce stress',
    goal_type: 'personal',
    category: 'personal',
    start_date: '2025-02-01',
    end_date: '2025-04-30',
    status: 'active',
    progress: 30,
    created_at: '2024-12-25',
    visibility: 'private',
    milestones: [
      {
        id: '1',
        title: 'Establish Morning Routine',
        description: 'Integrate meditation into morning routine',
        due_date: '2025-02-15',
        status: 'completed',
        completion_date: '2025-02-12',
      },
      {
        id: '2',
        title: 'Meditate for 15 Minutes',
        description: 'Increase daily meditation time to 15 minutes',
        due_date: '2025-03-15',
        status: 'pending',
        completion_date: null,
      },
    ],
    activities: []
  },
  {
    goal_id: '3',
    title: 'Run a Marathon',
    description: 'Train and complete a full marathon by following a 16-week training plan',
    goal_type: 'personal',
    category: 'fitness',
    start_date: '2025-01-01',
    end_date: '2025-04-20',
    status: 'completed',
    progress: 100,
    created_at: '2024-11-15',
    visibility: 'private',
    milestones: [],
    activities: []
  },
  {
    goal_id: '4',
    title: 'Read 12 Books',
    description: 'Read one book per month to expand knowledge and improve focus',
    goal_type: 'personal',
    category: 'education',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'active',
    progress: 25,
    created_at: '2024-12-15',
    visibility: 'private',
    milestones: [],
    activities: []
  },
  {
    goal_id: '5',
    title: 'Save $5,000',
    description: 'Save $5,000 for emergency fund by reducing expenses and budgeting',
    goal_type: 'personal',
    category: 'finance',
    start_date: '2025-05-01',
    end_date: '2025-12-31',
    status: 'pending',
    progress: 0,
    created_at: '2024-12-10',
    visibility: 'private',
    milestones: [],
    activities: []
  },
  {
    goal_id: '6',
    title: 'Build Portfolio',
    description: 'Create a professional portfolio website to showcase projects and skills',
    goal_type: 'personal',
    category: 'education',
    start_date: '2025-03-15',
    end_date: '2025-06-15',
    status: 'active',
    progress: 45,
    created_at: '2024-12-05',
    visibility: 'private',
    milestones: [],
    activities: []
  },
  
  // Group goals
  {
    goal_id: '7',
    title: 'Fitness Challenge 2025',
    description: '30-day fitness challenge with daily workouts and nutrition tracking',
    goal_type: 'group',
    category: 'fitness',
    start_date: '2025-01-15',
    end_date: '2025-02-15',
    status: 'active',
    progress: 65,
    created_at: '2024-12-20',
    members: [
      { user_id: '1', name: 'Sarah J.', role: 'admin', status: 'active' },
      { user_id: '2', name: 'John D.', role: 'editor', status: 'active' },
      { user_id: '3', name: 'Mark S.', role: 'viewer', status: 'active' },
      { user_id: '4', name: 'Lisa P.', role: 'editor', status: 'active' },
    ],
    milestones: [
      {
        id: '1',
        title: 'Complete Initial Assessment',
        description: 'Take baseline measurements and fitness test',
        due_date: '2025-01-16',
        status: 'completed',
        completion_date: '2025-01-16',
        assigned_to: { user_id: '1', name: 'Sarah J.' }
      },
      {
        id: '2',
        title: 'First Week Review',
        description: 'Review progress after first week and adjust as needed',
        due_date: '2025-01-22',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '2', name: 'John D.' }
      },
      {
        id: '3',
        title: 'Midpoint Evaluation',
        description: 'Evaluate progress at the midpoint of the challenge',
        due_date: '2025-01-30',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '3', name: 'Mark S.' }
      },
      {
        id: '4',
        title: 'Final Assessment',
        description: 'Take final measurements and compare with initial results',
        due_date: '2025-02-15',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '4', name: 'Lisa P.' }
      }
    ],
    activities: [
      {
        activity_id: '1',
        user: { name: 'Sarah J.', role: 'admin' },
        title: 'Initial fitness assessments completed',
        description: 'Everyone has completed their baseline fitness tests. Ready to start the challenge!',
        timestamp: '2025-01-16T14:30:00',
        type: 'milestone_completed',
        comments: [
          {
            id: '1',
            user: { name: 'John D.', role: 'editor' },
            text: 'Great work everyone! Looking forward to this challenge.',
            timestamp: '2025-01-16T15:45:00'
          },
          {
            id: '2',
            user: { name: 'Lisa P.', role: 'editor' },
            text: 'My results were worse than I expected. Definitely need this challenge!',
            timestamp: '2025-01-16T16:20:00'
          }
        ]
      },
      {
        activity_id: '2',
        user: { name: 'John D.', role: 'editor' },
        title: 'Workout plan for week 1',
        description: 'I\'ve uploaded the workout plan for our first week. Everyone should aim for 4 sessions this week.',
        timestamp: '2025-01-17T09:30:00',
        type: 'note',
        photos: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8d29ya291dCUyMHBsYW58ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60'
        ],
        comments: []
      }
    ]
  },
  {
    goal_id: '8',
    title: 'Book Club 2025',
    description: 'Read and discuss one book every two weeks throughout the year',
    goal_type: 'group',
    category: 'education',
    start_date: '2025-01-01',
    end_date: '2025-12-31',
    status: 'active',
    progress: 25,
    created_at: '2024-12-15',
    members: [
      { user_id: '5', name: 'You', role: 'admin', status: 'active' },
      { user_id: '6', name: 'Alex R.', role: 'viewer', status: 'active' },
      { user_id: '7', name: 'Emma L.', role: 'editor', status: 'active' },
    ],
    milestones: [
      {
        id: '1',
        title: 'Finish "The Alchemist"',
        description: 'Complete reading and prepare for discussion',
        due_date: '2025-01-14',
        status: 'completed',
        completion_date: '2025-01-13',
        assigned_to: { user_id: '5', name: 'You' }
      },
      {
        id: '2',
        title: 'Group Discussion - The Alchemist',
        description: 'Virtual meeting to discuss the book',
        due_date: '2025-01-15',
        status: 'completed',
        completion_date: '2025-01-15',
        assigned_to: { user_id: '7', name: 'Emma L.' }
      },
      {
        id: '3',
        title: 'Finish "Atomic Habits"',
        description: 'Complete reading and prepare for discussion',
        due_date: '2025-01-30',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '6', name: 'Alex R.' }
      },
      {
        id: '4',
        title: 'Group Discussion - Atomic Habits',
        description: 'Virtual meeting to discuss the book',
        due_date: '2025-01-31',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '5', name: 'You' }
      }
    ],
    activities: [
      {
        activity_id: '1',
        user: { name: 'You', role: 'admin' },
        title: 'Book Club Schedule',
        description: 'I\'ve created our reading schedule for the first quarter. We\'ll start with "The Alchemist" and then move on to "Atomic Habits".',
        timestamp: '2025-01-02T10:15:00',
        type: 'note',
        comments: [
          {
            id: '1',
            user: { name: 'Emma L.', role: 'editor' },
            text: 'Excited to get started! I\'ve heard great things about both books.',
            timestamp: '2025-01-02T11:30:00'
          }
        ]
      },
      {
        activity_id: '2',
        user: { name: 'Emma L.', role: 'editor' },
        title: 'The Alchemist - Discussion Questions',
        description: 'I\'ve prepared some discussion questions for our first meeting. Please review before we meet next week.',
        timestamp: '2025-01-10T16:45:00',
        type: 'note',
        photos: [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Ym9va3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
        ],
        comments: []
      }
    ]
  },
  {
    goal_id: '9',
    title: 'Coding Project Challenge',
    description: 'Build a web app together in 6 weeks with weekly code reviews',
    goal_type: 'group',
    category: 'project',
    start_date: '2025-03-01',
    end_date: '2025-04-15',
    status: 'active',
    progress: 0,
    created_at: '2024-12-20',
    members: [
      { user_id: '8', name: 'Michael T.', role: 'admin', status: 'active' },
      { user_id: '9', name: 'David K.', role: 'editor', status: 'active' },
      { user_id: '10', name: 'Anna P.', role: 'editor', status: 'active' },
    ],
    milestones: [
      {
        id: '1',
        title: 'Project Planning',
        description: 'Define project scope, features, and tech stack',
        due_date: '2025-03-05',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '8', name: 'Michael T.' }
      },
      {
        id: '2',
        title: 'Backend Setup',
        description: 'Set up database and API endpoints',
        due_date: '2025-03-15',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '9', name: 'David K.' }
      },
      {
        id: '3',
        title: 'Frontend Implementation',
        description: 'Create UI components and connect to backend',
        due_date: '2025-03-29',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '10', name: 'Anna P.' }
      },
      {
        id: '4',
        title: 'Testing & Deployment',
        description: 'Test application and deploy to production',
        due_date: '2025-04-12',
        status: 'pending',
        completion_date: null,
        assigned_to: { user_id: '8', name: 'Michael T.' }
      }
    ],
    activities: []
  },
  {
    goal_id: '10',
    title: 'Language Learning Group',
    description: 'Master Spanish together with weekly practice sessions and challenges',
    goal_type: 'group',
    category: 'education',
    start_date: '2025-01-10',
    end_date: '2025-06-10',
    status: 'active',
    progress: 40,
    created_at: '2024-12-05',
    members: [
      { user_id: '11', name: 'Jennifer K.', role: 'admin', status: 'active' },
      { user_id: '12', name: 'Robert S.', role: 'viewer', status: 'active' },
      { user_id: '13', name: 'Maria G.', role: 'editor', status: 'active' },
      { user_id: '14', name: 'Thomas H.', role: 'viewer', status: 'active' },
      { user_id: '15', name: 'Laura B.', role: 'viewer', status: 'active' },
    ],
    milestones: [],
    activities: []
  }
];

// Helper function to get a goal by ID
export const getGoalById = (goalId) => {
  const goal = sampleGoals.find(goal => goal.goal_id === goalId);
  
  // Ensure goal has activities array
  if (goal && !goal.activities) {
    goal.activities = [];
  }
  
  return goal;
};

// Helper function to get personal goals
export const getPersonalGoals = () => {
  return sampleGoals.filter(goal => goal.goal_type === 'personal');
};

// Helper function to get group goals
export const getGroupGoals = () => {
  return sampleGoals.filter(goal => goal.goal_type === 'group');
};

// Helper function to get all goals
export const getAllGoals = () => {
  return sampleGoals;
};

// Helper function to add a new goal
export const addGoal = (goal) => {
  const newGoal = {
    ...goal,
    goal_id: Date.now().toString(),
    status: goal.status || 'active',
    progress: 0,
    created_at: new Date().toISOString(),
    visibility: goal.goal_type === 'personal' ? (goal.visibility || 'private') : undefined,
  };
  
  sampleGoals.push(newGoal);
  return newGoal;
};

// Helper function to update a goal
export const updateGoal = (goalId, updatedGoalData) => {
  const index = sampleGoals.findIndex(goal => goal.goal_id === goalId);
  
  if (index !== -1) {
    sampleGoals[index] = {
      ...sampleGoals[index],
      ...updatedGoalData,
    };
    return sampleGoals[index];
  }
  
  return null;
};

// Helper function to delete a goal
export const deleteGoal = (goalId) => {
  const index = sampleGoals.findIndex(goal => goal.goal_id === goalId);
  
  if (index !== -1) {
    const deletedGoal = sampleGoals[index];
    sampleGoals.splice(index, 1);
    return deletedGoal;
  }
  
  return null;
}; 