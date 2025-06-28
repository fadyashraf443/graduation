
'use client';

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  team: 'Red' | 'Blue' | 'Purple';
};

export type KanbanColumn = {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
  tasks: Task[];
};

export type TeamMember = {
  userId: string;
  role: string; // Role within the team, e.g., 'Lead Pentester'
};

export type Team = {
  id: string;
  name: 'Red Team' | 'Blue Team' | 'Purple Team';
  description: string;
  members: TeamMember[];
  capacity: number; // as percentage
};

export type RoadmapStep = {
  stepTitle: string;
  stepDescription: string;
  courses: string[];
};

export type LearningPath = {
  learningPath: string;
  roadmap: RoadmapStep[];
  contentRecommendations: string[];
};

export type PredictiveReport = {
  reportTitle: string;
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  conclusion: string;
};

export type Certification = {
  id: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  progress?: number;
  date?: string;
};

export type Message = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isYou?: boolean;
  userId: string;
};

export type Channel = {
  id: string;
  name: string;
  description: string;
};

export type PlatformUser = {
  id: string;
  email: string;
  role: 'Admin' | 'User'; // Platform-wide role
};

export type UserTask = {
  id: string;
  text: string;
  completed: boolean;
};

export type UserPerformance = {
  efficiency: number;
  completionRate: number;
};
