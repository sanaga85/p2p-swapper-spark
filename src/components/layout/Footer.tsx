
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Mail, GithubIcon } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-12 mt-12">
      <div className="container mx-auto px-4 grid gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">Sparrow</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            Connecting travelers and shoppers around the world. Find reliable people to deliver your desired items.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <GithubIcon className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4">For Shoppers</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/browse-requests" className="text-muted-foreground hover:text-primary transition-colors">
                Post a Request
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                Pricing & Fees
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4">For Travelers</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/my-travels" className="text-muted-foreground hover:text-primary transition-colors">
                Post Your Travel
              </Link>
            </li>
            <li>
              <Link to="/earn" className="text-muted-foreground hover:text-primary transition-colors">
                Earn Extra
              </Link>
            </li>
            <li>
              <Link to="/traveler-guidelines" className="text-muted-foreground hover:text-primary transition-colors">
                Guidelines
              </Link>
            </li>
            <li>
              <Link to="/success-stories" className="text-muted-foreground hover:text-primary transition-colors">
                Success Stories
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-8 mt-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} Sparrow. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
