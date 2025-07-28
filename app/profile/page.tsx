"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile?.profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-yellow-200">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">No Profile Found</h2>
            <p className="text-yellow-500">
              Your profile hasn&apos;t been created yet. Please complete the signup process.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Full Name</h3>
              <p className="text-lg">{profile.profile.full_name}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Current Year</h3>
              <p className="text-lg">Year {profile.profile.current_year}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">University</h3>
              <p className="text-lg">{profile.profile.university}</p>
            </div>
            {profile.profile.grades && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600">Current Grades</h3>
                <p className="text-lg">{profile.profile.grades}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Academic Background */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>A-Level Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.alevels.length > 0 ? (
                profile.alevels.map((alevel) => (
                  <Badge key={alevel.id} variant="secondary">
                    {alevel.subject}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No A-Level subjects recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GCSE Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.gcses.length > 0 ? (
                profile.gcses.map((gcse) => (
                  <Badge key={gcse.id} variant="outline">
                    {gcse.subject}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No GCSE subjects recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Bank Tier</h3>
              <p className="text-lg">{profile.profile.bank_internship_tier || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Industry Exposure</h3>
              <p className="text-lg">{profile.profile.industry_exposure || 'Not specified'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Months of Experience</h3>
              <p className="text-lg">{profile.profile.months_of_experience} months</p>
            </div>
          </div>

          {/* Internships */}
          {profile.internships.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Internships</h3>
              <div className="space-y-2">
                {profile.internships.map((internship) => (
                  <div key={internship.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{internship.tier}</p>
                      <p className="text-sm text-gray-600">
                        {internship.months} months • {internship.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements & Leadership */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements & Leadership</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Awards</h3>
              <p className="text-2xl font-bold text-blue-600">{profile.profile.awards}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-600">Certifications</h3>
              <p className="text-2xl font-bold text-green-600">{profile.profile.certifications}</p>
            </div>
          </div>

          {/* Society Roles */}
          {profile.societyRoles.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Society Roles</h3>
              <div className="space-y-2">
                {profile.societyRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{role.role_title}</p>
                      <p className="text-sm text-gray-600">
                        {role.society_size} • {role.years_active} years
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 