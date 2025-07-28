import { CFG } from "./cfg";

export type University = {
  id: string;
  name: string;
};

export type Profile = {
  user_id: string;
  full_name: string;
  current_year: 0 | 1 | 2 | 3;
  university: string;
  grades?: string;
  bank_internship_tier?: string;
  industry_exposure?: string;
  months_of_experience: number;
  awards: number;
  certifications: number;
  created_at: string;
  updated_at: string;
};

export type StudentALevel = {
  id: string;
  user_id: string;
  subject: string;
  created_at: string;
};

export type StudentGCSE = {
  id: string;
  user_id: string;
  subject: string;
  created_at: string;
};

export type Internship = {
  id: string;
  user_id: string;
  tier: string;
  months: number;
  year: number;
  created_at: string;
};

export type SocietyRole = {
  id: string;
  user_id: string;
  role_title: string;
  society_size: string;
  years_active: number;
  created_at: string;
};

export type UserProfile = {
  profile: Profile | null;
  alevels: StudentALevel[];
  gcses: StudentGCSE[];
  internships: Internship[];
  societyRoles: SocietyRole[];
};

export type Ranking = {
  rank: number;
  profile_id: string;
  academic_score: number;
  experience_score: number;
  composite_score: number;
  star_rating: number;
};

export type CFGType = typeof CFG; 