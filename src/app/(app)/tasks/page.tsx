'use client';
import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { kanbanColumns as initialColumns } from "@/lib/placeholder-data";
import { Skeleton } from "@/components/ui/skeleton";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import type { KanbanColumn } from "@/lib/types";

export default function TasksPage() {
  const [columns, setColumns] = useState<Record<string, KanbanColumn> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const kanbanRef = ref(db, 'kanban');
    const unsubscribe = onValue(kanbanRef, (snapshot) => {
        if (snapshot.exists()) {
            setColumns(snapshot.val());
        } else {
            const initialData = initialColumns.reduce((acc, col) => {
                // Ensure tasks is an object for Firebase, not an array
                const tasksAsObject = col.tasks.reduce((taskAcc, task) => {
                    taskAcc[task.id] = task;
                    return taskAcc;
                }, {} as any);
                acc[col.id] = { ...col, tasks: tasksAsObject };
                return acc;
            }, {} as any);
            set(kanbanRef, initialData);
            setColumns(initialData);
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold">Smart Task Management</h1>
        <p className="text-muted-foreground">Prioritize, manage, and track tasks across your security teams.</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-muted/30 rounded-lg p-4 space-y-4">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : columns ? (
        <KanbanBoard initialColumns={columns} />
      ) : (
        <p>Could not load tasks board.</p>
      )}
    </div>
  );
}
