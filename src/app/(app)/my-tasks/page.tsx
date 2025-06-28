
'use client';

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserTasksView } from "@/components/tasks/user-tasks-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function MyTasksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
        <div>
            <div className="mb-6">
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-96 w-full lg:col-span-3" />
            </div>
        </div>
    );
  }

  if (!currentUser) {
    return (
        <Card className="bg-card/60 backdrop-blur-xl h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground p-8">
                <ListTodo className="mx-auto h-12 w-12 mb-4" />
                <h3 className="font-headline text-lg">Please log in</h3>
                <p>You need to be logged in to view your personalized tasks.</p>
            </div>
        </Card>
    );
  }

  return (
    <UserTasksView 
      targetUserId={currentUser.uid} 
      pageTitle="My Tasks & Performance" 
    />
  );
}
