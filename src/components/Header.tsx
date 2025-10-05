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
    <header className="bg-primary text-primary-foreground shadow-lg">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center gap-4">
          <a href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            SmartRice
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
                  "transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium",
                  isActive 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
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
                      "transition-all duration-200 px-3 py-2 rounded-md text-sm font-medium",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
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
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Registration Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-1"
                  >
                    Registration
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border border-border shadow-lg">
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/user-auth" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-user-accent hover:bg-user-accent/10 cursor-pointer"
                    >
                      Register as User
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/admin-auth" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-admin-accent hover:bg-admin-accent/10 cursor-pointer"
                    >
                      Register as Admin
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
                    className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-1"
                  >
                    Login
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border border-border shadow-lg">
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/user-auth" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-user-accent hover:bg-user-accent/10 cursor-pointer"
                    >
                      Login as User
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink 
                      to="/admin-auth" 
                      className="flex items-center gap-2 w-full px-3 py-2 text-admin-accent hover:bg-admin-accent/10 cursor-pointer"
                    >
                      Login as Admin
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
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-primary/95 backdrop-blur-sm border-t border-primary-foreground/20">
          <div className="container mx-auto py-4 px-4 space-y-2">
            {user && navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary-foreground/20 text-primary-foreground" 
                      : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
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
                        "block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
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
                  className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm font-medium text-primary-foreground/60">Registration</div>
                <NavLink
                  to="/user-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-sm text-user-accent hover:bg-user-accent/10 rounded-md"
                >
                  Register as User
                </NavLink>
                <NavLink
                  to="/admin-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-sm text-admin-accent hover:bg-admin-accent/10 rounded-md"
                >
                  Register as Admin
                </NavLink>
                
                <div className="px-3 py-2 text-sm font-medium text-primary-foreground/60 mt-4">Login</div>
                <NavLink
                  to="/user-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-sm text-user-accent hover:bg-user-accent/10 rounded-md"
                >
                  Login as User
                </NavLink>
                <NavLink
                  to="/admin-auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-2 text-sm text-admin-accent hover:bg-admin-accent/10 rounded-md"
                >
                  Login as Admin
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
