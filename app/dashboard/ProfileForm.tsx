"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Briefcase, Users, TrendingUp, Trophy, Award } from "lucide-react";

const mockUpdates = [
  { 
    icon: Trophy, 
    title: "Added Semester 5 Results", 
    time: "2 hours ago", 
    points: "+15 points",
    bgColor: "bg-gray-800/50",
    iconColor: "text-white"
  },
  { 
    icon: Briefcase, 
    title: "Completed Google Internship", 
    time: "1 day ago", 
    points: "+25 points",
    bgColor: "bg-gray-800/50",
    iconColor: "text-white"
  },
  { 
    icon: Users, 
    title: "Elected as CS Society President", 
    time: "3 days ago", 
    points: "+20 points",
    bgColor: "bg-gray-800/50",
    iconColor: "text-white"
  },
  { 
    icon: Award, 
    title: "AWS Solutions Architect Certified", 
    time: "1 week ago", 
    points: "+10 points",
    bgColor: "bg-gray-800/50",
    iconColor: "text-white"
  }
];

export default function ProfileForm() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Update Academic Records</div>
                <div className="text-sm text-gray-300">Add grades, awards, and certifications</div>
              </div>
            </div>
          </Button>
          
          <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Add Internship</div>
                <div className="text-sm text-gray-300">Log your work experience</div>
              </div>
            </div>
          </Button>
          
          <Button className="w-full justify-start h-auto p-4 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white border border-gray-600 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Log Society Activity</div>
                <div className="text-sm text-gray-300">Record participation and roles</div>
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Updates */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Updates</h3>
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        
        <div className="space-y-4">
          {mockUpdates.map((update, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/30 transition-all duration-300 border border-transparent hover:border-gray-700">
              <div className={`p-2 rounded-lg ${update.bgColor} border border-gray-700`}>
                <update.icon className={`h-4 w-4 ${update.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-1">{update.title}</p>
                <p className="text-xs text-gray-400">{update.time}</p>
              </div>
              <div className="text-sm font-medium text-white">{update.points}</div>
            </div>
          ))}
        </div>
        
        <Button variant="link" className="w-full mt-4 text-gray-300 hover:text-white transition-colors duration-300">
          View All Updates →
        </Button>
      </Card>
    </div>
  );
} 