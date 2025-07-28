import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Profile API: No authenticated user');
      return NextResponse.json({ 
        error: "Not authenticated", 
        authenticated: false,
        message: "User must be logged in to access profile data"
      }, { status: 401 });
    }

    console.log('Profile API: Fetching data for user:', user.id);

    // Get main profile
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Profile API: Profile query error:', profileError);
      return NextResponse.json({ 
        error: profileError.message, 
        code: profileError.code 
      }, { status: 400 });
    }

    // Get related data
    const [alevels, gcses, internships, societyRoles] = await Promise.all([
      supabase.from("student_alevels").select("*").eq("user_id", user.id),
      supabase.from("student_gcses").select("*").eq("user_id", user.id),
      supabase.from("student_internships").select("*").eq("user_id", user.id),
      supabase.from("student_society_roles").select("*").eq("user_id", user.id),
    ]);

    // Check for errors in related data queries
    if (alevels.error) {
      console.error('Profile API: A-levels query error:', alevels.error);
    }
    if (gcses.error) {
      console.error('Profile API: GCSEs query error:', gcses.error);
    }
    if (internships.error) {
      console.error('Profile API: Internships query error:', internships.error);
    }
    if (societyRoles.error) {
      console.error('Profile API: Society roles query error:', societyRoles.error);
    }

    console.log('Profile API: Successfully fetched data:', {
      profileExists: !!profile,
      alevelsCount: alevels.data?.length || 0,
      gcsesCount: gcses.data?.length || 0,
      internshipsCount: internships.data?.length || 0,
      societyRolesCount: societyRoles.data?.length || 0,
    });

    return NextResponse.json({
      authenticated: true,
      profile: profile || null,
      alevels: alevels.data || [],
      gcses: gcses.data || [],
      internships: internships.data || [],
      societyRoles: societyRoles.data || [],
    });
  } catch (error) {
    console.error('Profile API: Unexpected error:', error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Update main profile
    const { error: profileError } = await supabase
      .from("student_profiles")
      .upsert({
        user_id: user.id,
        full_name: body.full_name,
        current_year: body.current_year,
        university: body.university,
        grades: body.grades,
        bank_internship_tier: body.bank_internship_tier,
        industry_exposure: body.industry_exposure,
        months_of_experience: body.months_of_experience || 0,
        awards: body.awards || 0,
        certifications: body.certifications || 0,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Delete Profile API: No authenticated user');
      return NextResponse.json({ 
        error: "Not authenticated", 
        authenticated: false
      }, { status: 401 });
    }

    console.log('Delete Profile API: Deleting user data for:', user.id);

    // The CASCADE DELETE will automatically remove all related records
    // when the user is deleted from auth.users
    
    // Alternative: Manual cleanup before auth deletion
    // You can use this if you want more control over the deletion process
    /*
    const deletions = await Promise.all([
      supabase.from('student_society_roles').delete().eq('user_id', user.id),
      supabase.from('student_internships').delete().eq('user_id', user.id), 
      supabase.from('student_gcses').delete().eq('user_id', user.id),
      supabase.from('student_alevels').delete().eq('user_id', user.id),
      supabase.from('student_profiles').delete().eq('user_id', user.id),
    ]);
    
    console.log('Manual cleanup completed');
    */

    // Delete the user from auth (this will cascade delete all related data)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error('Delete Profile API: Auth deletion failed:', deleteError);
      return NextResponse.json({ 
        error: `User deletion failed: ${deleteError.message}` 
      }, { status: 400 });
    }

    console.log('Delete Profile API: User and all data successfully deleted');
    
    return NextResponse.json({ 
      success: true,
      message: "User and all associated data deleted successfully"
    });
    
  } catch (error) {
    console.error('Delete Profile API: Unexpected error:', error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 