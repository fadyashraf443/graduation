'use client';

import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, push, remove } from "firebase/database";
import { auth, db } from "@/lib/firebase";
import { LearningPathForm } from "@/components/learning/learning-path-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CertificationFormDialog } from "@/components/learning/certification-form-dialog";
import { CheckCircle, Zap, BookOpen, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import type { Certification } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function LearningPage() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const certsRef = ref(db, `learning/${user.uid}/certifications`);
        onValue(certsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const certsList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setCertifications(certsList);
          } else {
            setCertifications([]);
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
        setCertifications([]);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const handleOpenForm = (cert: Certification | null) => {
    setEditingCert(cert);
    setIsFormOpen(true);
  };

  const handleCertSubmit = async (data: Omit<Certification, 'id'>, id?: string) => {
    if (!currentUser) return;
    
    const certData = {
        name: data.name,
        status: data.status,
        progress: data.progress || 0,
        date: data.date || ''
    };

    try {
        if (id) {
          await set(ref(db, `learning/${currentUser.uid}/certifications/${id}`), certData);
          toast({ title: "Certification updated!" });
        } else {
          const newCertRef = push(ref(db, `learning/${currentUser.uid}/certifications`));
          await set(newCertRef, certData);
          toast({ title: "Certification added!" });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not save certification.'});
    }
  };

  const handleOpenDeleteAlert = (certId: string) => {
    setDeletingCertId(certId);
    setIsAlertOpen(true);
  };

  const handleDeleteCert = async () => {
    if (!deletingCertId || !currentUser) return;
    try {
        await remove(ref(db, `learning/${currentUser.uid}/certifications/${deletingCertId}`));
        toast({ title: "Certification deleted." });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete certification.'});
    }
    setDeletingCertId(null);
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="md:col-span-1">
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="mb-6">
              <h1 className="font-headline text-3xl font-bold">Adaptive Learning Paths</h1>
              <p className="text-muted-foreground">AI-curated learning paths based on your role, skills, and career goals.</p>
          </div>
          <LearningPathForm currentUser={currentUser} />
        </div>
        <div className="md:col-span-1">
          <Card className="bg-card/60 backdrop-blur-xl">
              <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="text-primary"/>
                      <CardTitle className="font-headline">
                          Certification Tracking
                      </CardTitle>
                    </div>
                    <Button size="sm" onClick={() => handleOpenForm(null)} disabled={!currentUser}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                  <CardDescription>Monitor your certification progress.</CardDescription>
              </CardHeader>
              <CardContent>
                  {!currentUser ? (
                    <p className="text-sm text-muted-foreground">Please log in to track certifications.</p>
                  ) : certifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No certifications added yet.</p>
                  ) : (
                    <ul className="space-y-4">
                        {certifications.map(cert => (
                            <li key={cert.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{cert.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {cert.status === "Completed" ? `Completed on ${cert.date}` :
                                        cert.status === "In Progress" ? `${cert.progress}% Complete` :
                                        `Planned for ${cert.date}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {cert.status === 'Completed' ? (
                                      <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : cert.status === 'In Progress' ? (
                                      <Zap className="h-5 w-5 text-yellow-500" />
                                  ) : (
                                      <div className="h-5 w-5" />
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleOpenForm(cert)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleOpenDeleteAlert(cert.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                            </li>
                        ))}
                    </ul>
                  )}
              </CardContent>
          </Card>
        </div>
      </div>
      <CertificationFormDialog 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSubmit={handleCertSubmit} 
        cert={editingCert} 
      />
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the certification from your tracking list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCert} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
