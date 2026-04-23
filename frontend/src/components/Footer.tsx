import { Link } from "@tanstack/react-router";
import { Phone, Mail, Award, Facebook, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="inline-block">
            <img 
               src="/logo.webp" 
               alt="IBT Beauty Academy" 
               className="h-20 w-auto object-contain transition-transform hover:scale-105 duration-300 mb-6" 
            />
          </Link>
          <p className="max-w-md text-sm leading-relaxed text-gray-400">
            IBT Beauty Academy is India's premier makeup education platform, offering world-class training in bridal, editorial, and everyday beauty. Empowering future artists with ISO-certified curriculum and expert guidance.
          </p>
          <div className="mt-8 flex gap-4">
             <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="h-5 w-5" />
             </a>
             <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="h-5 w-5" />
             </a>
             <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent transition-colors">
                <Youtube className="h-5 w-5" />
             </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase border-b border-accent w-fit pb-1 mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
            <li><Link to="/courses" className="hover:text-accent transition-colors">Our Courses</Link></li>
            <li><Link to="/dashboard" className="hover:text-accent transition-colors">Student Dashboard</Link></li>
            <li><Link to="/profile" className="hover:text-accent transition-colors">Profile Settings</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold tracking-widest uppercase border-b border-accent w-fit pb-1 mb-6">Connect</h4>
          <ul className="space-y-6 text-sm">
            <li className="flex items-start gap-3">
               <Phone className="h-5 w-5 text-accent mt-0.5" />
               <div>
                  <p className="font-bold text-white tracking-tight">(+91) 77700 10108</p>
                  <p className="text-xs text-gray-500">Available 10 AM - 7 PM</p>
               </div>
            </li>
            <li className="flex items-start gap-3">
               <Mail className="h-5 w-5 text-accent mt-0.5" />
               <div className="break-all">
                  <p className="font-bold text-white tracking-tight">ibtbeautyacademy@gmail.com</p>
                  <p className="text-xs text-gray-500">24/7 Email Support</p>
               </div>
            </li>
            <li className="flex items-start gap-3">
               <Award className="h-5 w-5 text-accent mt-0.5" />
               <div>
                  <p className="font-bold text-white tracking-tight">ISO 9001:2015</p>
                  <p className="text-xs text-gray-500">Certified Academy</p>
               </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/30">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-8 text-[11px] font-bold tracking-widest uppercase text-gray-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} IBT International Beauty Academy. All rights reserved.</p>
          <div className="flex gap-8">
             <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
