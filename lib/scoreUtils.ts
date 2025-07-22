import { Profile, Internship, SocietyRole } from "./types";

export function calculateAcademicScore(profile: Profile): number {
  // Example: base on grades, awards, certifications
  let score = 0;
  if (profile.grade_y2) score += gradeToScore(profile.grade_y2);
  if (profile.grade_y3) score += gradeToScore(profile.grade_y3);
  score += profile.awards * 5;
  score += profile.certifications * 5;
  return Math.min(100, score);
}

function gradeToScore(grade: string): number {
  switch (grade) {
    case "First": return 40;
    case "2:1": return 30;
    case "2:2": return 20;
    case "Third": return 10;
    default: return 0;
  }
}

export function calculateExperienceScore(
  profile: Profile,
  internships: Internship[],
  societies: SocietyRole[]
): number {
  let score = 0;
  score += Math.min(30, profile.months_experience * 2);
  score += internships.length * 5;
  score += societies.length * 5;
  if (profile.bank_tier === "Bulge Bracket") score += 10;
  if (profile.exposure === "Summer Internship") score += 10;
  return Math.min(100, score);
}

export function calculateCompositeScore(academic: number, experience: number): number {
  return Math.round(0.6 * academic + 0.4 * experience);
}

export function getStarRating(composite: number): number {
  if (composite >= 90) return 5;
  if (composite >= 75) return 4;
  if (composite >= 60) return 3;
  if (composite >= 45) return 2;
  if (composite >= 30) return 1;
  return 0;
} 