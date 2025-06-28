'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import type { KanbanColumn, Task } from '@/lib/types';
import { BrainCircuit, Zap, PlusCircle } from 'lucide-react';
import { prioritizeTasks } from '@/ai/flows/task-prioritization';
import { useToast } from '@/hooks/use-toast';
import { TaskFormDialog } from './task-form-dialog';
import { TaskCard } from './task-card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '../ui/skeleton';
import { ref, set, remove, update } from 'firebase/database';
import { db } from '@/lib/firebase';

export function KanbanBoard({ initialColumns }: { initialColumns: Record<string, KanbanColumn> }) {
  const [columns, setColumns] = useState(initialColumns);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskStatus, setEditingTaskStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Transform tasks from object to array for react-beautiful-dnd
    const transformedCols = Object.entries(initialColumns).reduce((acc, [colId, colData]) => {
      acc[colId] = {
        ...colData,
        tasks: colData.tasks ? Object.values(colData.tasks) : [],
      };
      return acc;
    }, {} as any);
    setColumns(transformedCols);
  }, [initialColumns]);

  const handleTaskSubmit = async (data: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
    team: "Red" | "Blue" | "Purple";
    status: "todo" | "in-progress" | "done";
  }, id?: string) => {
    const { status, ...taskData } = data;
    const targetColumnId = status;

    if (id) {
        // Find which column the task was in before editing
        let originalColumnId: string | null = null;
        for (const colId in columns) {
            if (columns[colId].tasks.some((t: Task) => t.id === id)) {
                originalColumnId = colId;
                break;
            }
        }

        const taskRef = ref(db, `kanban/${originalColumnId}/tasks/${id}`);
        if (originalColumnId === targetColumnId) {
            await update(taskRef, taskData);
        } else {
            await remove(taskRef); // Remove from old column
            const newTaskRef = ref(db, `kanban/${targetColumnId}/tasks/${id}`);
            await set(newTaskRef, { ...taskData, id }); // Add to new column
        }
    } else {
        const newId = `task-${Date.now()}`;
        const taskRef = ref(db, `kanban/${targetColumnId}/tasks/${newId}`);
        await set(taskRef, { ...taskData, id: newId });
    }
    toast({ title: `Task ${id ? 'updated' : 'added'} successfully!` });
  };
  
  const handleOpenDeleteAlert = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsAlertOpen(true);
  };
  
  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;

    let columnId: string | null = null;
    for (const colId in columns) {
        if (columns[colId].tasks.some((t: Task) => t.id === deletingTaskId)) {
            columnId = colId;
            break;
        }
    }
    
    if (columnId) {
        const taskRef = ref(db, `kanban/${columnId}/tasks/${deletingTaskId}`);
        await remove(taskRef);
        toast({ title: 'Task deleted successfully.' });
    }
    
    setDeletingTaskId(null);
    setIsAlertOpen(false);
  };

  const handlePrioritize = async () => {
    setIsAiLoading(true);
    toast({ title: 'AI Prioritization Started', description: 'The AI is analyzing tasks...' });
    const allTasks = Object.values(columns).flatMap(col => col.tasks);
    try {
      const result = await prioritizeTasks({
        tasks: allTasks,
        threatIntelligence: "A new critical vulnerability (CVE-2024-XXXX) has been discovered affecting our external web servers. It allows for remote code execution.",
        teamCapacity: "Red Team is at 80% capacity. Blue Team is at 95% capacity, focused on incident response. Purple Team is available."
      });
      
      const updates: { [key: string]: any } = {};
      result.prioritizedTasks.forEach(pTask => {
        Object.values(columns).forEach(col => {
            const taskExists = col.tasks.find((t: Task) => t.id === pTask.id);
            if (taskExists) {
                updates[`kanban/${col.id}/tasks/${pTask.id}/priority`] = pTask.priority;
            }
        });
      });
      await update(ref(db), updates);
      
      toast({ title: 'AI Prioritization Complete', description: 'Tasks have been re-prioritized.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to prioritize tasks.' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    
    const sourceColId = source.droppableId;
    const destColId = destination.droppableId;
    
    const sourceCol = columns[sourceColId];
    const destCol = columns[destColId];
    const sourceTasks = [...sourceCol.tasks];
    const [removed] = sourceTasks.splice(source.index, 1);
    
    const updates: { [key: string]: any } = {};

    if (sourceColId === destColId) {
        sourceTasks.splice(destination.index, 0, removed);
        const newTasksObject = sourceTasks.reduce((acc, task, index) => {
            acc[task.id] = {...task, order: index}; // use order if needed, or just set it
            return acc;
        }, {} as any);
        updates[`kanban/${sourceColId}/tasks`] = newTasksObject;
    } else {
        // Remove from source column
        updates[`kanban/${sourceColId}/tasks/${removed.id}`] = null;
        // Add to destination column
        updates[`kanban/${destColId}/tasks/${removed.id}`] = removed;
    }
    await update(ref(db), updates);
  };
  
  const handleOpenForm = (task: Task | null) => {
    setEditingTask(task);
    if (task) {
        for (const colId in columns) {
            if (columns[colId].tasks.some((t: Task) => t.id === task.id)) {
                setEditingTaskStatus(colId as 'todo' | 'in-progress' | 'done');
                break;
            }
        }
    } else {
        setEditingTaskStatus('todo');
    }
    setIsFormOpen(true);
  };

  if (!isClient || Object.keys(columns).length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-4">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
        </Button>
        <Button onClick={handlePrioritize} disabled={isAiLoading}>
          {isAiLoading ? (<><Zap className="mr-2 h-4 w-4 animate-spin" />Prioritizing...</>) : (<><BrainCircuit className="mr-2 h-4 w-4" />AI-Powered Prioritization</>)}
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-headline font-semibold text-lg mb-4 text-center">{column.title}</h3>
                  {column.tasks.map((task: Task, index: number) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TaskCard task={task} onEdit={handleOpenForm} onDelete={handleOpenDeleteAlert} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      <TaskFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleTaskSubmit} 
        task={editingTask} 
        status={editingTaskStatus}
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the task.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTaskId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
