"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Placeholder for timeline until we confirm the correct time dimension
const timelineData = [
  { month: "Jan", MIT: 820, Stanford: 815, Harvard: 810, Caltech: 805 },
  { month: "Feb", MIT: 825, Stanford: 818, Harvard: 813, Caltech: 808 },
  { month: "Mar", MIT: 830, Stanford: 822, Harvard: 816, Caltech: 812 },
  { month: "Apr", MIT: 835, Stanford: 825, Harvard: 820, Caltech: 815 },
  { month: "May", MIT: 840, Stanford: 828, Harvard: 823, Caltech: 818 },
  { month: "Jun", MIT: 847, Stanford: 832, Harvard: 825, Caltech: 820 }
];

type CorrPoint = { internships: number; score: number };

const keyInsights = [
  {
    icon: TrendingUp,
    title: "Top 10% Growth",
    description: "MIT students show 15% higher improvement rate",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  },
  {
    icon: Users,
    title: "Experience Matters",
    description: "Students with 3+ internships rank 40% higher",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  },
  {
    icon: Award,
    title: "Academic Excellence",
    description: "GPA contributes 60% to final composite score",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  }
];

export default function TrendsPage() {
  const [corrLoading, setCorrLoading] = useState(true);
  const [corrError, setCorrError] = useState<string | null>(null);
  const [corrData, setCorrData] = useState<CorrPoint[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const loadCorrelation = async () => {
      try {
        const [{ data: ranks, error: ranksError }, { data: internships, error: internError }] = await Promise.all([
          supabase.from('student_rankings').select('user_id, composite'),
          supabase.from('student_internships').select('user_id')
        ]);
        if (ranksError) throw new Error(ranksError.message);
        if (internError) throw new Error(internError.message);

        const internshipCountByUser: Record<string, number> = {};
        (internships || []).forEach((row: any) => {
          const uid = row.user_id as string;
          internshipCountByUser[uid] = (internshipCountByUser[uid] || 0) + 1;
        });

        const points: CorrPoint[] = (ranks || []).map((r: any) => ({
          internships: internshipCountByUser[r.user_id] || 0,
          score: Number(r.composite || 0)
        }));
        setCorrData(points);
        setCorrError(null);
      } catch (e) {
        setCorrError(e instanceof Error ? e.message : 'Failed to load correlation data');
      } finally {
        setCorrLoading(false);
      }
    };
    loadCorrelation();
  }, []);

  const corrLabel = useMemo(() => {
    if (!corrData.length) return null;
    // Quick direction note via simple Pearson approximation
    const xs = corrData.map(p => p.internships);
    const ys = corrData.map(p => p.score);
    const mean = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / (arr.length || 1);
    const mx = mean(xs), my = mean(ys);
    let num = 0, dx = 0, dy = 0;
    for (let i = 0; i < xs.length; i++) {
      const vx = xs[i] - mx; const vy = ys[i] - my;
      num += vx * vy; dx += vx * vx; dy += vy * vy;
    }
    const r = (dx === 0 || dy === 0) ? 0 : (num / Math.sqrt(dx * dy));
    const rStr = (Math.round(r * 100) / 100).toFixed(2);
    return `Correlation (r): ${rStr}`;
  }, [corrData]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Performance Trends</h1>
          <p className="text-gray-400">Analyze performance patterns and correlations over time</p>
        </div>

        {/* Performance Timeline */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 mb-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#FFFFFF'
                }} 
              />
              <Line type="monotone" dataKey="MIT" stroke="#FFFFFF" strokeWidth={3} dot={{ fill: '#FFFFFF', r: 6 }} />
              <Line type="monotone" dataKey="Stanford" stroke="#D1D5DB" strokeWidth={3} dot={{ fill: '#D1D5DB', r: 6 }} />
              <Line type="monotone" dataKey="Harvard" stroke="#9CA3AF" strokeWidth={3} dot={{ fill: '#9CA3AF', r: 6 }} />
              <Line type="monotone" dataKey="Caltech" stroke="#6B7280" strokeWidth={3} dot={{ fill: '#6B7280', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex justify-center space-x-6 mt-4">
            {[
              { name: "MIT", color: "#FFFFFF" },
              { name: "Stanford", color: "#D1D5DB" },
              { name: "Harvard", color: "#9CA3AF" },
              { name: "Caltech", color: "#6B7280" }
            ].map((university) => (
              <div key={university.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: university.color }}></div>
                <span className="text-gray-300 text-sm">{university.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Correlation Analysis */}
          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Internship Impact Analysis</h3>
            {corrLoading ? (
              <div className="h-72 bg-gray-900 rounded animate-pulse" />
            ) : corrError ? (
              <div className="text-sm text-red-400">{corrError}</div>
            ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={corrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="internships" stroke="#9CA3AF" />
                  <YAxis dataKey="score" stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Scatter dataKey="score" fill="#FFFFFF" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-gray-400 text-sm mt-3">
                {corrLabel || 'Correlation unavailable'}
              </p>
            </>
            )}
          </Card>

          {/* Key Insights */}
          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
            <div className="space-y-4">
              {keyInsights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
                  <div className={`p-2 ${insight.color} rounded-lg border border-gray-700`}>
                    <insight.icon className={`h-5 w-5 ${insight.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{insight.title}</h4>
                    <p className="text-gray-400 text-xs">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Trend Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">+15%</div>
              <div className="text-gray-400 text-sm mb-3">Average Score Growth</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">vs last semester</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div className="text-gray-400 text-sm mb-3">Students with Internships</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">up from 72% last year</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.2★</div>
              <div className="text-gray-400 text-sm mb-3">Average Rating</div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
              </div>
              <div className="text-xs text-gray-400 mt-2">across all universities</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 