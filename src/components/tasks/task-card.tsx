'use client';

import type { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case 'Critical': return 'border-red-600 text-red-600';
      case 'High': return 'border-orange-500 text-orange-500';
      case 'Medium': return 'border-yellow-500 text-yellow-500';
      case 'Low': return 'border-green-500 text-green-500';
      default: return 'border-gray-400';
    }
  };

  const getTeamColor = (team: 'Red' | 'Blue' | 'Purple') => {
    if (team === 'Red') return 'bg-red-500/20 text-red-400';
    if (team === 'Blue') return 'bg-blue-500/20 text-blue-400';
    if (team === 'Purple') return 'bg-purple-500/20 text-purple-400';
  };

  return (
    <Card className="mb-4 bg-card/60 backdrop-blur-xl hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold mb-2 pr-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
        <div className="flex justify-between items-center text-xs">
          <Badge variant="outline" className={getTeamColor(task.team)}>{task.team} Team</Badge>
          <Badge variant="outline" className={getPriorityClass(task.priority)}>{task.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
