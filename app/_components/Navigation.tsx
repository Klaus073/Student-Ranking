"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/analytics", label: "Analytics & Rankings" },
  { href: "/trends", label: "Trends" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide navigation on authentication pages (/auth/*)
  if (pathname.startsWith("/auth")) {
    return null;
  }
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string; full_name?: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile');
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

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
          
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 h-auto px-3 py-2"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-300">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getUserEmail()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-gray-900 border-gray-700 shadow-xl" 
              align="end"
              sideOffset={5}
            >
              <DropdownMenuLabel className="text-gray-300">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem 
                onClick={handleEditProfile}
                className="flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-700" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                disabled={isLoading}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoading ? 'Signing out...' : 'Sign Out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
} 