'use client';

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set, remove, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { TeamCard } from "@/components/teams/team-card";
import { Button } from "@/components/ui/button";
import { teams as initialTeamsData } from "@/lib/placeholder-data";
import { PlusCircle } from "lucide-react";
import type { Team, PlatformUser, TeamMember } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { TeamFormDialog } from "@/components/teams/team-form-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load from Firebase on mount
  useEffect(() => {
    // Listen for auth state to determine admin status
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRoleRef = ref(db, `users/${user.uid}/role`);
        onValue(userRoleRef, (snapshot) => {
          const role = snapshot.val();
          setIsAdmin(role?.toLowerCase() === 'admin');
        });
      } else {
        setIsAdmin(false);
      }
    });

    const teamsRef = ref(db, 'teams');
    const teamsUnsubscribe = onValue(teamsRef, (snapshot) => {
      if (snapshot.exists()) {
        const teamsData = snapshot.val();
        setTeams(Object.values(teamsData));
      } else {
        // Seed initial data if the 'teams' node doesn't exist
        const initialTeamsObject = initialTeamsData.reduce((acc, team) => {
            acc[team.id] = team;
            return acc;
        }, {} as Record<string, Team>);
        set(teamsRef, initialTeamsObject);
        setTeams(initialTeamsData);
      }
      setIsLoading(false);
    });

    const usersRef = ref(db, 'users');
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const usersList: PlatformUser[] = usersData ? Object.keys(usersData).map(key => ({ id: key, ...usersData[key] })) : [];
      setUsers(usersList);
    });

    return () => {
        authUnsubscribe();
        teamsUnsubscribe();
        usersUnsubscribe();
    }
  }, []);

  const handleOpenForm = (team: Team | null) => {
    if (!isAdmin) return;
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleTeamSubmit = async (data: { name: Team['name']; description: string; memberIds: string[] }, id?: string) => {
    const { memberIds, ...teamData } = data;
    
    const newMembers: TeamMember[] = memberIds.map(userId => ({
      userId,
      role: 'Member'
    }));

    if (id) {
      // Update existing team
      try {
        const teamRef = ref(db, `teams/${id}`);
        await update(teamRef, { ...teamData, members: newMembers });
        toast({ title: 'Team updated!' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update team.' });
      }
    } else {
      // Create new team
      const newId = `team-${Date.now()}`;
      const newTeam: Team = {
        ...teamData,
        id: newId,
        members: newMembers,
        capacity: 0,
      };
      try {
        const teamRef = ref(db, `teams/${newId}`);
        await set(teamRef, newTeam);
        toast({ title: 'Team added!' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add team.' });
      }
    }
  };

  const handleOpenDeleteAlert = (teamId: string) => {
    if (!isAdmin) return;
    setDeletingTeamId(teamId);
    setIsAlertOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeamId) return;
    try {
        const teamRef = ref(db, `teams/${deletingTeamId}`);
        await remove(teamRef);
        toast({ title: 'Team deleted.' });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete team.' });
    }
    setDeletingTeamId(null);
  };
  
  if (isLoading) {
      return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Skeleton className="h-8 w-72 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-36" />
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
        </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="font-headline text-3xl font-bold">Team Selection Interface</h1>
            <p className="text-muted-foreground">Manage your security teams, assign roles, and view hierarchies.</p>
        </div>
        {isAdmin && (
            <Button onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Team
            </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {teams.map(team => (
            <TeamCard key={team.id} team={team} users={users} onEdit={handleOpenForm} onDelete={handleOpenDeleteAlert} isAdmin={isAdmin} />
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8 p-4 border-2 border-dashed rounded-lg text-center">
              <h2 className="font-headline text-xl font-semibold">Admin View</h2>
              <p className="text-muted-foreground mt-2">Drag and drop members between teams to re-assign roles. (UI Mockup)</p>
              <div className="mt-4 p-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">Drag & Drop Area</p>
              </div>
        </div>
      )}
      <TeamFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleTeamSubmit} 
        team={editingTeam}
        allUsers={users}
       />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
