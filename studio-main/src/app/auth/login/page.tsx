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
        <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
            {/* Left Section - Tree Illustration (Visible on Desktop) */}
            <div className="hidden lg:flex flex-1 items-center justify-center bg-white p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
                </div>
                <div className="relative w-full max-w-[85%] max-h-[80vh] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-700">
                    <img
                        src="/tree-logo.png"
                        alt="Sanjeevani Tree Illustration"
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </div>
            </div>

            {/* Right Section - Auth Forms with Gradient Background */}
            <div className="flex-1 bg-gradient-to-br from-[#5a7247] via-[#4d6340] to-[#3d5430] flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
                {/* Butterfly Decoration */}
                <div className="absolute top-[10%] right-[10%] opacity-20 transform rotate-12 pointer-events-none hidden sm:block">
                    <Activity className="h-48 w-48 text-white" />
                </div>

                <div className="w-full max-w-lg z-10 space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <h1 className="text-5xl sm:text-6xl font-serif font-medium text-[#f5f5dc] tracking-widest drop-shadow-md">
                                Sanjeevani
                            </h1>
                            <div className="absolute -top-8 -right-8 animate-bounce delay-1000">
                                <svg viewBox="0 0 40 35" className="h-10 w-10 drop-shadow-lg">
                                    {/* Left wing */}
                                    <ellipse cx="12" cy="15" rx="10" ry="12" fill="#f5a623" transform="rotate(-15 12 15)" />
                                    <ellipse cx="12" cy="15" rx="7" ry="9" fill="#e8941c" transform="rotate(-15 12 15)" />
                                    <ellipse cx="10" cy="12" rx="3" ry="4" fill="#ffcc66" transform="rotate(-15 10 12)" />
                                    {/* Right wing */}
                                    <ellipse cx="28" cy="15" rx="10" ry="12" fill="#f5a623" transform="rotate(15 28 15)" />
                                    <ellipse cx="28" cy="15" rx="7" ry="9" fill="#e8941c" transform="rotate(15 28 15)" />
                                    <ellipse cx="30" cy="12" rx="3" ry="4" fill="#ffcc66" transform="rotate(15 30 12)" />
                                    {/* Body */}
                                    <ellipse cx="20" cy="18" rx="2.5" ry="10" fill="#4a3728" />
                                    {/* Head */}
                                    <circle cx="20" cy="7" r="3" fill="#4a3728" />
                                    {/* Antennae */}
                                    <path d="M18 5 Q15 2 13 3" stroke="#4a3728" strokeWidth="1" fill="none" strokeLinecap="round" />
                                    <path d="M22 5 Q25 2 27 3" stroke="#4a3728" strokeWidth="1" fill="none" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <div className="h-px w-16 bg-[#f5f5dc]/30 mx-auto" />
                        <p className="text-[#f5f5dc]/80 text-xl font-display italic">Your Complete Healthcare Platform</p>
                    </div>

                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                            <TabsTrigger
                                value="login"
                                className="rounded-xl py-3.5 text-[#f5f5dc]/70 data-[state=active]:bg-[#f5f5dc] data-[state=active]:text-[#3d5430] data-[state=active]:shadow-xl transition-all duration-500 font-medium"
                            >
                                Sign In
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-xl py-3.5 text-[#f5f5dc]/70 data-[state=active]:bg-[#f5f5dc] data-[state=active]:text-[#3d5430] data-[state=active]:shadow-xl transition-all duration-500 font-medium"
                            >
                                Join Us
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login" className="space-y-4 outline-none">
                            <Card className="border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[#f5f5dc]">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-3xl font-serif text-[#f5f5dc]">Welcome Back</CardTitle>
                                    <CardDescription className="text-[#f5f5dc]/60">Login to your personalized health portal</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCredentialsLogin}>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-[#f5f5dc]/80 font-medium">Email Address</Label>
                                            <div className="relative group">
                                                <Mail className="absolute left-3 top-3.5 h-4.5 w-4.5 text-[#f5f5dc]/40 group-focus-within:text-[#f5f5dc] transition-colors" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#f5f5dc]/30 rounded-xl transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-[#f5f5dc]/80 font-medium">Password</Label>
                                                <Button variant="link" className="px-0 font-normal text-xs h-auto text-[#f5f5dc]/50 hover:text-[#f5f5dc]">Forgot password?</Button>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-3.5 h-4.5 w-4.5 text-[#f5f5dc]/40 group-focus-within:text-[#f5f5dc] transition-colors" />
                                                <Input
                                                    id="password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#f5f5dc]/30 rounded-xl transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-6 mt-4">
                                        <Button className="w-full h-14 text-lg font-display font-semibold bg-[#f5f5dc] text-[#3d5430] hover:bg-white hover:scale-[1.02] transition-all rounded-2xl shadow-xl shadow-black/20" disabled={loading}>
                                            {loading ? "Verifying..." : "Sign In"}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                        <div className="relative w-full py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t border-white/10" />
                                            </div>
                                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                                <span className="bg-transparent px-4 text-[#f5f5dc]/30">social secure login</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            className="w-full h-14 border-white/20 bg-white/5 hover:bg-white/10 text-[#f5f5dc] rounded-2xl transition-all flex items-center justify-center gap-3"
                                            onClick={handleGoogleLogin}
                                        >
                                            <Chrome className="h-5 w-5" />
                                            Google Account
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>

                        <TabsContent value="register" className="space-y-4 outline-none">
                            <Card className="border-white/10 bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-[#f5f5dc]">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-3xl font-serif text-[#f5f5dc]">Create Account</CardTitle>
                                    <CardDescription className="text-[#f5f5dc]/60">Start your journey to holistic health today</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleRegister}>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-[#f5f5dc]/80">First Name</Label>
                                                <Input id="firstName" name="firstName" placeholder="John" className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 rounded-xl" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-[#f5f5dc]/80">Last Name</Label>
                                                <Input id="lastName" name="lastName" placeholder="Doe" className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 rounded-xl" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-email" className="text-[#f5f5dc]/80">Email Address</Label>
                                            <Input id="reg-email" name="email" type="email" placeholder="name@example.com" className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 rounded-xl" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reg-password" className="text-[#f5f5dc]/80">Password</Label>
                                            <Input id="reg-password" name="password" type="password" placeholder="Create strong password" className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/20 rounded-xl" required />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4 mt-2">
                                        <Button className="w-full h-14 text-lg font-display font-semibold bg-[#f5f5dc] text-[#3d5430] hover:bg-white hover:scale-[1.02] transition-all rounded-2xl shadow-xl shadow-black/20" disabled={loading}>
                                            {loading ? "Creating..." : "Register Now"}
                                        </Button>
                                        <p className="text-center text-[10px] text-[#f5f5dc]/40 px-4">
                                            By registering, you agree to the Sanjeevani Privacy Policy and Terms of Use.
                                        </p>
                                    </CardFooter>
                                </form>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Corner Leaf Decoration */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    );
}
