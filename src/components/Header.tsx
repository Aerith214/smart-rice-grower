import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { to: "/map", label: "Map" },
    { to: "/rainfall", label: "Rainfall Data" },
    { to: "/recommendation", label: "Recommendation" },
    { to: "/cropping-calendar", label: "Cropping Calendar" },
    { to: "/smart-system", label: "Smart System" },
    { to: "/harvest-logger", label: "Harvest Logger" },
    { to: "/harvest-comparison", label: "Analysis" },
    { to: "/typhoon-tracker", label: "Typhoon Tracker" },
    { to: "/profile", label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin", label: "Admin Panel" },
    { to: "/user-management", label: "User Management" },
  ];

  return (
    <header className="relative bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <nav className="relative container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-4">
          <a 
            href="/" 
            className="text-2xl font-bold tracking-tight hover:scale-105 transition-transform duration-200 drop-shadow-md"
          >
            🌾 SmartRice
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {user && navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "relative transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium",
                  "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
                  isActive 
                    ? "bg-white/20 text-white shadow-md before:bg-white/10 backdrop-blur-sm" 
                    : "text-white/90 hover:text-white hover:bg-white/10 before:hover:bg-white/5"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              {!loading && isAdmin && adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "relative transition-all duration-300 px-4 py-2 rounded-lg text-sm font-medium",
                      "before:absolute before:inset-0 before:rounded-lg before:transition-all before:duration-300",
                      "bg-gradient-to-r from-admin-primary to-admin-glow",
                      isActive 
                        ? "shadow-lg scale-105" 
                        : "opacity-90 hover:opacity-100 hover:scale-105"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Registration Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm flex items-center gap-1 transition-all duration-300 hover:scale-105"
                  >
                    Registration
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border shadow-xl z-50 min-w-[200px]">
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/user-auth" 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all duration-200 bg-gradient-to-r from-user-primary to-user-glow text-white hover:shadow-lg cursor-pointer"
                    >
                      <span className="text-lg">👤</span>
                      <span className="font-medium">Register as User</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/admin-auth" 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all duration-200 bg-gradient-to-r from-admin-primary to-admin-glow text-white hover:shadow-lg cursor-pointer mt-2"
                    >
                      <span className="text-lg">👨‍💼</span>
                      <span className="font-medium">Register as Admin</span>
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Login Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm flex items-center gap-1 transition-all duration-300 hover:scale-105"
                  >
                    Login
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border border-border shadow-xl z-50 min-w-[200px]">
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/user-auth" 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all duration-200 bg-gradient-to-r from-user-primary to-user-glow text-white hover:shadow-lg cursor-pointer"
                    >
                      <span className="text-lg">👤</span>
                      <span className="font-medium">Login as User</span>
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/admin-auth" 
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all duration-200 bg-gradient-to-r from-admin-primary to-admin-glow text-white hover:shadow-lg cursor-pointer mt-2"
                    >
                      <span className="text-lg">👨‍💼</span>
                      <span className="font-medium">Login as Admin</span>
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary/95 backdrop-blur-md border-t border-white/20 shadow-xl">
          <div className="container mx-auto py-4 px-4 space-y-2">
            {user && navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-white/20 text-white shadow-md" 
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user ? (
              <>
                {!loading && isAdmin && adminLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        "bg-gradient-to-r from-admin-primary to-admin-glow text-white",
                        isActive 
                          ? "shadow-lg" 
                          : "opacity-90 hover:opacity-100"
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="px-4 py-2 text-sm font-semibold text-white/80">Registration</div>
                <NavLink
                  to="/user-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-user-primary to-user-glow text-white hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium">Register as User</span>
                </NavLink>
                <NavLink
                  to="/admin-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-admin-primary to-admin-glow text-white hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-lg">👨‍💼</span>
                  <span className="font-medium">Register as Admin</span>
                </NavLink>
                
                <div className="px-4 py-2 text-sm font-semibold text-white/80 mt-4">Login</div>
                <NavLink
                  to="/user-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-user-primary to-user-glow text-white hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium">Login as User</span>
                </NavLink>
                <NavLink
                  to="/admin-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-admin-primary to-admin-glow text-white hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-lg">👨‍💼</span>
                  <span className="font-medium">Login as Admin</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
