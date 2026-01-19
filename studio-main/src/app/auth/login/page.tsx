'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chrome, Mail, Lock, User, ArrowRight, Activity } from 'lucide-react';
import { registerUser } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleCredentialsLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast({
                    title: 'Login Failed',
                    description: 'Invalid email or password.',
                    variant: 'destructive',
                });
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await registerUser(data);
            if (result.error) {
                toast({
                    title: 'Registration Failed',
                    description: result.error,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Success!',
                    description: result.message,
                });
                // Switch to login tab
                const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                loginTab?.click();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-primary/5 p-4 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-lg z-10 space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
                        <Activity className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Sanjeevani
                    </h1>
                    <p className="text-muted-foreground text-lg">Your Complete Healthcare Platform</p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="login" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="register" className="rounded-lg py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">
                            Create Account
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 animate-in fade-in duration-500">
                        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                                <CardDescription>Enter your credentials to access your health profile</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleCredentialsLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" name="email" type="email" placeholder="name@example.com" className="pl-10" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            <Button variant="link" className="px-0 font-normal text-xs h-auto">Forgot password?</Button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" required />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 group" disabled={loading}>
                                        {loading ? "Signing in..." : "Sign In"}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <div className="relative w-full py-2">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" type="button" className="w-full py-6 border-border/50 hover:bg-muted/50 transition-colors" onClick={handleGoogleLogin}>
                                        <Chrome className="mr-2 h-5 w-5" />
                                        Google Account
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                        <Card className="border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-2xl">Get Started</CardTitle>
                                <CardDescription>Join Sanjeevani for personalized healthcare insights</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleRegister}>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name *</Label>
                                            <Input id="firstName" name="firstName" placeholder="John" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name *</Label>
                                            <Input id="lastName" name="lastName" placeholder="Doe" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="middleName">Middle Name (Optional)</Label>
                                        <Input id="middleName" name="middleName" placeholder="Middle" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="reg-email" name="email" type="email" placeholder="name@example.com" className="pl-10" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="reg-password" name="password" type="password" placeholder="Create a strong password" className="pl-10" required />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 group" disabled={loading}>
                                        {loading ? "Creating Account..." : "Create Account"}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                    <Button variant="outline" type="button" className="w-full py-6 border-border/50" onClick={handleGoogleLogin}>
                                        <Chrome className="mr-2 h-5 w-5" />
                                        Sign up with Google
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>

                <p className="text-center text-xs text-muted-foreground px-8">
                    By clicking continue, you agree to our{' '}
                    <Button variant="link" className="px-0 text-xs text-primary h-auto font-normal">Terms of Service</Button>
                    {' '}and{' '}
                    <Button variant="link" className="px-0 text-xs text-primary h-auto font-normal">Privacy Policy</Button>.
                </p>
            </div>
        </div>
    );
}
