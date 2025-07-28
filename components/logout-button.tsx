"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({ 
  variant = "destructive", 
  size = "default", 
  showIcon = true,
  className = ""
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        // You could add toast notification here
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={logout} 
      variant={variant}
      size={size}
      disabled={isLoading}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
