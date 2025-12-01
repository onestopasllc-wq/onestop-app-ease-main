import { Mail, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">OneStop Application Services LLC</h3>
            <p className="text-primary-foreground/80">
              We make applying easy! 🎓💼
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <Link to="/job" className="block text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                Jobs
              </Link>
              <a
                href="tel:+15716604984"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
              >
                <Phone size={18} />
                <span>+1 (571) 660-4984</span>
              </a>
              <a
                href="mailto:onestopapplicationservicesllc@gmail.com"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-smooth break-all"
              >
                <Mail size={18} />
                <span>onestopapplicationservicesllc@gmail.com</span>
              </a>
              <a
                href="https://t.me/OneStop_Application_Services_LLC"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
              >
                <Send size={18} />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Location</h4>
            <p className="text-primary-foreground/80">
              Virtual Office
              <br />
              Woodbridge, VA
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} OneStop Application Services LLC. All rights reserved.</p>
        </div>
        {/* Powered by */}
        <div className="border-t border-primary-foreground/20 pt-4 text-center text-primary-foreground/60 mt-4">
          <p>
            Powered by{" "}
            <a
              href="tel:+251913901952"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-foreground transition-smooth"
            >
              Haileab Shimels
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
