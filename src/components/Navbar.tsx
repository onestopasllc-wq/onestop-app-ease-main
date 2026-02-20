import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/Application_Services-removebg-preview.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/appointment", label: "Book Now" },
    { to: "/testimonials", label: "Testimonials" },
    { to: "/faq", label: "FAQ" },
    { to: "/job", label: "Jobs" },
    { to: "/contact", label: "Contact" },
  ];

  const moreLinks = [
    { to: "/dealerships", label: "Auto Dealers" },
    { to: "/insurance", label: "Insurance" },
    { to: "/health-insurance", label: "Health Insurance" },
    { to: "/rentals", label: "Rentals" },
    { to: "/community-services", label: "Community Services" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center overflow-visible">
            <img
              src={logo}
              alt="OneStop logo"
              className="h-16 md:h-20 lg:h-24 w-auto rounded-sm object-cover transform scale-125 md:scale-150 -ml-2 md:-ml-3"
              style={{ transformOrigin: "left center" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive(link.to) ? "default" : "ghost"}
                  className="transition-smooth"
                >
                  {link.label}
                </Button>
              </Link>
            ))}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="transition-smooth flex items-center gap-1">
                  More <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.to} asChild>
                    <Link
                      to={link.to}
                      className={`w-full cursor-pointer ${isActive(link.to) ? "bg-accent" : ""
                        }`}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent transition-smooth"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                  <Button
                    variant={isActive(link.to) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}

              <div className="pt-2 border-t border-border/50">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  More
                </p>
                {moreLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive(link.to) ? "default" : "ghost"}
                      className="w-full justify-start pl-8"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
