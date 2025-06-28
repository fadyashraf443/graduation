import type { Team, KanbanColumn, Task, Channel } from './types';

// NOTE: User data is now managed by Firebase Authentication and stored in the Realtime Database.
// The `initialUsers` array is no longer used for seeding.

export const teams: Team[] = [
  {
    id: 'red-team',
    name: 'Red Team',
    description: 'Offensive security experts focused on penetration testing and simulating attacks.',
    capacity: 85,
    members: [], // Members are now assigned dynamically from registered users
  },
  {
    id: 'blue-team',
    name: 'Blue Team',
    description: 'Defensive security specialists responsible for threat detection and incident response.',
    capacity: 92,
    members: [], // Members are now assigned dynamically from registered users
  },
  {
    id: 'purple-team',
    name: 'Purple Team',
    description: 'Collaborative unit that integrates red and blue team strategies to maximize security.',
    capacity: 78,
    members: [], // Members are now assigned dynamically from registered users
  },
];
  
export const kanbanColumns: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
        { id: 'task-1', title: 'Network Vulnerability Scan', description: 'Perform a full scan of the external network perimeter.', priority: 'High', team: 'Red' },
        { id: 'task-8', title: 'Application Security Review', description: 'Static and dynamic analysis of the new customer portal.', priority: 'Medium', team: 'Red' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
        { id: 'task-3', title: 'Review Firewall Ruleset', description: 'Audit all firewall rules for legacy or insecure configurations.', priority: 'High', team: 'Blue' },
        { id: 'task-7', title: 'Conduct ATT&CK Emulation', description: 'Emulate APT41 techniques to test detection capabilities.', priority: 'High', team: 'Purple' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: 'task-2', title: 'Phishing Campaign Simulation', description: 'Simulate a targeted phishing attack on the finance department.', priority: 'Medium', team: 'Red' },
      { id: 'task-4', title: 'Update SIEM Detection Logic', description: 'Incorporate new IOCs from recent threat intel feeds.', priority: 'High', team: 'Blue' },
      { id: 'task-5', title: 'Analyze Endpoint Logs', description: 'Hunt for persistence mechanisms on critical servers.', priority: 'Medium', team: 'Blue' },
      { id: 'task-6', title: 'Develop New Detection Playbook', description: 'Create a new playbook based on the latest Red Team TTPs.', priority: 'Low', team: 'Purple' },
    ],
  },
];

export const chatChannels: Channel[] = [
  {
    id: 'public',
    name: '# Public',
    description: 'Public channel for all platform users.',
  },
  {
    id: 'red-team',
    name: '# red-team',
    description: 'Discussing offensive strategies and findings.',
  },
  {
    id: 'blue-team',
    name: '# blue-team',
    description: 'Coordination for defensive operations.',
  },
  {
    id: 'purple-team',
    name: '# purple-team',
    description: 'Synergy and collaboration between red and blue teams.',
  }
];

// This is kept to prevent build errors from old file references. It's not used by the live app.
export const initialUsers = [];
