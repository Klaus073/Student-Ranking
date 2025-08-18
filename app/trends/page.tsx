"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, BarChart, Bar, Legend, ComposedChart } from 'recharts';
import { TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CorrPoint = { internships: number; score: number };
type AvgRow = { year: string; [university: string]: number };

export default function TrendsPage() {
  // Average performance per university and year
  const [avgLoading, setAvgLoading] = useState(true);
  const [avgError, setAvgError] = useState<string | null>(null);
  const [avgData, setAvgData] = useState<AvgRow[]>([]);
  const [avgUniversities, setAvgUniversities] = useState<string[]>([]);
  const [avgViz, setAvgViz] = useState<'bars' | 'heatmap'>('bars');
  const uniColors = ['#60A5FA','#F59E0B','#10B981','#A78BFA','#F87171','#9CA3AF'];
  const colorByUni = useMemo(() => {
    const map: Record<string, string> = {};
    avgUniversities.forEach((u, i) => { map[u] = uniColors[i % uniColors.length]; });
    return map;
  }, [avgUniversities]);
  const [corrLoading, setCorrLoading] = useState(true);
  const [corrError, setCorrError] = useState<string | null>(null);
  const [corrData, setCorrData] = useState<CorrPoint[]>([]);
  const [corrViz, setCorrViz] = useState<'buckets' | 'scatter'>('buckets');

  useEffect(() => {
    const supabase = createClient();
    const loadAverages = async () => {
      try {
        const [{ data: ranks, error: ranksError }, { data: profiles, error: profsError }] = await Promise.all([
          supabase.from('student_rankings').select('user_id, composite'),
          supabase.from('student_profiles').select('user_id, university, current_year')
        ]);
        if (ranksError) throw new Error(ranksError.message);
        if (profsError) throw new Error(profsError.message);

        const rankByUser: Record<string, number> = {};
        (ranks || []).forEach((r: any) => { rankByUser[r.user_id] = Number(r.composite || 0); });

        const agg: Record<string, Record<number, { sum: number; count: number }>> = {};
        (profiles || []).forEach((p: any) => {
          const uni = (p.university || 'Unknown').toString();
          const year = typeof p.current_year === 'number' ? p.current_year : null;
          if (year === null || year < 0 || year > 3) return;
          const score = rankByUser[p.user_id];
          if (score === undefined) return;
          if (!agg[uni]) agg[uni] = {} as any;
          if (!agg[uni][year]) agg[uni][year] = { sum: 0, count: 0 };
          agg[uni][year].sum += score; agg[uni][year].count += 1;
        });

        // Pick top 6 universities by total participation
        const uniCounts = Object.entries(agg).map(([uni, years]) => [uni, Object.values(years).reduce((a, b) => a + b.count, 0)] as [string, number]);
        const topUnis = uniCounts.sort((a,b)=>b[1]-a[1]).slice(0, 6).map(([u]) => u);
        setAvgUniversities(topUnis);

        // Build line chart data for years Y0..Y3
        const data: AvgRow[] = [0,1,2,3].map((y) => {
          const row: AvgRow = { year: `Y${y}` } as AvgRow;
          topUnis.forEach(u => {
            const cell = agg[u]?.[y];
            row[u] = cell && cell.count ? Math.round(cell.sum / cell.count) : 0;
          });
          return row;
        });
        setAvgData(data);
        setAvgError(null);
      } catch (e) {
        setAvgError(e instanceof Error ? e.message : 'Failed to load averages');
      } finally {
        setAvgLoading(false);
      }
    };
    loadAverages();
  }, []);

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

  const { corrLabel, regressionLine } = useMemo(() => {
    if (!corrData.length) return { corrLabel: null as string | null, regressionLine: [] as { internships: number; score: number }[] };
    // Pearson r and linear regression y = a + b x
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
    const b = dx === 0 ? 0 : (num / dx);
    const a = my - b * mx;
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const regressionLine = [
      { internships: minX, score: a + b * minX },
      { internships: maxX, score: a + b * maxX },
    ];
    return { corrLabel: `Correlation (r): ${rStr}`, regressionLine };
  }, [corrData]);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Performance Trends</h1>
          <p className="text-gray-400">Analyze performance patterns and correlations over time</p>
        </div>

        {/* Average performance per university and year */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Average Performance per University and Year</h3>
            <div className="flex items-center gap-2">
              <button
                className={`px-3 py-1 text-sm rounded border ${avgViz==='bars' ? 'bg-white text-black border-white' : 'text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                onClick={()=>setAvgViz('bars')}
              >Bars</button>
              <button
                className={`px-3 py-1 text-sm rounded border ${avgViz==='heatmap' ? 'bg-white text-black border-white' : 'text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                onClick={()=>setAvgViz('heatmap')}
              >Heatmap</button>
            </div>
          </div>
          {avgLoading ? (
            <div className="h-96 bg-gray-900 rounded animate-pulse" />
          ) : avgError ? (
            <div className="text-sm text-red-400">{avgError}</div>
          ) : (
          <>
            {avgViz === 'bars' ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={avgData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#FFFFFF'
                    }} 
                  />
                  <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                  {avgUniversities.map((u) => (
                    <Bar key={u} dataKey={u} fill={colorByUni[u]} radius={[3,3,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="overflow-x-auto">
                {(() => {
                  // Flatten values to compute min/max for color scale
                  const values: number[] = [];
                  avgUniversities.forEach(u => {
                    [0,1,2,3].forEach(y => {
                      const row = avgData.find(r => r.year === `Y${y}`);
                      if (row && typeof row[u] === 'number') values.push(row[u] as number);
                    });
                  });
                  const minV = Math.min(0, ...values);
                  const maxV = Math.max(1, ...values);
                  const scale = (v: number) => {
                    const t = Math.min(1, Math.max(0, (v - minV) / (maxV - minV || 1)));
                    const to255 = (n: number) => Math.round(n);
                    // Gradient from #111827 (17,24,39) to #FFFFFF
                    const r = 17 + t * (255 - 17);
                    const g = 24 + t * (255 - 24);
                    const b = 39 + t * (255 - 39);
                    return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
                  };
                  return (
                    <div className="w-full">
                      <div className="grid" style={{ gridTemplateColumns: '200px repeat(4, minmax(80px, 1fr))' }}>
                        <div className="text-gray-400 text-sm p-2"></div>
                        {['Y0','Y1','Y2','Y3'].map(y => (
                          <div key={y} className="text-gray-300 text-sm p-2 font-medium">{y}</div>
                        ))}
                        {avgUniversities.map(u => (
                          <>
                            <div key={`lbl-${u}`} className="text-white text-sm p-2 border-t border-gray-800 sticky left-0 bg-black/40 backdrop-blur">
                              {u}
                            </div>
                            {[0,1,2,3].map(y => {
                              const row = avgData.find(r => r.year === `Y${y}`);
                              const val = row && (row[u] as number);
                              const bg = scale(typeof val === 'number' ? val : 0);
                              return (
                                <div key={`${u}-${y}`} className="p-2 border-t border-gray-800 text-center text-white text-sm" style={{ backgroundColor: bg }}>
                                  {typeof val === 'number' ? val : '—'}
                                </div>
                              );
                            })}
                          </>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </>
          )}
        </Card>

        <div className="mb-8">
          {/* Correlation Analysis */}
          <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Correlation: Internships vs Ranking</h3>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded border ${corrViz==='buckets' ? 'bg-white text-black border-white' : 'text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                  onClick={()=>setCorrViz('buckets')}
                >By Count</button>
                <button
                  className={`px-3 py-1 text-sm rounded border ${corrViz==='scatter' ? 'bg-white text-black border-white' : 'text-gray-300 border-gray-700 hover:bg-gray-800'}`}
                  onClick={()=>setCorrViz('scatter')}
                >Scatter</button>
              </div>
            </div>
            {corrLoading ? (
              <div className="h-72 bg-gray-900 rounded animate-pulse" />
            ) : corrError ? (
              <div className="text-sm text-red-400">{corrError}</div>
            ) : (
            <>
              {corrViz === 'scatter' ? (
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="internships" type="number" stroke="#9CA3AF" label={{ value: 'Number of internships', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} />
                    <YAxis dataKey="score" type="number" stroke="#9CA3AF" label={{ value: 'Composite score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#FFFFFF'
                      }} 
                    />
                    <Scatter name="Students" data={corrData} dataKey="score" fill="#60A5FA" fillOpacity={0.7} />
                    <Line type="linear" data={regressionLine} dataKey="score" dot={false} stroke="#F59E0B" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                (() => {
                  // Average composite by internship count (0..max)
                  const maxX = Math.max(0, ...corrData.map(d => d.internships));
                  const buckets: { internships: number; avg: number }[] = [];
                  for (let i = 0; i <= maxX; i++) {
                    const pts = corrData.filter(d => d.internships === i);
                    const avg = pts.length ? Math.round(pts.reduce((a,b)=>a + b.score, 0) / pts.length) : 0;
                    buckets.push({ internships: i, avg });
                  }
                  return (
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={buckets}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="internships" stroke="#9CA3AF" label={{ value: 'Number of internships', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }} />
                        <YAxis dataKey="avg" stroke="#9CA3AF" label={{ value: 'Average composite', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            color: '#FFFFFF'
                          }} 
                        />
                        <Bar dataKey="avg" fill="#60A5FA" radius={[3,3,0,0]} />
                        <Line type="monotone" dataKey="avg" stroke="#FFFFFF" strokeWidth={2} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  );
                })()
              )}
              <p className="text-gray-400 text-sm mt-3">
                {corrViz === 'scatter' ? (corrLabel || 'Correlation unavailable') : 'Each bar shows the average composite score for students with N internships.'}
              </p>
            </>
            )}
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