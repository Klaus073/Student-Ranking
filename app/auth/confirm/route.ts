import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType, type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/cfg";

interface InternshipMetadata {
  tier: string; // "1" | "2" | "3"
  months: number; // 1..12
  year: number; // 2020..2030
}

interface SocietyRoleMetadata {
  role_title: string; // president | vice | committee | member
  society_size: string; // small | medium | large
  years_ago: number; // 0..4
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Handle both new and old Supabase auth formats
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  // CRITICAL: Add timestamp and full URL logging
  const timestamp = new Date().toISOString();
  const fullUrl = request.url;
  
  console.log('🔐 AUTH CONFIRMATION ROUTE HIT:', { 
    timestamp,
    fullUrl,
    type, 
    hasToken: !!token_hash,
    hasCode: !!code,
    tokenPreview: token_hash ? `${token_hash.substring(0, 8)}...` : 'none',
    codePreview: code ? `${code.substring(0, 8)}...` : 'none',
    nextUrl: next
  });

  // Log to ensure this route is actually being called
  console.log('🌐 CONFIRM ROUTE ACCESSED - Route is working!');

  // Check if we have either the new format (code) or old format (token_hash + type)
  if (!code && (!token_hash || !type)) {
    console.error('❌ MISSING TOKEN/CODE - redirecting to error');
    const errorUrl = new URL('/auth/error?error=Invalid confirmation link - missing token, code, or type', request.url);
    return NextResponse.redirect(errorUrl);
  }

  try {
    console.log('🔨 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');

    // Verify the OTP token - handle both new and old formats
    let data, error;
    
    if (code) {
      // New format: use exchangeCodeForSession instead of verifyOtp
      console.log('🔍 Starting code exchange for session...', { codeLength: code.length });
      const result = await supabase.auth.exchangeCodeForSession(code);
      data = result.data;
      error = result.error;
    } else {
      // Old format: use token_hash and type
      console.log('🔍 Starting OTP verification with token_hash...', { type, tokenLength: token_hash!.length });
      const result = await supabase.auth.verifyOtp({
        type: type!,
        token_hash: token_hash!,
      });
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('❌ OTP VERIFICATION FAILED:', {
        error: error.message,
        code: error.status,
        timestamp
      });
      const errorUrl = new URL(`/auth/error?error=OTP verification failed: ${encodeURIComponent(error.message)}`, request.url);
      return NextResponse.redirect(errorUrl);
    }

    if (!data.user) {
      console.error('❌ NO USER DATA from OTP verification');
      const errorUrl = new URL('/auth/error?error=No user data returned from verification', request.url);
      return NextResponse.redirect(errorUrl);
    }

    console.log('✅ OTP VERIFICATION SUCCESS:', { 
      userId: data.user.id, 
      email: data.user.email,
      emailConfirmed: data.user.email_confirmed_at,
      hasMetadata: !!data.user.user_metadata && Object.keys(data.user.user_metadata).length > 0
    });
    
    // IMPORTANT: Log the actual metadata we're trying to process
    if (data.user.user_metadata) {
      console.log('📊 USER METADATA FOUND:', {
        metadataKeys: Object.keys(data.user.user_metadata),
        fullName: data.user.user_metadata.full_name,
        university: data.user.user_metadata.university,
        alevel_band: data.user.user_metadata.alevel_band,
        gcse_band: data.user.user_metadata.gcse_band,
        uni_grades_band: data.user.user_metadata.uni_grades_band
      });
    } else {
      console.log('⚠️ NO USER METADATA - will create minimal profile');
    }
    
    // Create user profile and related records
    console.log('🏗️ Starting profile creation process...');
    const profileResult = await createUserProfileReliably(supabase, data.user);
    
    if (!profileResult.success) {
      console.error('❌ PROFILE CREATION FAILED:', {
        error: profileResult.error,
        userId: data.user.id,
        timestamp
      });
      const errorUrl = new URL(`/auth/error?error=Profile creation failed: ${encodeURIComponent(profileResult.error || 'Unknown error')}`, request.url);
      return NextResponse.redirect(errorUrl);
    }

    console.log('🎉 COMPLETE SUCCESS - Profile created, redirecting to:', next);
    
    // Create a response with proper redirect and ensure cookies are set
    const base = getSiteUrl().replace(/\/$/, "");
    const redirectUrl = new URL(next, base);
    const response = NextResponse.redirect(redirectUrl);
    
    // Copy any session cookies from Supabase client to response
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const allCookies = (await cookieStore).getAll();
    allCookies.forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    return response;

  } catch (error) {
    console.error('💥 UNEXPECTED ERROR in auth confirmation:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      timestamp
    });
    const errorUrl = new URL(`/auth/error?error=Authentication failed: ${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url);
    return NextResponse.redirect(errorUrl);
  }
}

async function createUserProfileReliably(supabase: SupabaseClient, user: User): Promise<{success: boolean, error?: string}> {
  try {
    console.log('🏗️ PROFILE CREATION START:', {
      userId: user.id,
      email: user.email,
      created: user.created_at,
      timestamp: new Date().toISOString()
    });
    
    // Check if profile already exists
    console.log('🔍 Checking if profile already exists...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking existing profile:', checkError);
      return { success: false, error: `Database check failed: ${checkError.message}` };
    }

    if (existingProfile) {
      console.log('✅ Profile already exists for user, skipping creation');
      return { success: true };
    }

    // Get user metadata
    const metadata = user.user_metadata;
    if (!metadata) {
      console.log('⚠️ No metadata found for user, creating minimal profile');
      await createMinimalProfile(supabase, user);
      return { success: true };
    }

    console.log('📋 Found metadata with keys:', Object.keys(metadata));
    console.log('👤 Full name:', metadata.full_name);
    console.log('🏫 University:', metadata.university);

    // Begin transaction-like operations
    console.log('💾 Creating main profile record...');
    
    // 1. Create main profile record
    const profileData = {
      user_id: user.id,
      full_name: metadata.full_name || 'Unknown User',
      current_year: metadata.current_year ? parseInt(metadata.current_year) : null,
      university: metadata.university || null,
      grades: (metadata as any).uni_grades_band || null,
      bank_internship_tier: metadata.bank_internship_tier || null,
      industry_exposure: metadata.industry_exposure || null,
      months_of_experience: parseInt(metadata.months_of_experience as string) || 0,
      awards: parseInt(metadata.awards as string) || 0,
      certifications: parseInt(metadata.certifications as string) || 0,
    };

    const { error: profileError } = await supabase
      .from('student_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('❌ Error creating main profile:', profileError);
      return { success: false, error: `Profile creation failed: ${profileError.message}` };
    }
    console.log('✅ Main profile created successfully');

    // 2. Create A-Level records
    // Persist A-level subjects if provided
    if ((metadata as any).a_levels && Array.isArray((metadata as any).a_levels)) {
      console.log(`📚 Creating ${(metadata as any).a_levels.length} A-Level subject records...`);
      const aLevelRecords = (metadata as any).a_levels.map((subject: string) => ({
        user_id: user.id,
        subject,
      }));
      const { error: aLevelsError } = await supabase.from('student_alevels').insert(aLevelRecords);
      if (aLevelsError) {
        console.error('❌ Error creating A-level subjects:', aLevelsError);
        return { success: false, error: `A-levels creation failed: ${aLevelsError.message}` };
      }
      console.log(`✅ Created ${aLevelRecords.length} A-level subject records`);
    }

    // 3. Create GCSE records
    // Persist GCSE subjects if provided
    if ((metadata as any).gcses && Array.isArray((metadata as any).gcses)) {
      console.log(`📖 Creating ${(metadata as any).gcses.length} GCSE subject records...`);
      const gcseRecords = (metadata as any).gcses.map((subject: string) => ({
        user_id: user.id,
        subject,
      }));
      const { error: gcsesError } = await supabase.from('student_gcses').insert(gcseRecords);
      if (gcsesError) {
        console.error('❌ Error creating GCSE subjects:', gcsesError);
        return { success: false, error: `GCSEs creation failed: ${gcsesError.message}` };
      }
      console.log(`✅ Created ${gcseRecords.length} GCSE subject records`);
    }

    // 4. Create internship records
    if ((metadata as any).internships && Array.isArray((metadata as any).internships)) {
      console.log(`💼 Creating ${(metadata as any).internships.length} internship records...`);
      const internshipRecords = (metadata as any).internships
        .filter((internship: InternshipMetadata) => internship.tier && internship.tier.trim())
        .map((internship: InternshipMetadata) => ({
          user_id: user.id,
          tier: internship.tier,
          months: internship.months || 0,
          year: internship.year || 0,
        }));
      
      if (internshipRecords.length > 0) {
        const { error: internshipsError } = await supabase
          .from('student_internships')
          .insert(internshipRecords);
        
        if (internshipsError) {
          console.error('❌ Error creating internships:', internshipsError);
          return { success: false, error: `Internships creation failed: ${internshipsError.message}` };
        }
        console.log(`✅ Created ${internshipRecords.length} internship records`);
      }
    }

    // 5. Create society role records
    if ((metadata as any).society_roles && Array.isArray((metadata as any).society_roles)) {
      console.log(`🏛️ Creating ${(metadata as any).society_roles.length} society role records...`);
      const societyRecords = (metadata as any).society_roles
        .filter((role: SocietyRoleMetadata) => role.role_title && role.role_title.trim())
        .map((role: SocietyRoleMetadata) => ({
          user_id: user.id,
          role_title: role.role_title,
          society_size: role.society_size.toLowerCase(), // Ensure lowercase for constraint
          years_active: role.years_ago || 0,
        }));
      
      if (societyRecords.length > 0) {
        const { error: societyError } = await supabase
          .from('student_society_roles')
          .insert(societyRecords);
        
        if (societyError) {
          console.error('❌ Error creating society roles:', societyError);
          return { success: false, error: `Society roles creation failed: ${societyError.message}` };
        }
        console.log(`✅ Created ${societyRecords.length} society role records`);
      }
    }

    console.log('🎉 All profile data created successfully for user:', user.id);
    return { success: true };

  } catch (error) {
    console.error('❌ Unexpected error in createUserProfileReliably:', error);
    return { 
      success: false, 
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

async function createMinimalProfile(supabase: SupabaseClient, user: User): Promise<void> {
  console.log('📝 Creating minimal profile for user without metadata');
  
  const { error } = await supabase
    .from('student_profiles')
    .insert({
      user_id: user.id,
      full_name: user.email?.split('@')[0] || 'User',
      current_year: null,
      university: null,
      grades: null,
      bank_internship_tier: null,
      industry_exposure: null,
      months_of_experience: 0,
      awards: 0,
      certifications: 0,
    });

  if (error) {
    console.error('❌ Error creating minimal profile:', error);
    throw new Error(`Minimal profile creation failed: ${error.message}`);
  }
  
  console.log('✅ Minimal profile created');
}
