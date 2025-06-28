'use client';

import { useState, useEffect } from "react";
import { ref, onValue, set, push, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Target, CheckCircle, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserTask, UserPerformance } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface UserTasksViewProps {
  targetUserId: string;
  pageTitle: string;
}

export function UserTasksView({ targetUserId, pageTitle }: UserTasksViewProps) {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [performance, setPerformance] = useState<UserPerformance>({ efficiency: 0, completionRate: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");
  const [isEditingEfficiency, setIsEditingEfficiency] = useState(false);
  const [editingEfficiencyValue, setEditingEfficiencyValue] = useState(0);
  const { toast } = useToast();

  // State for inline task editing
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");

  const defaultPerformance: UserPerformance = { efficiency: 75, completionRate: 0 };
  const initialTasks: UserTask[] = [
    { id: 'task-1', text: 'Complete onboarding tutorial', completed: true },
    { id: 'task-2', text: 'Set up your profile', completed: false },
    { id: 'task-3', text: 'Explore the dashboard features', completed: false },
  ];

  useEffect(() => {
    if (!targetUserId) return;

    const userTasksRef = ref(db, `user-tasks/${targetUserId}`);

    const unsubscribe = onValue(userTasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const tasksList = data.tasks ? Object.keys(data.tasks).map(key => ({ id: key, ...data.tasks[key] })) : [];
        setTasks(tasksList);
        setPerformance(data.performance || defaultPerformance);
      } else {
        // Seed with initial data if none exists
        const initialData = {
          tasks: initialTasks.reduce((acc, task) => ({...acc, [task.id]: task }), {}),
          performance: defaultPerformance
        };
        set(userTasksRef, initialData);
        setTasks(initialTasks);
        setPerformance(defaultPerformance);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [targetUserId]);

  useEffect(() => {
    if (!targetUserId) return;
    const perfRef = ref(db, `user-tasks/${targetUserId}/performance`);
    
    if (tasks.length > 0) {
      const completedTasks = tasks.filter(task => task.completed).length;
      const completionRate = Math.round((completedTasks / tasks.length) * 100);
      set(perfRef, { ...performance, completionRate });
    } else if (!isLoading) {
      // Handle case where all tasks are deleted, reset completion rate to 0
      set(perfRef, { ...performance, completionRate: 0 });
    }
  }, [tasks, targetUserId, isLoading]); // Rerun when tasks change or loading completes


  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const tasksRef = ref(db, `user-tasks/${targetUserId}/tasks`);
    const newTaskRef = push(tasksRef);
    await set(newTaskRef, { text: newTaskText, completed: false });
    setNewTaskText("");
    toast({ title: "Task added!" });
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    const taskRef = ref(db, `user-tasks/${targetUserId}/tasks/${taskId}/completed`);
    await set(taskRef, completed);
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskRef = ref(db, `user-tasks/${targetUserId}/tasks/${taskId}`);
    await remove(taskRef);
    toast({ title: "Task deleted." });
  };
  
  const handleSaveEfficiency = async () => {
    if (editingEfficiencyValue < 0 || editingEfficiencyValue > 100) {
        toast({ variant: 'destructive', title: 'Invalid value', description: 'Efficiency must be between 0 and 100.' });
        return;
    }
    const perfRef = ref(db, `user-tasks/${targetUserId}/performance/efficiency`);
    await set(perfRef, editingEfficiencyValue);
    setIsEditingEfficiency(false);
    toast({ title: "Efficiency score updated." });
  };
  
  const handleEditEfficiency = () => {
    setEditingEfficiencyValue(performance.efficiency);
    setIsEditingEfficiency(true);
  }

  const handleStartEdit = (task: UserTask) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
  };

  const handleUpdateTask = async () => {
    if (!editingTaskId || !editingTaskText.trim()) {
      handleCancelEdit();
      return;
    }
    const taskRef = ref(db, `user-tasks/${targetUserId}/tasks/${editingTaskId}/text`);
    await set(taskRef, editingTaskText);
    toast({ title: "Task updated!" });
    handleCancelEdit();
  };

  if (isLoading) {
    return (
        <div>
            <div className="mb-6"><Skeleton className="h-9 w-3/4" /></div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full lg:col-span-3" />
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">{pageTitle}</h1>
        <p className="text-muted-foreground">Track and manage your personal tasks and performance metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Target /> Efficiency Score</CardTitle>
            <CardDescription>Represents your operational effectiveness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingEfficiency ? (
                <div className="flex items-center gap-2">
                    <Input 
                        type="number" 
                        value={editingEfficiencyValue}
                        onChange={(e) => setEditingEfficiencyValue(Number(e.target.value))}
                        className="text-3xl font-bold h-auto p-0 border-none focus-visible:ring-0"
                    />
                    <span className="text-3xl font-bold text-muted-foreground">%</span>
                    <Button size="icon" onClick={handleSaveEfficiency} className="h-8 w-8 ml-auto"><Save /></Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{performance.efficiency}%</p>
                    <Button size="icon" variant="ghost" onClick={handleEditEfficiency} className="h-8 w-8 ml-auto"><Edit /></Button>
                </div>
            )}
            <Progress value={performance.efficiency} />
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><CheckCircle /> Task Completion Rate</CardTitle>
            <CardDescription>Percentage of tasks completed from your list.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.completionRate || 0}%</p>
            <Progress value={performance.completionRate || 0} />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="font-headline">My Task List</CardTitle>
          <CardDescription>Your personal to-do list. Add, edit, and complete tasks to track your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <Input 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..." 
            />
            <Button type="submit" size="icon"><Plus /></Button>
          </form>
          <div className="space-y-2">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                {editingTaskId === task.id ? (
                  <>
                    <Checkbox id={`task-${task.id}`} checked={task.completed} disabled />
                    <Input 
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      className="h-8 flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTask();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={handleUpdateTask}><Save className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Checkbox 
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                    />
                    <label htmlFor={`task-${task.id}`} className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.text}</label>
                    <div className="ml-auto flex items-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleStartEdit(task)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </>
                )}
              </div>
            )) : <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one above to get started!</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
