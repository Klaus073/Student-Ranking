"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type RankingRow = {
  user_id: string;
  academic: number;
  experience: number;
  composite: number;
  stars: number | string;
  rank: number | null;
};

type ProfileRow = { full_name: string | null; university: string | null; current_year: number | null } | null;

function CircularProgress({ value, size = 120, strokeWidth = 8, color = "#ffffff" }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#333333"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
    </div>
  );
}

export default function UserSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [row, setRow] = useState<RankingRow | null>(null);
  const [profile, setProfile] = useState<ProfileRow>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

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

        const rankingPromise = supabase
          .from("student_rankings")
          .select("user_id, academic, experience, composite, stars, rank")
          .eq("user_id", userId)
          .single();

        const profilePromise = supabase
          .from("student_profiles")
          .select("full_name, university, current_year")
          .eq("user_id", userId)
          .single();

        // Count ranked users for "out of N"
        const countPromise = supabase
          .from('student_rankings')
          .select('user_id', { count: 'exact', head: true })
          .not('rank', 'is', null);

        const [{ data: ranking, error: rankingError }, { data: profileRow, error: profileError }, { count: rankedCount }] = await Promise.all([rankingPromise, profilePromise, countPromise]);

        if (rankingError) setError(rankingError.message); else setRow(ranking as unknown as RankingRow);
        if (!profileError) setProfile((profileRow as any) ?? null);
        setTotalUsers(rankedCount || 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const academicScore = row?.academic ?? 0;
  const experienceScore = row?.experience ?? 0;
  const compositeScore = row?.composite ?? 0;
  const rank = row?.rank ?? undefined;
  const starsNumeric = (() => {
    const s = row?.stars;
    if (typeof s === 'string') return (s.match(/★/g) || []).length;
    return s ?? 0;
  })();
  const firstName = (() => {
    const full = profile?.full_name?.trim();
    if (!full) return 'there';
    const parts = full.split(/\s+/);
    return parts[0] || 'there';
  })();
  const displayFirstName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    : 'There';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 border border-gray-800 shadow-2xl">
        <div>
          {/* Personal header */}
          {loading ? (
            <div className="flex items-center justify-between mb-4">
              <div className="h-7 w-48 bg-gray-800 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gray-800 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 pr-4">
                <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                  Hey, {displayFirstName} 👋
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">Your rank</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white">{rank ? `#${rank}` : 'Unranked'}</div>
                </div>
                <div className="text-sm text-gray-400">out of {totalUsers.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Ranking moved to header right to avoid duplication */}
          {/* Minimal footer removed */}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Academic Score</h4>
          <CircularProgress value={Math.round(academicScore)} color="#ffffff" />
          <p className="text-xs text-gray-400 mt-2">out of 100</p>
        </Card>

        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Experience Score</h4>
          <CircularProgress value={Math.round(experienceScore)} color="#ffffff" />
          <p className="text-xs text-gray-400 mt-2">out of 100</p>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="text-center mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Composite Score</h4>
          <div className="text-4xl font-bold text-white mb-4">{Math.round(compositeScore)}</div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white to-gray-300 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${(Math.min(1000, Math.max(0, compositeScore)) / 1000) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">out of 1000</p>
        </div>
        
        <div className="text-center border-t border-gray-800 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Overall Rating</h4>
          <div className="flex justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= (starsNumeric || 0) 
                    ? "fill-white text-white" 
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-white">{typeof row?.stars === 'string' ? row?.stars : starsNumeric + '/5'}</p>
        </div>
      </Card>
    </div>
  );
}