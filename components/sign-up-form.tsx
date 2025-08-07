"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CFG } from "@/lib/cfg";
import { PlusIcon, XIcon } from "lucide-react";

interface Internship {
  tier: string;
  months: number;
  years: number;
}

interface SocietyRole {
  role: string;
  size: string;
  years: number;
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // Basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // New comprehensive fields
  const [university, setUniversity] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [aLevels, setALevels] = useState<string[]>([]);
  const [gcses, setGcses] = useState<string[]>([]);
  const [grades, setGrades] = useState("");
  const [awards, setAwards] = useState(0);
  const [certifications, setCertifications] = useState(0);
  const [bankInternshipTier, setBankInternshipTier] = useState("");
  const [industryExposure, setIndustryExposure] = useState("");
  const [monthsOfExperience, setMonthsOfExperience] = useState(0);
  
  // Dynamic sections
  const [internships, setInternships] = useState<Internship[]>([]);
  const [societyRoles, setSocietyRoles] = useState<SocietyRole[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getUniversityOptions = () => {
    const yearNum = parseInt(currentYear);
    if (yearNum === 1) return CFG.lookups.uni_y1;
    if (yearNum === 2) return CFG.lookups.uni_y2;
    if (yearNum === 3) return CFG.lookups.uni_y3;
    return CFG.lookups.uni_y1; // Default to y1
  };

  const shouldShowGrades = () => {
    const yearNum = parseInt(currentYear);
    return yearNum === 2 || yearNum === 3;
  };

  const getGradeOptions = () => {
    const yearNum = parseInt(currentYear);
    if (yearNum === 2) return CFG.lookups.grade_y2;
    if (yearNum === 3) return CFG.lookups.grade_y3;
    return [];
  };

  const addInternship = () => {
    setInternships([...internships, { tier: "", months: 0, years: 0 }]);
  };

  const removeInternship = (index: number) => {
    setInternships(internships.filter((_, i) => i !== index));
  };

  const updateInternship = (index: number, field: keyof Internship, value: string | number) => {
    const updated = [...internships];
    updated[index] = { ...updated[index], [field]: value };
    setInternships(updated);
  };

  const addSocietyRole = () => {
    setSocietyRoles([...societyRoles, { role: "", size: "", years: 0 }]);
  };

  const removeSocietyRole = (index: number) => {
    setSocietyRoles(societyRoles.filter((_, i) => i !== index));
  };

  const updateSocietyRole = (index: number, field: keyof SocietyRole, value: string | number) => {
    const updated = [...societyRoles];
    updated[index] = { ...updated[index], [field]: value };
    setSocietyRoles(updated);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your full name");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!university) {
      setError("Please select your university");
      setIsLoading(false);
      return;
    }

    if (!currentYear) {
      setError("Please select your current year");
      setIsLoading(false);
      return;
    }

    console.log('Starting signup process for:', email);
    
    // Debug: Log the redirect URL that will be used
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const baseUrl = siteUrl.replace(/\/$/, '').replace(/\s+/g, '').trim();
    const redirectUrl = `${baseUrl}/auth/confirm?next=/dashboard`;
    console.log('Email redirect URL:', redirectUrl);
    console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);
    console.log('window.location.origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A (server-side)');

    try {
      const signupData = {
        full_name: name.trim(),
        university,
        current_year: currentYear,
        a_levels: aLevels,
        gcses: gcses,
        grades: shouldShowGrades() ? grades : null,
        awards,
        certifications,
        bank_internship_tier: bankInternshipTier,
        industry_exposure: industryExposure,
        months_of_experience: monthsOfExperience,
        internships,
        society_roles: societyRoles,
      };

      console.log('Signup data prepared:', {
        ...signupData,
        internships_count: internships.length,
        society_roles_count: societyRoles.length,
      });

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // After the user clicks the confirmation link, Supabase will redirect
          // them back to this URL. Our /auth/confirm route handles OTP verification
          // and profile creation, finally redirecting the user onwards (e.g. dashboard).
          emailRedirectTo: redirectUrl,
          data: signupData,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('User already registered')) {
          setError("An account with this email already exists. Please try logging in instead.");
        } else if (error.message.includes('Invalid email')) {
          setError("Please enter a valid email address");
        } else if (error.message.includes('Password')) {
          setError("Password requirements not met. Please choose a stronger password.");
        } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
          setError("An account with this email already exists. Please try logging in instead.");
        } else {
          setError(`Signup failed: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        console.log('Signup successful for user:', data.user.id);
        console.log('User metadata saved:', !!data.user.user_metadata);
        router.push("/auth/sign-up-success");
      } else {
        console.error('Signup completed but no user data returned');
        setError("Signup completed but verification required. Please check your email.");
      }

    } catch (error: unknown) {
      console.error('Unexpected signup error:', error);
      setError(error instanceof Error ? `Unexpected error: ${error.message}` : "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto px-6 md:px-8 lg:px-10 py-8", className)} {...props}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Create Your Account</h1>
        <p className="text-lg text-muted-foreground">Join StudentRank to track your academic and professional progress</p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-8">
        
        {/* SECTION 1: Personal Information */}
        <section>
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold mr-3">
              1
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
          </div>
          
          <Card className="w-full">
            <CardContent className="p-6 space-y-6">
              {/* Row 1: Full Name and Email Address (side by side, 50/50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@university.ac.uk"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Row 2: Password (full width) */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 2: Academic Background */}
        <section>
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold mr-3">
              2
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Academic Background</h2>
              <p className="text-muted-foreground">Your educational details</p>
            </div>
          </div>
          
          <Card className="w-full">
            <CardContent className="p-6 space-y-6">
              {/* Row 1: Current Year and University (side by side, 50/50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="current-year" className="text-base font-medium">Current Year</Label>
                  <Select value={currentYear} onValueChange={setCurrentYear}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select your current year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Year 0 (Foundation)</SelectItem>
                      <SelectItem value="1">Year 1 (First Year)</SelectItem>
                      <SelectItem value="2">Year 2 (Second Year)</SelectItem>
                      <SelectItem value="3">Year 3 (Final Year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-base font-medium">University</Label>
                  <Select value={university} onValueChange={setUniversity}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniversityOptions().map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          {uni}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: A-Level and GCSE Subjects (side by side, 50/50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium">A-Level Subjects</Label>
                  <MultiSelect
                    options={CFG.lookups.alevel}
                    value={aLevels}
                    onChange={setALevels}
                    placeholder="Select your A-Level subjects"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">GCSE Subjects</Label>
                  <MultiSelect
                    options={CFG.lookups.gcse}
                    value={gcses}
                    onChange={setGcses}
                    placeholder="Select your GCSE subjects"
                  />
                </div>
              </div>

              {/* Row 3: Grades (full width, ONLY VISIBLE when Current Year = 2 or 3) */}
              {shouldShowGrades() && (
                <div className="space-y-2">
                  <Label htmlFor="grades" className="text-base font-medium">Current Grade Classification</Label>
                  <Select value={grades} onValueChange={setGrades}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select your current grade classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {getGradeOptions().map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: Professional Experience */}
        <section>
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold mr-3">
              3
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Professional Experience</h2>
              <p className="text-muted-foreground">Your work experience</p>
            </div>
          </div>
          
          <Card className="w-full">
            <CardContent className="p-6 space-y-6">
              {/* Row 1: Bank Internship Tier and Industry Exposure (side by side, 50/50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bank-tier" className="text-base font-medium">Bank Internship Tier</Label>
                  <Select value={bankInternshipTier} onValueChange={setBankInternshipTier}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select bank tier (if applicable)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CFG.lookups.bank_tier.map((tier) => (
                        <SelectItem key={tier} value={tier}>
                          {tier}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry-exposure" className="text-base font-medium">Industry Exposure</Label>
                  <Select value={industryExposure} onValueChange={setIndustryExposure}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {CFG.lookups.exposure.map((exposure) => (
                        <SelectItem key={exposure} value={exposure}>
                          {exposure}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Months of Experience (50% width) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="months-experience" className="text-base font-medium">Months of Experience</Label>
                  <Input
                    id="months-experience"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={monthsOfExperience}
                    onChange={(e) => setMonthsOfExperience(parseInt(e.target.value) || 0)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Horizontal line separator */}
              <div className="border-t border-border my-6"></div>

              {/* SUB-SECTION: Internships (Inside Section 3) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Internships</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addInternship}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Internship
                  </Button>
                </div>

                {internships.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground mb-4">No internships added yet</p>
                    <Button type="button" variant="outline" onClick={addInternship}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Your First Internship
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {internships.map((internship, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Internship {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInternship(index)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* 3 columns: 50%, 25%, 25% */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium">Internship Tier</Label>
                            <Select
                              value={internship.tier}
                              onValueChange={(value) => updateInternship(index, "tier", value)}
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select tier" />
                              </SelectTrigger>
                              <SelectContent>
                                {CFG.lookups.bank_tier.map((tier) => (
                                  <SelectItem key={tier} value={tier}>
                                    {tier}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Months</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="3"
                              value={internship.months}
                              onChange={(e) => updateInternship(index, "months", parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Year</Label>
                            <Input
                              type="number"
                              min="2020"
                              max="2030"
                              placeholder="2024"
                              value={internship.years}
                              onChange={(e) => updateInternship(index, "years", parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 4: Achievements & Leadership */}
        <section>
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold mr-3">
              4
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Achievements & Leadership</h2>
              <p className="text-muted-foreground">Your awards and leadership experience</p>
            </div>
          </div>
          
          <Card className="w-full">
            <CardContent className="p-6 space-y-6">
              {/* Row 1: Awards and Certifications (side by side, 50/50) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="awards" className="text-base font-medium">Awards</Label>
                  <Input
                    id="awards"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={awards}
                    onChange={(e) => setAwards(parseInt(e.target.value) || 0)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications" className="text-base font-medium">Certifications</Label>
                  <Input
                    id="certifications"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={certifications}
                    onChange={(e) => setCertifications(parseInt(e.target.value) || 0)}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Horizontal line separator */}
              <div className="border-t border-border my-6"></div>

              {/* SUB-SECTION: Society Roles (Inside Section 4) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Society Roles</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addSocietyRole}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Society Role
                  </Button>
                </div>

                {societyRoles.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <p className="text-muted-foreground mb-4">No society roles added yet</p>
                    <Button type="button" variant="outline" onClick={addSocietyRole}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Your First Role
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {societyRoles.map((role, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Society Role {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSocietyRole(index)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* 3 columns: 50%, 25%, 25% */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2 space-y-2">
                            <Label className="text-sm font-medium">Role Title</Label>
                            <Input
                              type="text"
                              placeholder="e.g., President, Secretary"
                              value={role.role}
                              onChange={(e) => updateSocietyRole(index, "role", e.target.value)}
                              className="h-10"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Society Size</Label>
                            <Select
                              value={role.size}
                              onValueChange={(value) => updateSocietyRole(index, "size", value)}
                            >
                              <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {CFG.lookups.society_size.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Years</Label>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              placeholder="1"
                              value={role.years}
                              onChange={(e) => updateSocietyRole(index, "years", parseInt(e.target.value) || 0)}
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Submit Button (centered, outside all sections) */}
        <div className="flex justify-center pt-8">
          <Card className="w-full max-w-xl border-2 border-primary/20">
            <CardContent className="p-6 text-center">
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm font-medium">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Your Account...
                  </>
                ) : (
                  "Create My Account"
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
