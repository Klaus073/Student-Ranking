"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Users, Award, Briefcase, GraduationCap } from "lucide-react";

// Mock data for trends
const averageScoresData = [
  { month: "Jan", MIT: 820, Stanford: 815, Harvard: 810, Caltech: 805, Princeton: 800 },
  { month: "Feb", MIT: 825, Stanford: 818, Harvard: 813, Caltech: 808, Princeton: 803 },
  { month: "Mar", MIT: 830, Stanford: 822, Harvard: 816, Caltech: 812, Princeton: 806 },
  { month: "Apr", MIT: 835, Stanford: 825, Harvard: 820, Caltech: 815, Princeton: 810 },
  { month: "May", MIT: 840, Stanford: 828, Harvard: 823, Caltech: 818, Princeton: 813 },
  { month: "Jun", MIT: 847, Stanford: 832, Harvard: 825, Caltech: 820, Princeton: 815 }
];

const correlationData = [
  { internships: 0, ranking: 450 },
  { internships: 1, ranking: 320 },
  { internships: 2, ranking: 180 },
  { internships: 3, ranking: 120 },
  { internships: 4, ranking: 80 },
  { internships: 5, ranking: 45 },
  { internships: 6, ranking: 25 },
  { internships: 7, ranking: 15 },
  { internships: 8, ranking: 8 }
];

const correlationAnalysis = [
  {
    title: "Internship Count",
    description: "Strong positive correlation with ranking",
    correlation: 0.78,
    strength: "Very Strong",
    color: "text-white"
  },
  {
    title: "Society Participation",
    description: "Moderate positive correlation with experience score",
    correlation: 0.65,
    strength: "Moderate",
    color: "text-gray-300"
  },
  {
    title: "Academic Score",
    description: "Very strong correlation with final ranking",
    correlation: 0.82,
    strength: "Very Strong",
    color: "text-white"
  },
  {
    title: "Project Count",
    description: "Strong correlation with composite score",
    correlation: 0.71,
    strength: "Strong",
    color: "text-white"
  },
  {
    title: "Certification Count",
    description: "Moderate correlation with academic score",
    correlation: 0.58,
    strength: "Moderate",
    color: "text-gray-300"
  }
];

const keyInsights = [
  {
    icon: Users,
    title: "Students with 2+ internships rank 35% higher",
    description: "Multiple internship experiences significantly boost overall rankings",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  },
  {
    icon: TrendingUp,
    title: "Y2 students show highest score improvement",
    description: "Second-year students demonstrate the strongest learning curve",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  },
  {
    icon: Award,
    title: "Society leadership roles add 25+ points",
    description: "Leadership positions in societies provide substantial score boosts",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  },
  {
    icon: GraduationCap,
    title: "Technical certifications correlate with top 10%",
    description: "Students in top rankings typically have 3+ technical certifications",
    color: "bg-gray-800/50",
    iconColor: "text-white"
  }
];

export default function TrendsPage() {
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
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
            Global Rankings
          </Button>
          <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800">
            Comparative Insights
          </Button>
          <Button variant="ghost" className="bg-white text-black hover:bg-gray-200 border-b-2 border-white">
            Trends
          </Button>
        </div>

        {/* Average Scores Over Time */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 mb-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Average Scores Over Time</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={averageScoresData}>
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
              <Line type="monotone" dataKey="Princeton" stroke="#374151" strokeWidth={3} dot={{ fill: '#374151', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {[
              { name: "MIT", color: "#FFFFFF" },
              { name: "Stanford", color: "#D1D5DB" },
              { name: "Harvard", color: "#9CA3AF" },
              { name: "Caltech", color: "#6B7280" },
              { name: "Princeton", color: "#374151" }
            ].map((university) => (
              <div key={university.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: university.color }}></div>
                <span className="text-gray-300 text-sm">{university.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Correlation Analysis */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 mb-8 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Correlation Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scatter Plot */}
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-4">Internship Count vs Ranking</h4>
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
            </div>

            {/* Correlation Metrics */}
            <div>
              <h4 className="text-md font-medium text-gray-300 mb-4">Correlation Strength</h4>
              <div className="space-y-4">
                {correlationAnalysis.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{item.title}</div>
                      <div className="text-gray-400 text-xs">{item.description}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-white font-bold">{item.correlation}</div>
                        <div className={`text-xs ${item.color}`}>{item.strength}</div>
                      </div>
                      <div className="w-16 bg-gray-800 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${item.correlation * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Key Insights */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-white mb-6">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800/30 transition-all duration-300 border border-transparent hover:border-gray-700">
                <div className={`p-3 rounded-lg ${insight.color} border border-gray-700`}>
                  <insight.icon className={`h-6 w-6 ${insight.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">{insight.title}</h4>
                  <p className="text-gray-400 text-sm">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 