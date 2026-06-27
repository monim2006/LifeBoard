export const getAIResponse = async (userId: string, message: string, history: { role: string; content: string }[]) => {
  const q = message.toLowerCase();

  // Simple keyword-based responses
  if (q.includes('task') || q.includes('todo')) {
    return 'You can manage tasks on the Today page. Use the timeline to add and organize your daily tasks. For advanced management, go to Workspace > Planner Management.';
  }
  if (q.includes('habit')) {
    return 'Track your habits on the Habits page. You can create new habits there or manage them all in Workspace > Habit Management.';
  }
  if (q.includes('goal')) {
    return 'Set and track your goals on the Goals page. Create new goals and milestones there. For full management, visit Workspace > Goal Management.';
  }
  if (q.includes('expense') || q.includes('money') || q.includes('spend')) {
    return 'Manage your finances on the Finance page. You can add expenses, income, and track your budget. Full budget management is in Workspace > Finance Management.';
  }
  if (q.includes('journal') || q.includes('diary') || q.includes('write')) {
    return 'Write your daily journal on the Journal page. Each day gets its own entry automatically. Manage templates in Workspace > Journal Management.';
  }
  if (q.includes('project')) {
    return 'Manage your projects on the Projects page. You can create projects and add tasks. For full CRUD, visit Workspace > Project Management.';
  }
  if (q.includes('plan') || q.includes('week') || q.includes('schedule')) {
    return 'Use the Week Planner to organize your week with time blocks. Manage templates in Workspace > Planner Management.';
  }
  if (q.includes('category')) {
    return 'You can manage all categories in Workspace > Categories. Categories are used across the app for organizing tasks, expenses, habits, and more.';
  }
  if (q.includes('profile') || q.includes('setting')) {
    return 'View and edit your profile in Workspace > Profile. You can change your username, email, password, theme, language, and more.';
  }
  if (q.includes('backup') || q.includes('export') || q.includes('import')) {
    return 'Data management tools are in Workspace > Data Management and Workspace > Backup & Restore. You can export, import, backup, and restore your data.';
  }
  if (q.includes('security') || q.includes('password') || q.includes('delete account')) {
    return 'Security settings are in Workspace > Security. You can change your password or delete your account there.';
  }
  if (q.includes('help') || q.includes('how')) {
    return 'I can help you with tasks, habits, goals, expenses, journal, projects, and more. The main navigation has: Home (dashboard), Today (daily capture), Week Planner, Journal, Finance, Analytics, and Workspace (management). Try asking me about a specific feature!';
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Hello! Welcome to LifeBoard. I\'m your AI assistant. I can help you navigate the app, understand features, or provide productivity tips. What would you like to know?';
  }
  if (q.includes('analytics') || q.includes('stats') || q.includes('report')) {
    return 'View your analytics on the Analytics page. You can see expense trends, habit completion rates, mood patterns, and productivity scores.';
  }
  if (q.includes('finance') || q.includes('budget')) {
    return 'The Finance page shows your daily expenses, weekly totals, and balance. Budget management is available in Workspace > Finance Management.';
  }
  if (q.includes('notification')) {
    return 'View your notifications by clicking the bell icon in the top bar. Manage all notifications in Workspace > Notifications.';
  }

  return 'I\'m your LifeBoard assistant. I can help you with tasks, habits, goals, finances, journaling, projects, and more. Try asking me about a specific feature or type "help" to get started!';
};
