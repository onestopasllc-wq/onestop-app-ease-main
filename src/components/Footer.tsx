import { Mail, Phone, Send, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/Application_Services-removebg-preview.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 mt-20 border-t border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-5 lg:col-span-4">
            <Link to="/" className="inline-block mb-6 transition-opacity hover:opacity-90">
              <img
                src={logo}
                alt="OneStop Logo"
                className="h-16 md:h-20 w-auto brightness-0 invert object-contain"
              />
            </Link>
            <p className="text-primary-foreground/80 text-base md:text-lg leading-relaxed max-w-sm mb-6">
              Empowering your future with professional application services. We provide expert guidance and streamlined solutions for your career and academic journey.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-foreground/30"></span>
            </h4>
            <nav className="flex flex-col space-y-4">
              <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth flex items-center gap-2">
                Home
              </Link>
              <Link to="/services" className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth flex items-center gap-2">
                Our Services
              </Link>
              <Link to="/job" className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth flex items-center gap-2">
                Job Opportunities
              </Link>
              <Link to="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth flex items-center gap-2">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 lg:col-span-5">
            <h4 className="text-lg font-semibold mb-6 relative inline-block">
              Get In Touch
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-foreground/30"></span>
            </h4>
            <div className="space-y-4">
              <a
                href="tel:+15716604984"
                className="flex items-center space-x-3 text-primary-foreground/70 hover:text-primary-foreground transition-smooth group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Phone size={18} />
                </div>
                <span className="text-lg">+1 (571) 660-4984</span>
              </a>
              <a
                href="mailto:Info@onestopasllc.com"
                className="flex items-center space-x-3 text-primary-foreground/70 hover:text-primary-foreground transition-smooth group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Mail size={18} />
                </div>
                <span className="text-lg">Info@onestopasllc.com</span>
              </a>
              <a
                href="https://t.me/OneStop_Application_Services_LLC"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 text-primary-foreground/70 hover:text-primary-foreground transition-smooth group"
              >
                <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Send size={18} />
                </div>
                <span className="text-lg">Telegram Support</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4 text-primary-foreground/50 text-sm">
          <p>&copy; {new Date().getFullYear()} OneStop Application Services LLC. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <a
              href="tel:+251913901952"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground/70 hover:text-primary-foreground hover:underline transition-smooth flex items-center gap-1"
            >
              Haileab Shimels <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

