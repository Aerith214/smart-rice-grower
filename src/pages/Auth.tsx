import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const Auth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useSEO({
    title: "Login & Register - SmartRice",
    description: "Create your SmartRice account to track and optimize your farming activities.",
    canonicalPath: "/auth",
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect to main page if logged in
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Redirect to main page if already logged in
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Password validation utilities
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasLetter,
      hasNumber,
      hasSymbol,
      isValid: minLength && hasLetter && hasNumber && hasSymbol
    };
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async (formData: {
    fullName: string;
    email: string;
    password: string;
    contactNumber?: string;
    farmName?: string;
    farmLocation?: string;
  }) => {
    setLoading(true);
    
    try {
      // Validate email format
      if (!validateEmail(formData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password strength
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error("Password must be at least 8 characters with letters, numbers, and symbols");
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            contact_number: formData.contactNumber || '',
            farm_name: formData.farmName || '',
            farm_location: formData.farmLocation || ''
          }
        }
      });

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes("already registered")) {
          throw new Error("An account with this email already exists. Please try signing in instead.");
        }
        throw error;
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to confirm your account before signing in.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Please confirm your email address before signing in.");
        }
        throw error;
      }

      toast({
        title: "Login Successful!",
        description: "Welcome back to SmartRice!",
      });
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const SignInForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const emailValid = validateEmail(email);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setAttemptedSubmit(true);
      
      if (!emailValid) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      if (!password) {
        toast({
          title: "Validation Error",
          description: "Password is required",
          variant: "destructive",
        });
        return;
      }

      handleSignIn(email.trim(), password);
    };

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email Address</Label>
          <Input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={attemptedSubmit && !emailValid ? "border-destructive" : ""}
            required
          />
          {attemptedSubmit && email && !emailValid && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3 w-3" />
              Please enter a valid email address
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={attemptedSubmit && !password ? "border-destructive pr-10" : "pr-10"}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || (attemptedSubmit && (!emailValid || !password))}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    );
  };

  const SignUpForm = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [farmName, setFarmName] = useState("");
    const [farmLocation, setFarmLocation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const passwordValidation = validatePassword(password);
    const emailValid = validateEmail(email);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setAttemptedSubmit(true);
      
      if (!fullName.trim()) {
        toast({
          title: "Validation Error",
          description: "Full name is required",
          variant: "destructive",
        });
        return;
      }

      if (!emailValid) {
        toast({
          title: "Validation Error", 
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return;
      }

      if (!passwordValidation.isValid) {
        toast({
          title: "Validation Error",
          description: "Please ensure your password meets all requirements",
          variant: "destructive",
        });
        return;
      }

      handleSignUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        contactNumber: contactNumber.trim(),
        farmName: farmName.trim(),
        farmLocation: farmLocation.trim()
      });
    };

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-fullname">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signup-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className={attemptedSubmit && !fullName.trim() ? "border-destructive" : ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className={attemptedSubmit && !emailValid ? "border-destructive" : ""}
            required
          />
          {attemptedSubmit && email && !emailValid && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3 w-3" />
              Please enter a valid email address
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">
            Password <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className={attemptedSubmit && !passwordValidation.isValid ? "border-destructive pr-10" : "pr-10"}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          
          {/* Password requirements */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1">
              {passwordValidation.minLength ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordValidation.hasLetter ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={passwordValidation.hasLetter ? "text-green-600" : "text-muted-foreground"}>
                Contains letters
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordValidation.hasNumber ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                Contains numbers
              </span>
            </div>
            <div className="flex items-center gap-1">
              {passwordValidation.hasSymbol ? (
                <CheckCircle className="h-3 w-3 text-green-600" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground" />
              )}
              <span className={passwordValidation.hasSymbol ? "text-green-600" : "text-muted-foreground"}>
                Contains symbols (!@#$%^&*)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-contact">Contact Number (Optional)</Label>
          <Input
            id="signup-contact"
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Enter your contact number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-farm-name">Farm Name (Optional)</Label>
          <Input
            id="signup-farm-name"
            type="text"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
            placeholder="Enter your farm name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-farm-location">Farm Location (Optional)</Label>
          <Input
            id="signup-farm-location"
            type="text"
            value={farmLocation}
            onChange={(e) => setFarmLocation(e.target.value)}
            placeholder="Enter your farm location"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading || (attemptedSubmit && (!fullName.trim() || !emailValid || !passwordValidation.isValid))}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    );
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SmartRice</h1>
          <p className="text-muted-foreground">
            Join our platform to track your farming activities and optimize your harvests with data-driven insights.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to begin tracking your farming data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-6">
                <SignInForm />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-6">
                <SignUpForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Auth;