import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="container mx-auto flex items-center justify-between py-4">
        <a href="/" className="text-lg font-semibold tracking-tight">
          SmartRice
        </a>
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
        </div>
      </nav>
    </header>
  );
};

export default Header;
