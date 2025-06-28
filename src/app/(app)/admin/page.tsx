
'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, set, remove } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Settings, ShieldAlert, MoreVertical, Edit, Trash2, Key, Users, LineChart, GanttChartSquare, Shield, ListChecks, ListTodo } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import type { PlatformUser } from "@/lib/types";
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Authorization and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role && userData.role.toLowerCase() === 'admin') {
            setIsAuthorized(true);
            
            // Fetch all users for management
            const allUsersRef = ref(db, 'users');
            onValue(allUsersRef, (usersSnapshot) => {
              const usersData = usersSnapshot.val();
              const usersList: PlatformUser[] = usersData ? Object.keys(usersData).map(key => ({
                id: key,
                ...usersData[key]
              })) : [];
              setUsers(usersList);
              setIsLoading(false);
            }, { onlyOnce: false });

          } else {
            setIsAuthorized(false);
            setIsLoading(false);
            toast({ variant: "destructive", title: "Access Denied", description: "You do not have permission to view this page." });
            router.replace('/dashboard');
          }
        });
      } else {
        setIsAuthorized(false);
        setIsLoading(false);
        router.replace('/admin/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleOpenEditDialog = (user: PlatformUser) => {
    setEditingUser(user);
    setIsEditOpen(true);
  };

  const handleUserUpdate = async ({ role }: { role: 'Admin' | 'User' }) => {
    if (!editingUser) return;
    try {
      const userRef = ref(db, `users/${editingUser.id}/role`);
      await set(userRef, role);
      toast({ title: "User role updated successfully!" });
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to update user role." });
      console.error(error);
    }
    setIsEditOpen(false);
    setEditingUser(null);
  };

  const handleOpenDeleteAlert = (user: PlatformUser) => {
    setDeletingUser(user);
    setIsAlertOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    if (deletingUser.email === 'flflshrshr3@gmail.com') {
      toast({ variant: "destructive", title: "Error", description: "Cannot delete the primary admin account." });
      setIsAlertOpen(false);
      return;
    }
    try {
      const userRef = ref(db, `users/${deletingUser.id}`);
      await remove(userRef);
      toast({ title: "User deleted successfully from database." });
      // Note: This does not delete the user from Firebase Authentication.
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to delete user." });
      console.error(error);
    }
    setDeletingUser(null);
    setIsAlertOpen(false);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: `This is a mock-up. Settings are not saved to the database yet.`
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="h-96 w-full md:col-span-2" />
          <Skeleton className="h-96 w-full md:col-span-2" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Redirect is handled in useEffect
  }

  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="font-headline text-3xl font-bold flex items-center gap-2"><ShieldAlert className="w-8 h-8"/> Admin Panel</h1>
          <p className="text-muted-foreground">Manage users, system settings, and platform configurations.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="md:col-span-2 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle id="user-management-card" className="font-headline flex items-center gap-2 scroll-mt-20"><User /> User Management</CardTitle>
                 <p className="text-sm text-muted-foreground">New users should sign up via the registration page.</p>
              </div>
              <CardDescription>View and manage all users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Firebase UID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role?.toLowerCase() === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{user.id}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Role
                            </DropdownMenuItem>
                            <Link href={`/my-tasks/${user.id}`} passHref>
                              <DropdownMenuItem>
                                <ListTodo className="mr-2 h-4 w-4" /> View Tasks
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => handleOpenDeleteAlert(user)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Key className="w-6 h-6 text-primary"/> Admin Powers</CardTitle>
              <CardDescription>Use this panel to navigate to different administrative sections and manage the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold">User & Team Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 space-y-3">
                    <p className="text-muted-foreground text-sm">Manage users, teams, and their permissions across the platform.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="#user-management-card"><Users className="mr-2 h-4 w-4"/>Manage Users</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/teams"><GanttChartSquare className="mr-2 h-4 w-4"/>Manage Teams</Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <LineChart className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Analytics & Reporting</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 space-y-3">
                    <p className="text-muted-foreground text-sm">Access global analytics, track performance, and generate reports.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard"><LineChart className="mr-2 h-4 w-4"/>Global Dashboard</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/reports"><ListChecks className="mr-2 h-4 w-4"/>Generate Reports</Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-semibold">System & Security</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 space-y-3">
                    <p className="text-muted-foreground text-sm">Configure system-wide settings and enforce security policies.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="#system-settings-card"><Settings className="mr-2 h-4 w-4"/>System Settings</a>
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <Shield className="mr-2 h-4 w-4"/>Audit Logs (Coming Soon)
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <ListChecks className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Task & Scenario Management</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6 space-y-3">
                    <p className="text-muted-foreground text-sm">Oversee task assignments, track milestones, and deploy scenarios.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/tasks"><ListChecks className="mr-2 h-4 w-4"/>Manage Tasks</Link>
                      </Button>
                       <Button variant="outline" size="sm" asChild>
                        <Link href="/my-tasks"><ListTodo className="mr-2 h-4 w-4"/>My Tasks</Link>
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        Scenario Deployment (Coming Soon)
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card id="system-settings-card" className="bg-card/60 backdrop-blur-xl scroll-mt-20">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Settings /> System Settings</CardTitle>
              <CardDescription>Configure global platform settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance-mode" className="cursor-pointer">Maintenance Mode</Label>
                <Switch id="maintenance-mode" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-mfa" className="cursor-pointer">Require Multi-Factor Authentication</Label>
                <Switch id="enable-mfa" checked={mfaRequired} onCheckedChange={setMfaRequired} />
              </div>
              <Button className="w-full" onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-xl">
              <CardHeader>
                  <CardTitle className="font-headline">Platform Analytics</CardTitle>
                  <CardDescription>High-level overview of platform usage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Active Users:</span> <strong>{users.length}</strong></div>
                  <div className="flex justify-between"><span>Reports Generated (24h):</span> <strong>15</strong></div>
                  <div className="flex justify-between"><span>API Usage:</span> <strong>78%</strong></div>
              </CardContent>
          </Card>
        </div>
      </div>

      <UserEditDialog 
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={editingUser}
        onSubmit={handleUserUpdate}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's data from the database, but it will not remove their authentication account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
