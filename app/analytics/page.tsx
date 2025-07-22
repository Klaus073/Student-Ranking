"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, Download, TrendingUp, Users, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';

// Mock data for analytics
const topPerformers = [
  { id: 1, name: "Sarah Chen", university: "MIT", year: "Y3", score: 965, rank: 1, stars: 5 },
  { id: 2, name: "Alex Johnson", university: "Stanford", year: "Y3", score: 940, rank: 2, stars: 5 },
  { id: 3, name: "Maria Rodriguez", university: "Harvard", year: "Y2", score: 915, rank: 3, stars: 4 }
];

const rankingsData = [
  { rank: 1, name: "Sarah Chen", university: "MIT", year: "Y3", academic: 98, experience: 95, composite: 965, stars: 5, trend: "up" },
  { rank: 2, name: "Alex Johnson", university: "Stanford", year: "Y3", academic: 96, experience: 92, composite: 940, stars: 5, trend: "up" },
  { rank: 3, name: "Maria Rodriguez", university: "Harvard", year: "Y2", academic: 94, experience: 89, composite: 915, stars: 4, trend: "up" },
  { rank: 4, name: "David Kim", university: "Caltech", year: "Y3", academic: 92, experience: 86, composite: 890, stars: 4, trend: "down" },
  { rank: 5, name: "Emma Wilson", university: "MIT", year: "Y2", academic: 90, experience: 85, composite: 875, stars: 4, trend: "up" },
  { rank: 6, name: "James Brown", university: "Stanford", year: "Y3", academic: 88, experience: 87, composite: 860, stars: 4, trend: "same" },
  { rank: 7, name: "Lisa Zhang", university: "Harvard", year: "Y1", academic: 89, experience: 82, composite: 855, stars: 4, trend: "up" },
  { rank: 8, name: "Michael Davis", university: "Caltech", year: "Y2", academic: 87, experience: 84, composite: 850, stars: 4, trend: "down" },
  { rank: 9, name: "Anna Taylor", university: "MIT", year: "Y1", academic: 85, experience: 83, composite: 840, stars: 4, trend: "up" },
  { rank: 10, name: "Robert Lee", university: "Stanford", year: "Y2", academic: 84, experience: 81, composite: 825, stars: 4, trend: "same" }
];

const universityData = [
  { name: "MIT", students: 245, avgScore: 847 },
  { name: "Stanford", students: 198, avgScore: 832 },
  { name: "Harvard", students: 167, avgScore: 825 },
  { name: "Caltech", students: 134, avgScore: 815 },
  { name: "Princeton", students: 156, avgScore: 798 },
  { name: "Yale", students: 143, avgScore: 785 }
];

const starDistribution = [
  { name: "5 Stars", value: 88, percentage: 7.0, color: "#FFFFFF" },
  { name: "4 Stars", value: 358, percentage: 28.6, color: "#D1D5DB" },
  { name: "3 Stars", value: 512, percentage: 41.0, color: "#9CA3AF" },
  { name: "2 Stars", value: 234, percentage: 18.7, color: "#6B7280" },
  { name: "1 Star", value: 58, percentage: 4.7, color: "#374151" }
];

const yearWiseData = [
  { year: "Y0", avgScore: 720, change: "+45", students: 342 },
  { year: "Y1", avgScore: 765, change: "+47", students: 298 },
  { year: "Y2", avgScore: 812, change: "+51", students: 267 },
  { year: "Y3", avgScore: 847, change: "+35", students: 343 }
];

// Additional data for Comparative Insights
const scoreDistribution = [
  { range: "900-1000", count: 45, percentage: 3.6 },
  { range: "800-899", count: 234, percentage: 18.7 },
  { range: "700-799", count: 456, percentage: 36.5 },
  { range: "600-699", count: 378, percentage: 30.2 },
  { range: "500-599", count: 134, percentage: 10.7 },
  { range: "400-499", count: 3, percentage: 0.3 }
];

const universityComparison = [
  { name: "MIT", academic: 85, experience: 82, composite: 847 },
  { name: "Stanford", academic: 83, experience: 80, composite: 832 },
  { name: "Harvard", academic: 82, experience: 78, composite: 825 },
  { name: "Caltech", academic: 81, experience: 76, composite: 815 },
  { name: "Princeton", academic: 79, experience: 75, composite: 798 },
  { name: "Yale", academic: 78, experience: 73, composite: 785 }
];

// Additional data for Trends
const timelineData = [
  { month: "Jan", MIT: 820, Stanford: 815, Harvard: 810, Caltech: 805 },
  { month: "Feb", MIT: 825, Stanford: 818, Harvard: 813, Caltech: 808 },
  { month: "Mar", MIT: 830, Stanford: 822, Harvard: 816, Caltech: 812 },
  { month: "Apr", MIT: 835, Stanford: 825, Harvard: 820, Caltech: 815 },
  { month: "May", MIT: 840, Stanford: 828, Harvard: 823, Caltech: 818 },
  { month: "Jun", MIT: 847, Stanford: 832, Harvard: 825, Caltech: 820 }
];

const correlationData = [
  { internships: 0, ranking: 450 },
  { internships: 1, ranking: 320 },
  { internships: 2, ranking: 180 },
  { internships: 3, ranking: 120 },
  { internships: 4, ranking: 80 },
  { internships: 5, ranking: 45 },
  { internships: 6, ranking: 25 },
  { internships: 7, ranking: 15 }
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("rankings");

  const GlobalRankingsTab = () => (
    <div>
      {/* Top Performers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPerformers.map((performer, index) => (
            <Card key={performer.id} className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
              <div className="relative mb-4">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {performer.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                  #{performer.rank}
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{performer.name}</h3>
              <p className="text-gray-400 text-sm mb-2">{performer.university} • {performer.year}</p>
              <div className="text-2xl font-bold text-white mb-2">{performer.score}</div>
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
                <th className="text-left p-4 text-gray-300 font-medium">TREND</th>
              </tr>
            </thead>
            <tbody>
              {rankingsData.map((student) => (
                <tr key={student.rank} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="p-4 text-white font-medium">#{student.rank}</td>
                  <td className="p-4 text-white">{student.name}</td>
                  <td className="p-4 text-gray-300">{student.university}</td>
                  <td className="p-4 text-gray-300">{student.year}</td>
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
                  <td className="p-4">
                    <TrendingUp className={`h-4 w-4 ${
                      student.trend === 'up' ? 'text-white' : 
                      student.trend === 'down' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-gray-400 text-sm">
          <span>Showing 1 to 10 of 1,250 results</span>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-gray-300">Previous</Button>
            <Button variant="ghost" size="sm" className="bg-white text-black">1</Button>
            <Button variant="ghost" size="sm" className="text-gray-300">2</Button>
            <Button variant="ghost" size="sm" className="text-gray-300">3</Button>
            <Button variant="ghost" size="sm" className="text-gray-300">Next</Button>
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={universityComparison}>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreDistribution}>
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
        </Card>

        {/* Star Rating Distribution */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Star Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={starDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {starDistribution.map((entry, index) => (
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
            {starDistribution.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <div className="text-white font-medium">{item.value}</div>
                <div className="text-gray-400">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Year-wise Performance */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Year-wise Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {yearWiseData.map((year) => (
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
      </Card>
    </div>
  );

  const TrendsTab = () => (
    <div className="space-y-8">
      {/* Performance Timeline */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Correlation Analysis */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Internship Impact Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="internships" stroke="#9CA3AF" />
              <YAxis dataKey="ranking" stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#FFFFFF'
                }} 
              />
              <Scatter dataKey="ranking" fill="#FFFFFF" />
            </ScatterChart>
          </ResponsiveContainer>
          <p className="text-gray-400 text-sm mt-3">
            Strong negative correlation (-0.78) between internship count and ranking position
          </p>
        </Card>

        {/* Key Insights */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Top 10% Growth</h4>
                <p className="text-gray-400 text-xs">MIT students show 15% higher improvement rate</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Experience Matters</h4>
                <p className="text-gray-400 text-xs">Students with 3+ internships rank 40% higher</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300">
              <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Academic Excellence</h4>
                <p className="text-gray-400 text-xs">GPA contributes 60% to final composite score</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
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
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("trends")}
            className={activeTab === "trends" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            Trends
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "rankings" && <GlobalRankingsTab />}
        {activeTab === "insights" && <ComparativeInsightsTab />}
        {activeTab === "trends" && <TrendsTab />}
      </div>
    </div>
  );
} 