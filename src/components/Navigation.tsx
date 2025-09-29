import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
// import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
 

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Virtual Tours", path: "/tours" },
    { name: "Digital Archives", path: "/archives" },
    { name: "Interactive Map", path: "/map" },
    { name: "Cultural Calendar", path: "/calendar" },
    { name: "Audio Guides", path: "/audio-guides" },
    { name: "Emergency", path: "/emergency" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#f3eee4]/95 via-[#f2eee9]/90 to-[#dde4e7]/90 dark:from-zinc-900/80 dark:via-zinc-900/70 dark:to-zinc-900/80 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-16 px-2">
        {/* Left side with Logo */}
        <div className="">
          <Link to="/" className="flex items-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-500">
              Monastery360
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center ml-auto">
          {/* Navigation Links */}
          <div className="flex items-center mr-24">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-[#f97316] px-5 ${
                  location.pathname === item.path 
                    ? "text-[#f97316]" 
                    : "text-[#736a63]"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pl-5 flex items-center gap-1">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden pr-0 ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-50 bg-background/95 backdrop-blur-lg border-t border-border shadow-lg p-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col items-start text-left space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block w-full py-2 text-base font-medium transition-colors ${
                  location.pathname === item.path 
                    ? "text-orange-500" 
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};