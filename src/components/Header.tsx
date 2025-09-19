import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-semibold tracking-tight">
            SmartRice
          </a>
        </div>
        <div className="flex items-center gap-6">
          <NavLink
            to="/map"
            className={({ isActive }) =>
              cn(
                "transition-opacity",
                isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
              )
            }
          >
            Map
          </NavLink>
          <NavLink
            to="/rainfall"
            className={({ isActive }) =>
              cn(
                "transition-opacity",
                isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
              )
            }
          >
            Rainfall Data
          </NavLink>
          <NavLink
            to="/recommendation"
            className={({ isActive }) =>
              cn(
                "transition-opacity",
                isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
              )
            }
          >
            Recommendation
          </NavLink>
          <NavLink
            to="/cropping-calendar"
            className={({ isActive }) =>
              cn(
                "transition-opacity",
                isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
              )
            }
          >
            Cropping Calendar
          </NavLink>
           <NavLink
             to="/smart-system"
             className={({ isActive }) =>
               cn(
                 "transition-opacity",
                 isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
               )
             }
           >
             Smart System
           </NavLink>
           <NavLink
             to="/harvest-logger"
             className={({ isActive }) =>
               cn(
                 "transition-opacity",
                 isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
               )
             }
           >
             Harvest Logger
           </NavLink>
           <NavLink
             to="/harvest-comparison"
             className={({ isActive }) =>
               cn(
                 "transition-opacity",
                 isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
               )
             }
           >
             Analysis
           </NavLink>
           <NavLink
             to="/profile"
             className={({ isActive }) =>
               cn(
                 "transition-opacity",
                 isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
               )
             }
           >
             Profile
           </NavLink>
           {user ? (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "transition-opacity",
                    isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
                  )
                }
              >
                Admin
              </NavLink>
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
             <>
               <NavLink
                 to="/user-auth"
                 className={({ isActive }) =>
                   cn(
                     "transition-opacity",
                     isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
                   )
                 }
               >
                 User Login
               </NavLink>
               <NavLink
                 to="/admin-auth"
                 className={({ isActive }) =>
                   cn(
                     "transition-opacity",
                     isActive ? "opacity-100 underline" : "opacity-80 hover:opacity-100"
                   )
                 }
               >
                 Admin
               </NavLink>
             </>
           )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
