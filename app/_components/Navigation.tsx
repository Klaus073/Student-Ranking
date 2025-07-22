"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics & Rankings" },
  { href: "/profile", label: "Profile" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  
  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-gray-800 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and nav */}
        <div className="flex items-center space-x-8">
          {/* StudentRank Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-300 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-black font-bold text-sm">SR</span>
            </div>
            <span className="text-xl font-semibold text-white">StudentRank</span>
          </div>
          
          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost"
                  className={pathname === item.href 
                    ? "bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-gray-300 shadow-md" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                  }
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Right side - User actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300">
            <Bell className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-300">
              {user?.email?.split('@')[0] || user?.user_metadata?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
} 