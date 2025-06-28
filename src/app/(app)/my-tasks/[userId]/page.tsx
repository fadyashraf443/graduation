
'use client';

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { UserTasksView } from "@/components/tasks/user-tasks-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PlatformUser } from "@/lib/types";

export default function UserTasksAdminPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [targetUser, setTargetUser] = useState<PlatformUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role && userData.role.toLowerCase() === 'admin') {
            setIsAuthorized(true);
            
            // Fetch the target user's info
            const targetUserRef = ref(db, `users/${userId}`);
            onValue(targetUserRef, (targetSnapshot) => {
              if (targetSnapshot.exists()) {
                setTargetUser({ id: userId, ...targetSnapshot.val() });
              }
              setIsLoading(false);
            });

          } else {
            setIsAuthorized(false);
            setIsLoading(false);
            router.replace('/dashboard');
          }
        });
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, [router, userId]);

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

  if (!isAuthorized) {
    return null; // Redirect is handled in useEffect
  }

  if (!targetUser) {
    return (
        <Card className="bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>User Not Found</CardTitle>
                <CardDescription>Could not find data for the specified user ID.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <UserTasksView 
      targetUserId={userId} 
      pageTitle={`Viewing Tasks for ${targetUser.email}`}
    />
  );
}
