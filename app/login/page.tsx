
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Chrome } from "lucide-react";

export default function LoginPage() {
    const { signIn } = useAuth();
    
    return (
        <main className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">
                        ListWise
                    </h1>
                    <CardTitle className="text-2xl pt-4">Sign In</CardTitle>
                    <CardDescription>Sign in with your Google account to continue.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={signIn}>
                        <Chrome className="mr-2 h-4 w-4" />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </main>
    )
}
