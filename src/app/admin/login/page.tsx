'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const email = 'flflshrshr3@gmail.com';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the entire user object to check the role
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const userData = snapshot.val();

      if (snapshot.exists() && userData && userData.role && userData.role.toLowerCase() === 'admin') {
        router.push('/admin');
      } else {
        // Log the received data for debugging and provide a more helpful error
        console.error('Admin role check failed. Data received from DB:', userData);
        setError('Login successful, but you lack admin privileges. Please verify your role in the Realtime Database and check your database security rules.');
        await signOut(auth);
      }
    } catch (err: any) {
        if (err.code === 'auth/invalid-credential') {
            setError('Invalid admin credentials. Please double-check your password. This error can also occur if the admin user account has not been created in your Firebase project or if the Email/Password sign-in method is disabled.');
        } else {
            setError('An unexpected error occurred. Please try again.');
        }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 w-[50rem] h-[50rem] -translate-x-1/2 -translate-y-1/2 bg-primary/10 rounded-full blur-[200px] -z-1"></div>
      
      <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-border/20 shadow-2xl shadow-primary/10">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center gap-2 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-headline font-bold text-foreground">CyberStack AI</h1>
          </div>
          <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your admin credentials to access the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/" className="font-medium text-primary hover:underline">
              Return to user login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
