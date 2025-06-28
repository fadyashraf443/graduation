'use client';
import { ChatInterface } from "@/components/collaboration/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { File, History, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function CollaborationPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // We just need to know if there is a user to stop loading,
      // the chat interface will handle the rest.
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-[600px] w-full" />
  }

  return (
    <div>
        <div className="mb-6">
            <h1 className="font-headline text-3xl font-bold">Advanced Collaboration</h1>
            <p className="text-muted-foreground">Communicate with your teams in dedicated, real-time channels.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <ChatInterface />
            </div>
            <div className="md:col-span-1 space-y-6">
                 <Card className="bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Users className="text-primary"/> Team Channels</CardTitle>
                        <CardDescription>You will only see channels for teams you are a part of, plus the public #general channel.</CardDescription>
                    </CardHeader>
                </Card>
                <Card className="bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><File className="text-primary"/> Shared Files</CardTitle>
                        <CardDescription>Central repository with version control.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul>
                            <li className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                                <span>pentest_report_q2.docx</span>
                                <span className="text-xs text-muted-foreground">v2.1</span>
                            </li>
                            <li className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                                <span>incident_response_playbook.pdf</span>
                                <span className="text-xs text-muted-foreground">v1.8</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><History className="text-primary"/> Version History</CardTitle>
                        <CardDescription>Track changes to documents.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Alex Johnson</span> updated <span className="font-semibold text-foreground">pentest_report_q2.docx</span>.
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
