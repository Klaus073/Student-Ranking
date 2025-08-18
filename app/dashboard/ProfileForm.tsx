"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Briefcase, Users, TrendingUp, Trophy, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ActivityRow = { activity_type: string; description: string | null; created_at: string };

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  const intervals: [number, string][] = [
    [60, "sec"],
    [60, "min"],
    [24, "hr"],
    [7, "day"],
    [4.345, "wk"],
    [12, "mo"],
  ];
  let value = seconds;
  let unit = "sec";
  for (const [div, name] of intervals) {
    if (value < div) { unit = name; break; }
    value = Math.floor(value / div);
    unit = name;
  }
  return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
}

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<ActivityRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        if (!userId) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('student_activity_log')
          .select('activity_type, description, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(7);
        if (error) setError(error.message); else setUpdates(data || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Recent Updates */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Updates</h3>
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        
        <div className="space-y-4">
          {loading && <div className="h-12 bg-gray-800/50 rounded" />}
          {error && <div className="text-sm text-red-400">{error}</div>}
          {!loading && !error && updates.length === 0 && (
            <div className="text-sm text-gray-400">No recent activity</div>
          )}
          {updates.map((u, index) => {
            const Icon = u.activity_type === 'internship' ? Briefcase 
              : u.activity_type === 'society' ? Users
              : u.activity_type === 'award' ? Trophy
              : u.activity_type === 'certification' ? Award
              : BookOpen;
            return (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300 border border-transparent hover:border-gray-700">
                <div className={`p-2 rounded-lg bg-gray-800/50 border border-gray-700`}>
                  <Icon className={`h-4 w-4 text-white`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white mb-1">{u.description || u.activity_type}</p>
                  <p className="text-xs text-gray-400">{timeAgo(u.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
} 