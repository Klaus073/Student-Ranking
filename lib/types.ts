import { CFG } from "./cfg";

export type University = {
  id: string;
  name: string;
};

export type Profile = {
  id: string;
  name: string;
  email: string;
  university_id: string;
  year: 0 | 1 | 2 | 3;
  alevels: string[];
  gcses: string[];
  grade_y2?: string;
  grade_y3?: string;
  awards: number;
  certifications: number;
  bank_tier: string;
  exposure: string;
  months_experience: number;
  updated_at: string;
};

export type Internship = {
  id: string;
  profile_id: string;
  tier: string;
  months: number;
  years: number;
};

export type SocietyRole = {
  id: string;
  profile_id: string;
  role: string;
  size: string;
  years: number;
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