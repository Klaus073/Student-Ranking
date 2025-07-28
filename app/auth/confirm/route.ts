import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType, type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface InternshipMetadata {
  tier: string;
  months: number;
  years: number;
}

interface SocietyRoleMetadata {
  role: string;
  size: string;
  years: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
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
    tokenPreview: token_hash ? `${token_hash.substring(0, 8)}...` : 'none',
    nextUrl: next
  });

  // Log to ensure this route is actually being called
  console.log('🌐 CONFIRM ROUTE ACCESSED - Route is working!');

  if (!token_hash || !type) {
    console.error('❌ MISSING TOKEN/TYPE - redirecting to error');
    redirect(`/auth/error?error=Invalid confirmation link - missing token or type`);
  }

  try {
    console.log('🔨 Creating Supabase client...');
    const supabase = await createClient();
    console.log('✅ Supabase client created successfully');

    // Verify the OTP token
    console.log('🔍 Starting OTP verification...', { type, tokenLength: token_hash.length });
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    
    if (error) {
      console.error('❌ OTP VERIFICATION FAILED:', {
        error: error.message,
        code: error.status,
        timestamp
      });
      redirect(`/auth/error?error=OTP verification failed: ${encodeURIComponent(error.message)}`);
    }

    if (!data.user) {
      console.error('❌ NO USER DATA from OTP verification');
      redirect(`/auth/error?error=No user data returned from verification`);
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
        university: data.user.user_metadata.university
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
      redirect(`/auth/error?error=Profile creation failed: ${encodeURIComponent(profileResult.error || 'Unknown error')}`);
    }

    console.log('🎉 COMPLETE SUCCESS - Profile created, redirecting to:', next);
    redirect(next);

  } catch (error) {
    console.error('💥 UNEXPECTED ERROR in auth confirmation:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      timestamp
    });
    redirect(`/auth/error?error=Authentication failed: ${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
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
      grades: metadata.grades || null,
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
    if (metadata.a_levels && Array.isArray(metadata.a_levels)) {
      console.log(`📚 Creating ${metadata.a_levels.length} A-Level records...`);
      const aLevelRecords = metadata.a_levels.map((subject: string) => ({
        user_id: user.id,
        subject: subject,
      }));
      
      const { error: aLevelsError } = await supabase
        .from('student_alevels')
        .insert(aLevelRecords);
      
      if (aLevelsError) {
        console.error('❌ Error creating A-levels:', aLevelsError);
        return { success: false, error: `A-levels creation failed: ${aLevelsError.message}` };
      }
      console.log(`✅ Created ${aLevelRecords.length} A-level records`);
    }

    // 3. Create GCSE records
    if (metadata.gcses && Array.isArray(metadata.gcses)) {
      console.log(`📖 Creating ${metadata.gcses.length} GCSE records...`);
      const gcseRecords = metadata.gcses.map((subject: string) => ({
        user_id: user.id,
        subject: subject,
      }));
      
      const { error: gcsesError } = await supabase
        .from('student_gcses')
        .insert(gcseRecords);
      
      if (gcsesError) {
        console.error('❌ Error creating GCSEs:', gcsesError);
        return { success: false, error: `GCSEs creation failed: ${gcsesError.message}` };
      }
      console.log(`✅ Created ${gcseRecords.length} GCSE records`);
    }

    // 4. Create internship records
    if (metadata.internships && Array.isArray(metadata.internships)) {
      console.log(`💼 Creating ${metadata.internships.length} internship records...`);
      const internshipRecords = metadata.internships
        .filter((internship: InternshipMetadata) => internship.tier && internship.tier.trim())
        .map((internship: InternshipMetadata) => ({
          user_id: user.id,
          tier: internship.tier,
          months: internship.months || 0,
          year: internship.years || 0,
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
    if (metadata.society_roles && Array.isArray(metadata.society_roles)) {
      console.log(`🏛️ Creating ${metadata.society_roles.length} society role records...`);
      const societyRecords = metadata.society_roles
        .filter((role: SocietyRoleMetadata) => role.role && role.role.trim())
        .map((role: SocietyRoleMetadata) => ({
          user_id: user.id,
          role_title: role.role,
          society_size: role.size.toLowerCase(), // Ensure lowercase for constraint
          years_active: role.years || 0,
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
