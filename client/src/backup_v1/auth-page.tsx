import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
    const { loginMutation, registerMutation, user } = useAuth();
    const [, setLocation] = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    if (user) {
        setLocation("/");
        return null;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ username, password });
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        registerMutation.mutate({ username, password, firstName, lastName });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 animate-in fade-in duration-500">
            <Card className="w-full max-w-md shadow-lg border-border">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold font-display">Welcome to Locana</CardTitle>
                    <CardDescription>
                        Sign in to connect with your community
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Register</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {loginMutation.isError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {loginMutation.error?.message || "Invalid credentials"}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
                                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Login
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-username">Username</Label>
                                    <Input
                                        id="reg-username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reg-password">Password</Label>
                                    <Input
                                        id="reg-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {registerMutation.isError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {registerMutation.error?.message || "Registration failed"}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
                                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" className="text-muted-foreground text-xs" onClick={() => setLocation("/")}>
                        Back to Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
