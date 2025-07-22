"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star } from "lucide-react";

const mockData = {
  currentRank: 42,
  totalUsers: 1250,
  rankChange: 3,
  academicScore: 92,
  experienceScore: 78,
  compositeScore: 847,
  overallRating: 4,
  scoreBreakdown: [
    { label: "Academic", percentage: 35, color: "bg-white" },
    { label: "Internships", percentage: 25, color: "bg-gray-300" },
    { label: "Projects", percentage: 20, color: "bg-gray-400" },
    { label: "Societies", percentage: 15, color: "bg-gray-500" },
    { label: "Certifications", percentage: 5, color: "bg-gray-600" }
  ]
};

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
  return (
    <div className="space-y-6">
      {/* Current Rank Card */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black text-white p-6 border border-gray-800 shadow-2xl">
        <div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">Current Rank</h3>
          <div className="flex items-baseline space-x-2 mb-3">
            <span className="text-4xl font-bold text-white">#{mockData.currentRank}</span>
            <span className="text-lg text-gray-400">out of {mockData.totalUsers.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-white">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Up {mockData.rankChange} positions this month</span>
          </div>
        </div>
      </Card>

      {/* Score Metrics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Academic Score */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Academic Score</h4>
          <CircularProgress value={mockData.academicScore} color="#ffffff" />
          <p className="text-xs text-gray-400 mt-2">out of 100</p>
        </Card>

        {/* Experience Score */}
        <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 text-center shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4">Experience Score</h4>
          <CircularProgress value={mockData.experienceScore} color="#ffffff" />
          <p className="text-xs text-gray-400 mt-2">out of 100</p>
        </Card>
      </div>

      {/* Composite Score & Rating */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="text-center mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Composite Score</h4>
          <div className="text-4xl font-bold text-white mb-4">{mockData.compositeScore}</div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white to-gray-300 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${(mockData.compositeScore / 1000) * 100}%` }}
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
                  star <= mockData.overallRating 
                    ? "fill-white text-white" 
                    : "text-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-sm font-semibold text-white">{mockData.overallRating}/5</p>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Score Breakdown</h4>
          <Button variant="link" className="text-sm text-gray-300 p-0 hover:text-white">
            Progress Over Time
          </Button>
        </div>
        <div className="space-y-3">
          {mockData.scoreBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-white">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 