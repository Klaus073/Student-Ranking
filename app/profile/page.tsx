"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, Briefcase, Plus, X, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [internships, setInternships] = useState([
    { id: 1, company: "Goldman Sachs", role: "Summer Analyst", duration: "3 months", year: "2024" }
  ]);
  const [societies, setSocieties] = useState([
    { id: 1, name: "Investment Society", role: "President", size: "Large", years: "2023-2024" }
  ]);

  const addInternship = () => {
    setInternships([...internships, { id: Date.now(), company: "", role: "", duration: "", year: "" }]);
  };

  const removeInternship = (id: number) => {
    setInternships(internships.filter(intern => intern.id !== id));
  };

  const addSociety = () => {
    setSocieties([...societies, { id: Date.now(), name: "", role: "", size: "", years: "" }]);
  };

  const removeSociety = (id: number) => {
    setSocieties(societies.filter(society => society.id !== id));
  };

  const PersonalInfoTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-gray-300" />
            </div>
            <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white text-black hover:bg-gray-200">
              <Camera className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">John Doe</h2>
            <p className="text-gray-400 mb-2">Computer Science Student</p>
            <div className="flex items-center space-x-4">
              <Badge className="bg-white text-black">Rank #127</Badge>
              <Badge className="bg-gray-700 text-white">4.2 ⭐</Badge>
              <Badge className="bg-gray-600 text-white">Y2 Student</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Full Name</Label>
            <Input 
              defaultValue="John Doe" 
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Email</Label>
            <Input 
              defaultValue="john.doe@university.edu" 
              className="mt-1 bg-gray-800 border-gray-700 text-white"
              disabled
            />
          </div>
          <div>
            <Label className="text-gray-300">University</Label>
            <Select>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="MIT" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="mit">MIT</SelectItem>
                <SelectItem value="stanford">Stanford</SelectItem>
                <SelectItem value="harvard">Harvard</SelectItem>
                <SelectItem value="caltech">Caltech</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Current Year</Label>
            <Select>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Y2" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="y0">Y0</SelectItem>
                <SelectItem value="y1">Y1</SelectItem>
                <SelectItem value="y2">Y2</SelectItem>
                <SelectItem value="y3">Y3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Phone Number</Label>
            <Input 
              defaultValue="+1 (555) 123-4567" 
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">LinkedIn</Label>
            <Input 
              defaultValue="linkedin.com/in/johndoe" 
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
        <div className="mt-4">
          <Label className="text-gray-300">Bio</Label>
          <Textarea 
            defaultValue="Computer Science student at MIT with a passion for software engineering and financial technology..."
            className="mt-1 bg-gray-800 border-gray-700 text-white"
            rows={3}
          />
        </div>
      </Card>
    </div>
  );

  const AcademicTab = () => (
    <div className="space-y-6">
      {/* Academic Performance */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Academic Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-300">Current GPA</Label>
            <Input 
              defaultValue="3.8" 
              type="number" 
              step="0.1" 
              max="4.0"
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Grade (Y2)</Label>
            <Select>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="First" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="first">First</SelectItem>
                <SelectItem value="2:1">2:1</SelectItem>
                <SelectItem value="2:2">2:2</SelectItem>
                <SelectItem value="third">Third</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* A-Levels & GCSEs */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Qualifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-300 mb-3 block">A-Levels</Label>
            <div className="space-y-2">
              {["Maths", "Physics", "Chemistry"].map((subject, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input 
                    defaultValue={subject} 
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                  />
                  <Select>
                    <SelectTrigger className="w-20 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="A*" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="a*">A*</SelectItem>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                      <SelectItem value="c">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-gray-300 mb-3 block">GCSE Count</Label>
            <Input 
              defaultValue="11" 
              type="number"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <p className="text-gray-400 text-sm mt-2">Number of GCSEs achieved at grade C or above</p>
          </div>
        </div>
      </Card>

      {/* Awards & Certifications */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Awards & Certifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-300">Awards Count</Label>
            <Input 
              defaultValue="3" 
              type="number"
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Certifications Count</Label>
            <Input 
              defaultValue="5" 
              type="number"
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const ExperienceTab = () => (
    <div className="space-y-6">
      {/* General Experience */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Experience Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-gray-300">Bank Internship Tier</Label>
            <Select>
              <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Elite Boutique" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="bulge">Bulge Bracket</SelectItem>
                <SelectItem value="elite">Elite Boutique</SelectItem>
                <SelectItem value="middle">Middle Market</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Industry Exposure</Label>
            <Select>
              <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Summer Internship" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="shadowing">Shadowing</SelectItem>
                <SelectItem value="spring">Spring Week</SelectItem>
                <SelectItem value="summer">Summer Internship</SelectItem>
                <SelectItem value="placement">Placement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Months of Experience</Label>
            <Input 
              defaultValue="6" 
              type="number"
              className="mt-1 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </Card>

      {/* Internships */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Internships</h3>
          <Button onClick={addInternship} className="bg-white text-black hover:bg-gray-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Internship
          </Button>
        </div>
        <div className="space-y-4">
          {internships.map((internship) => (
            <div key={internship.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-700 rounded-lg">
              <Input 
                placeholder="Company" 
                defaultValue={internship.company}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Input 
                placeholder="Role" 
                defaultValue={internship.role}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Input 
                placeholder="Duration" 
                defaultValue={internship.duration}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Input 
                placeholder="Year" 
                defaultValue={internship.year}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeInternship(internship.id)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Society Roles */}
      <Card className="bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Society Roles</h3>
          <Button onClick={addSociety} className="bg-white text-black hover:bg-gray-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Society
          </Button>
        </div>
        <div className="space-y-4">
          {societies.map((society) => (
            <div key={society.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-700 rounded-lg">
              <Input 
                placeholder="Society Name" 
                defaultValue={society.name}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder={society.role || "Role"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="committee">Committee</SelectItem>
                  <SelectItem value="president">President</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder={society.size || "Size"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Years" 
                defaultValue={society.years}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => removeSociety(society.id)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your personal information, academic records, and experience</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b border-gray-800">
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("personal")}
            className={activeTab === "personal" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("academic")}
            className={activeTab === "academic" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Academic
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveTab("experience")}
            className={activeTab === "experience" 
              ? "bg-white text-black hover:bg-gray-200 border-b-2 border-white" 
              : "text-gray-300 hover:text-white hover:bg-gray-800"
            }
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Experience
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "personal" && <PersonalInfoTab />}
        {activeTab === "academic" && <AcademicTab />}
        {activeTab === "experience" && <ExperienceTab />}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button className="bg-white text-black hover:bg-gray-200">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
} 