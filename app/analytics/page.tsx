"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { createClient } from "@/lib/supabase/client";

type TopRow = { rank: number; academic: number; experience: number; composite: number; stars: number; user_id: string; student: { full_name: string | null; university: string | null; current_year: number | null } | null };
type BoardRow = { rank: number; academic: number; experience: number; composite: number; stars: number; student: { full_name: string | null; university: string | null; current_year: number | null } | null };

type StarDist = { name: string; value: number; percentage: number; color: string };
type YearWise = { year: string; avgScore: number; change: string; students: number };
type ScoreBin = { range: string; count: number; percentage: number };
type UnivComp = { name: string; academic: number; experience: number; composite: number };

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("rankings");
  const [topPerformers, setTopPerformers] = useState<TopRow[]>([]);
  const [rankingsData, setRankingsData] = useState<BoardRow[]>([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [errorTop, setErrorTop] = useState<string | null>(null);
  const [errorBoard, setErrorBoard] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [starDist, setStarDist] = useState<StarDist[]>([]);
  const [yearWise, setYearWise] = useState<YearWise[]>([]);
  const [scoreDist, setScoreDist] = useState<ScoreBin[]>([]);
  const [universityComp, setUniversityComp] = useState<UnivComp[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    const supabase = createClient();
    const loadTop = async () => {
      try {
        const { data, error } = await supabase
          .from('student_rankings')
          .select('rank, academic, experience, composite, stars, user_id')
          .not('rank', 'is', null)
          .order('rank', { ascending: true })
          .limit(3);
        if (error) setErrorTop(error.message); else {
          const ids = (data || []).map((r: any) => r.user_id);
          let profiles: Record<string, { full_name: string | null; university: string | null; current_year: number | null }> = {};
          if (ids.length > 0) {
            const { data: profs } = await supabase
              .from('student_profiles')
              .select('user_id, full_name, university, current_year')
              .in('user_id', ids);
            (profs || []).forEach((p: any) => { profiles[p.user_id] = { full_name: p.full_name, university: p.university, current_year: p.current_year }; });
          }
          const merged = (data || []).map((r: any) => {
            const raw = r.stars as unknown;
            const numeric = typeof raw === 'number' ? raw : (typeof raw === 'string' ? (raw.match(/★/g) || []).length : 0);
            return { ...r, stars: numeric, student: profiles[r.user_id] || null };
          });
          setTopPerformers(merged as TopRow[]);
        }
      } catch (e) { setErrorTop(e instanceof Error ? e.message : 'Unknown error'); }
      finally { setLoadingTop(false); }
    };
    loadTop();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const loadBoard = async () => {
      try {
        const { data, error } = await supabase
          .from('student_rankings')
          .select('rank, academic, experience, composite, stars, user_id')
          .not('rank', 'is', null)
          .order('rank', { ascending: true })
          .range(from, to);
        if (error) setErrorBoard(error.message); else {
          const ids = (data || []).map((r: any) => r.user_id);
          let profiles: Record<string, { full_name: string | null; university: string | null; current_year: number | null }> = {};
          if (ids.length > 0) {
            const { data: profs } = await supabase
              .from('student_profiles')
              .select('user_id, full_name, university, current_year')
              .in('user_id', ids);
            (profs || []).forEach((p: any) => { profiles[p.user_id] = { full_name: p.full_name, university: p.university, current_year: p.current_year }; });
          }
          const merged = (data || []).map((r: any) => {
            const raw = r.stars as unknown;
            const numeric = typeof raw === 'number' ? raw : (typeof raw === 'string' ? (raw.match(/★/g) || []).length : 0);
            return { ...r, stars: numeric, student: profiles[r.user_id] || null };
          });
          setRankingsData(merged as BoardRow[]);
        }
      } catch (e) { setErrorBoard(e instanceof Error ? e.message : 'Unknown error'); }
      finally { setLoadingBoard(false); }
    };
    loadBoard();
  }, [page]);

  useEffect(() => {
    const supabase = createClient();
    const loadInsights = async () => {
      try {
        // Pull all rankings needed for aggregations
        const { data: ranks, error: ranksError } = await supabase
          .from('student_rankings')
          .select('user_id, academic, experience, composite, stars, rank');
        if (ranksError) throw new Error(ranksError.message);

        const userIds = (ranks || []).map(r => r.user_id);
        let profiles: { [userId: string]: { university: string | null; current_year: number | null } } = {};
        if (userIds.length > 0) {
          const { data: profs, error: profsError } = await supabase
            .from('student_profiles')
            .select('user_id, university, current_year')
            .in('user_id', userIds);
          if (profsError) throw new Error(profsError.message);
          (profs || []).forEach((p: any) => {
            profiles[p.user_id] = { university: p.university, current_year: p.current_year };
          });
        }

        // Helpers
        const starOf = (s: any): number => {
          if (typeof s === 'number') return s;
          if (typeof s === 'string') return (s.match(/★/g) || []).length;
          return 0;
        };

        // Star distribution (1..5)
        const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        (ranks || []).forEach(r => {
          const s = Math.max(0, Math.min(5, starOf((r as any).stars)));
          if (s >= 1) starCounts[s] = (starCounts[s] || 0) + 1;
        });
        const totalStars = Object.values(starCounts).reduce((a, b) => a + b, 0) || 1;
        const starPalette = ["#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF"]; // 1..5
        const starDistData: StarDist[] = [1,2,3,4,5].map((s, idx) => ({
          name: `${s} ${s === 1 ? 'Star' : 'Stars'}`,
          value: starCounts[s] || 0,
          percentage: Math.round(((starCounts[s] || 0) / totalStars) * 1000) / 10,
          color: starPalette[idx]
        }));
        setStarDist(starDistData);

        // Score distribution (auto 6 bins)
        const composites = (ranks || []).map(r => Number((r as any).composite || 0)).filter(n => !isNaN(n));
        const maxComposite = Math.max(0, ...composites);
        const minComposite = Math.min(0, ...composites, 0);
        const bins = 6;
        const binSize = (maxComposite - minComposite) / (bins || 1) || 1;
        const counts = new Array(bins).fill(0);
        composites.forEach(val => {
          let idx = Math.floor((val - minComposite) / binSize);
          if (idx >= bins) idx = bins - 1;
          if (idx < 0) idx = 0;
          counts[idx]++;
        });
        const total = composites.length || 1;
        const scoreDistData: ScoreBin[] = counts.map((c, i) => {
          const start = Math.round(minComposite + i * binSize);
          const end = Math.round(minComposite + (i + 1) * binSize);
          return { range: `${start}-${end}`, count: c, percentage: Math.round((c / total) * 1000) / 10 };
        });
        setScoreDist(scoreDistData);

        // Year-wise performance
        const yearAgg: Record<number, { sum: number; count: number } > = { 0: { sum: 0, count: 0 }, 1: { sum: 0, count: 0 }, 2: { sum: 0, count: 0 }, 3: { sum: 0, count: 0 } };
        (ranks || []).forEach(r => {
          const prof = profiles[(r as any).user_id];
          const yr = prof?.current_year;
          if (yr !== null && yr !== undefined && yr >= 0 && yr <= 3) {
            yearAgg[yr].sum += Number((r as any).composite || 0);
            yearAgg[yr].count += 1;
          }
        });
        const yData: YearWise[] = [0,1,2,3].map((y, idx) => {
          const avg = yearAgg[y].count ? Math.round(yearAgg[y].sum / yearAgg[y].count) : 0;
          const prevAvg = idx > 0 ? (yearAgg[idx - 1].count ? Math.round(yearAgg[idx - 1].sum / yearAgg[idx - 1].count) : 0) : 0;
          const change = idx > 0 ? ((avg - prevAvg) >= 0 ? `+${avg - prevAvg}` : `${avg - prevAvg}`) : '+0';
          return { year: `Y${y}`, avgScore: avg, change, students: yearAgg[y].count };
        });
        setYearWise(yData);

        // University comparison (top 6 by population)
        const byUniv: Record<string, { academic: number; experience: number; composite: number; count: number } > = {};
        (ranks || []).forEach(r => {
          const prof = profiles[(r as any).user_id];
          const univ = (prof?.university || 'Unknown').toString();
          if (!byUniv[univ]) byUniv[univ] = { academic: 0, experience: 0, composite: 0, count: 0 };
          byUniv[univ].academic += Number((r as any).academic || 0);
          byUniv[univ].experience += Number((r as any).experience || 0);
          byUniv[univ].composite += Number((r as any).composite || 0);
          byUniv[univ].count += 1;
        });
        const compData: UnivComp[] = Object.entries(byUniv)
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 6)
          .map(([name, agg]) => ({
            name,
            academic: agg.count ? Math.round(agg.academic / agg.count) : 0,
            experience: agg.count ? Math.round(agg.experience / agg.count) : 0,
            composite: agg.count ? Math.round(agg.composite / agg.count) : 0,
          }));
        setUniversityComp(compData);

        setInsightsError(null);
      } catch (e) {
        setInsightsError(e instanceof Error ? e.message : 'Failed to load insights');
      } finally {
        setInsightsLoading(false);
      }
    };
    loadInsights();
  }, []);

  const GlobalRankingsTab = () => (
    <div>
      {/* Top Performers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loadingTop && <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="h-40 bg-gray-900 rounded"/><div className="h-40 bg-gray-900 rounded"/><div className="h-40 bg-gray-900 rounded"/></div>}
          {errorTop && <div className="text-sm text-red-400">{errorTop}</div>}
          {!loadingTop && !errorTop && topPerformers.map((performer, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(performer.student?.full_name || 'NA').split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                  #{performer.rank}
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{performer.student?.full_name || 'Unknown'}</h3>
              <p className="text-gray-400 text-sm mb-2">{performer.student?.university || '—'} • Y{performer.student?.current_year ?? '—'}</p>
              <div className="text-2xl font-bold text-white mb-2">{performer.composite}</div>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= performer.stars ? "fill-white text-white" : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search students..." 
            className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <Select>
          <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="y0">Y0</SelectItem>
            <SelectItem value="y1">Y1</SelectItem>
            <SelectItem value="y2">Y2</SelectItem>
            <SelectItem value="y3">Y3</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
            <SelectValue placeholder="All Universities" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="all">All Universities</SelectItem>
            <SelectItem value="mit">MIT</SelectItem>
            <SelectItem value="stanford">Stanford</SelectItem>
            <SelectItem value="harvard">Harvard</SelectItem>
            <SelectItem value="caltech">Caltech</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-white hover:bg-gray-200 text-black">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Rankings Table */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-300 font-medium">RANK</th>
                <th className="text-left p-4 text-gray-300 font-medium">STUDENT</th>
                <th className="text-left p-4 text-gray-300 font-medium">UNIVERSITY</th>
                <th className="text-left p-4 text-gray-300 font-medium">YEAR</th>
                <th className="text-left p-4 text-gray-300 font-medium">ACADEMIC</th>
                <th className="text-left p-4 text-gray-300 font-medium">EXPERIENCE</th>
                <th className="text-left p-4 text-gray-300 font-medium">COMPOSITE</th>
                <th className="text-left p-4 text-gray-300 font-medium">STARS</th>
                
              </tr>
            </thead>
            <tbody>
              {rankingsData.length === 0 && (
                <tr><td colSpan={9} className="p-6 text-gray-400">No data</td></tr>
              )}
              {rankingsData.map((student, idx) => (
                <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">#{student.rank}</td>
                  <td className="p-4 text-white">{student.student?.full_name || 'Unknown'}</td>
                  <td className="p-4 text-gray-300">{student.student?.university || '—'}</td>
                  <td className="p-4 text-gray-300">Y{student.student?.current_year ?? '—'}</td>
                  <td className="p-4 text-white">{student.academic}</td>
                  <td className="p-4 text-white">{student.experience}</td>
                  <td className="p-4 text-white font-semibold">{student.composite}</td>
                  <td className="p-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= student.stars ? "fill-white text-white" : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-gray-400 text-sm">
          <span>Page {page}</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-300" onClick={() => setPage(Math.max(1, page-1))}>Previous</Button>
            <Button variant="ghost" size="sm" className="bg-white text-black" onClick={() => setPage(page)}>{page}</Button>
            <Button variant="ghost" size="sm" className="text-gray-300" onClick={() => setPage(page+1)}>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const ComparativeInsightsTab = () => (
    <div className="space-y-8">
      {/* University Comparison */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-6">University Performance Comparison</h3>
        {insightsLoading ? (
          <div className="h-96 bg-gray-900 rounded animate-pulse" />
        ) : insightsError ? (
          <div className="text-sm text-red-400">{insightsError}</div>
        ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={universityComp}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#FFFFFF'
              }} 
            />
            <Bar dataKey="academic" fill="#FFFFFF" radius={[2, 2, 0, 0]} />
            <Bar dataKey="experience" fill="#9CA3AF" radius={[2, 2, 0, 0]} />
            <Bar dataKey="composite" fill="#6B7280" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        )}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded"></div>
            <span className="text-gray-300 text-sm">Academic</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span className="text-gray-300 text-sm">Experience</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded"></div>
            <span className="text-gray-300 text-sm">Composite</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Distribution */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
          {insightsLoading ? (
            <div className="h-72 bg-gray-900 rounded animate-pulse" />
          ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#FFFFFF'
                }} 
              />
              <Bar dataKey="count" fill="#FFFFFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </Card>

        {/* Star Rating Distribution */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Star Rating Distribution</h3>
          {insightsLoading ? (
            <div className="h-72 bg-gray-900 rounded animate-pulse" />
          ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={starDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {starDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#FFFFFF'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {starDist.map((item) => (
                <div key={item.name} className="grid grid-cols-[auto_3rem_4rem] items-center gap-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <div className="text-white font-medium text-center tabular-nums">{item.value}</div>
                  <div className="text-gray-400 text-right tabular-nums">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </>
          )}
        </Card>
      </div>

      {/* Year-wise Performance */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Year-wise Performance Metrics</h3>
        {insightsLoading ? (
          <div className="h-40 bg-gray-900 rounded animate-pulse" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {yearWise.map((year) => (
              <div key={year.year} className="text-center">
                <div className="text-gray-400 text-sm mb-2">{year.year}</div>
                <div className="text-3xl font-bold text-white mb-2">{year.avgScore}</div>
                <div className="text-sm text-gray-300 mb-3">Average Score</div>
                <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(year.avgScore / 1000) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-white">{year.change} from previous year</div>
                <div className="text-xs text-gray-400 mt-1">{year.students} students</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics & Rankings</h1>
          <p className="text-gray-400">Comprehensive insights into student performance and rankings</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-800">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("rankings")}
            className={activeTab === "rankings" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            Global Rankings
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("insights")}
            className={activeTab === "insights" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            Comparative Insights
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "rankings" && <GlobalRankingsTab />}
        {activeTab === "insights" && <ComparativeInsightsTab />}
      </div>
    </div>
  );
} 