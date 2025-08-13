"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { UserProfile } from "@/lib/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Toasts (4s lifespan)
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: 'success' | 'error' }[]>([]);
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  // Minimal Modal
  const Modal = ({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl rounded-lg border border-gray-800 bg-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h3 className="text-white font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-gray-800 px-4 py-3">{footer}</div>}
        </div>
      </div>
    );
  };

  // Academic edit state
  const [editAcademic, setEditAcademic] = useState(false);
  const [gradesBand, setGradesBand] = useState<string>("");
  const [awards, setAwards] = useState<number>(0);
  const [certs, setCerts] = useState<number>(0);

  // Internship state
  const [newInternship, setNewInternship] = useState<{ tier: string; months: number; year: number } | null>(null);
  const [editingInternshipId, setEditingInternshipId] = useState<string | null>(null);
  const [editingInternship, setEditingInternship] = useState<{ tier: string; months: number; year: number } | null>(null);

  // Society roles state
  const [newRole, setNewRole] = useState<{ role_title: string; society_size: string; years_active: number; years_ago: number } | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<{ role_title: string; society_size: string; years_active: number; years_ago: number } | null>(null);

  // Year editor
  const [editYearOpen, setEditYearOpen] = useState(false);
  const [yearValue, setYearValue] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      // prime editors
      setGradesBand(data?.profile?.grades || "");
      setAwards(data?.profile?.awards ?? 0);
      setCerts(data?.profile?.certifications ?? 0);
      setYearValue(typeof data?.profile?.current_year === 'number' ? String(data.profile.current_year) : "");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshRanking = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('student_rankings').select('user_id').eq('user_id', user.id).single();
    } catch {}
  };

  const saveYear = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const yearNum = yearValue ? parseInt(yearValue) : null;
      const { error: upErr } = await supabase
        .from('student_profiles')
        .update({ current_year: yearNum })
        .eq('user_id', user.id)
        .single();
      if (upErr) throw upErr;
      await fetchProfile();
      await refreshRanking();
      setEditYearOpen(false);
      addToast('Year updated');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      addToast('Failed to update year', 'error');
    } finally { setSaving(false); }
  };

  const saveAcademic = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await supabase
        .from('student_profiles')
        .update({ grades: gradesBand || null, awards: Math.max(0, awards), certifications: Math.max(0, certs) })
        .eq('user_id', user.id)
        .single();
      if (upErr) throw upErr;
      await fetchProfile();
      await refreshRanking();
      setEditAcademic(false);
      addToast('Academic inputs saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      addToast('Failed to save academic inputs', 'error');
    } finally { setSaving(false); }
  };

  const createInternship = async () => {
    if (!newInternship) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const payload = { user_id: user.id, tier: parseInt(newInternship.tier), months: newInternship.months, year: newInternship.year };
      const { error: insErr } = await supabase.from('student_internships').insert(payload).single();
      if (insErr) throw insErr;
      setNewInternship(null);
      await fetchProfile();
      await refreshRanking();
      addToast('Internship added');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
      addToast('Failed to add internship', 'error');
    } finally { setSaving(false); }
  };

  const updateInternship = async (id: string) => {
    if (!editingInternship) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const updates: any = {};
      if (editingInternship.tier) updates.tier = parseInt(editingInternship.tier);
      if (editingInternship.months) updates.months = editingInternship.months;
      if (editingInternship.year) updates.year = editingInternship.year;
      const { error: upErr } = await supabase
        .from('student_internships')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (upErr) throw upErr;
      setEditingInternshipId(null); setEditingInternship(null);
      await fetchProfile();
      await refreshRanking();
      addToast('Internship updated');
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
    finally { setSaving(false); }
  };

  const deleteInternship = async (id: string) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: delErr } = await supabase
        .from('student_internships')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (delErr) throw delErr;
      await fetchProfile();
      await refreshRanking();
      addToast('Internship deleted');
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setSaving(false); }
  };

  const createRole = async () => {
    if (!newRole) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const payload = { user_id: user.id, ...newRole };
      const { error: insErr } = await supabase.from('student_society_roles').insert(payload).single();
      if (insErr) throw insErr;
      setNewRole(null);
      await fetchProfile();
      await refreshRanking();
      addToast('Role added');
    } catch (e) { setError(e instanceof Error ? e.message : 'Create failed'); }
    finally { setSaving(false); }
  };

  const updateRole = async (id: string) => {
    if (!editingRole) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: upErr } = await supabase
        .from('student_society_roles')
        .update(editingRole)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (upErr) throw upErr;
      setEditingRoleId(null); setEditingRole(null);
      await fetchProfile();
      await refreshRanking();
      addToast('Role updated');
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
    finally { setSaving(false); }
  };

  const deleteRole = async (id: string) => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error: delErr } = await supabase
        .from('student_society_roles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (delErr) throw delErr;
      await fetchProfile();
      await refreshRanking();
      addToast('Role deleted');
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setSaving(false); }
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
            <p className="text-yellow-500">Your profile hasn&apos;t been created yet. Please complete the signup process.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Toasts */}
      <div className="fixed right-4 top-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-2 rounded-md border px-4 py-2 text-sm shadow-xl backdrop-blur ${t.type === 'error' ? 'bg-red-500/15 border-red-400/30 text-red-100' : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100'}`}>
            <span className={`inline-block h-2 w-2 rounded-full ${t.type === 'error' ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold">Your Profile</h1>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="outline" size="sm" onClick={()=>setEditYearOpen(true)}>Edit Year</Button>
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

      {/* Academic Background (subjects) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>A-Level Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.alevels.length > 0 ? (
                profile.alevels.map((alevel) => (
                  <Badge key={alevel.id} variant="secondary">{alevel.subject}</Badge>
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
                  <Badge key={gcse.id} variant="outline">{gcse.subject}</Badge>
                ))
              ) : (
                <p className="text-gray-500">No GCSE subjects recorded</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Inputs (metrics) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Academic Inputs</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditAcademic(true)}>Edit</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Grades</div>
                <div className="text-2xl font-semibold text-white">{profile.profile.grades || '—'}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Awards</div>
                <div className="text-3xl font-bold text-emerald-300">{profile.profile.awards ?? 0}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Certifications</div>
                <div className="text-3xl font-bold text-sky-300">{profile.profile.certifications ?? 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Experience (internships) */}
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

          {profile.internships.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Internships</h3>
              <div className="space-y-2">
                {profile.internships.map((internship) => (
                  <div key={internship.id} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    {editingInternshipId === internship.id ? (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-300">Editing...</div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Tier {internship.tier}</p>
                          <p className="text-sm text-gray-400">{internship.months} months • {internship.year}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={()=>{setEditingInternshipId(internship.id); setEditingInternship({ tier: String(internship.tier), months: internship.months, year: internship.year });}}>Edit</Button>
                          <Button variant="destructive" onClick={()=>deleteInternship(internship.id)} disabled={saving}>Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Button variant="outline" onClick={()=>setNewInternship({ tier: "", months: 1, year: 2024 })}>Add Internship</Button>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Leadership (roles) */}
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

          {profile.societyRoles.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Society Roles</h3>
              <div className="space-y-2">
                {profile.societyRoles.map((role) => (
                  <div key={role.id} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                    {editingRoleId === role.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        <div>
                          <label className="text-sm text-gray-300">Role</label>
                          <Select value={editingRole?.role_title || ""} onValueChange={(v)=>setEditingRole(prev=>({...prev!, role_title: v}))}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                            <SelectContent>
                              {['president','vice','committee','member'].map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Size</label>
                          <Select value={editingRole?.society_size || ""} onValueChange={(v)=>setEditingRole(prev=>({...prev!, society_size: v}))}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                            <SelectContent>
                              {['small','medium','large'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Years Active</label>
                          <Input type="number" min={1} max={4} value={editingRole?.years_active ?? 1} onChange={(e)=>setEditingRole(prev=>({...prev!, years_active: Math.min(4, Math.max(1, parseInt(e.target.value)||1))}))} className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm text-gray-300">Years Ago</label>
                          <Input type="number" min={0} max={4} value={editingRole?.years_ago ?? 0} onChange={(e)=>setEditingRole(prev=>({...prev!, years_ago: Math.min(4, Math.max(0, parseInt(e.target.value)||0))}))} className="mt-1" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={()=>{setEditingRoleId(null); setEditingRole(null);}}>Cancel</Button>
                          <Button onClick={()=>updateRole(role.id)} disabled={saving}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.role_title}</p>
                          <p className="text-sm text-gray-400">{role.society_size} • {role.years_active} years • {role.years_ago} yrs ago</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={()=>{setEditingRoleId(role.id); setEditingRole({ role_title: role.role_title, society_size: role.society_size, years_active: role.years_active, years_ago: role.years_ago });}}>Edit</Button>
                          <Button variant="destructive" onClick={()=>deleteRole(role.id)} disabled={saving}>Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <Button variant="outline" onClick={()=>setNewRole({ role_title: "", society_size: "", years_active: 1, years_ago: 0 })}>Add Role</Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={editYearOpen}
        title="Edit Current Year"
        onClose={()=>setEditYearOpen(false)}
        footer={<><Button variant="ghost" onClick={()=>setEditYearOpen(false)}>Cancel</Button><Button onClick={saveYear} disabled={saving || yearValue === ""}>Save</Button></>}
      >
        <div className="space-y-3">
          <div className="text-sm text-gray-300">Select your current year</div>
          <div className="grid grid-cols-4 gap-3">
            {["0","1","2","3"].map(v => (
              <label key={v} className={`cursor-pointer rounded-md border px-3 py-2 text-center ${yearValue===v ? 'border-white/60 bg-white/5' : 'border-gray-700 bg-transparent'}`}>
                <input type="radio" name="year" value={v} className="hidden" checked={yearValue===v} onChange={(e)=>setYearValue(e.target.value)} />
                <span className="text-white">{v}</span>
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={editAcademic}
        title="Edit Academic Inputs"
        onClose={() => setEditAcademic(false)}
        footer={<><Button variant="ghost" onClick={()=>setEditAcademic(false)}>Cancel</Button><Button onClick={saveAcademic} disabled={saving}>Save</Button></>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-300">University Grade Band</label>
            <Select value={gradesBand || ""} onValueChange={setGradesBand}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select band" /></SelectTrigger>
              <SelectContent>
                {["80+","73-79","70-72","66-69","62-65","59-61","55-59","50-54","40-49","<40"].map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-gray-300">Awards</label>
            <Input type="number" min={0} value={awards} onChange={(e)=>setAwards(Math.max(0, parseInt(e.target.value)||0))} className="mt-1" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Certifications</label>
            <Input type="number" min={0} value={certs} onChange={(e)=>setCerts(Math.max(0, parseInt(e.target.value)||0))} className="mt-1" />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!newInternship}
        title="Add Internship"
        onClose={()=>setNewInternship(null)}
        footer={<><Button variant="ghost" onClick={()=>setNewInternship(null)}>Cancel</Button><Button onClick={createInternship} disabled={saving || !newInternship?.tier}>Save</Button></>}
      >
        {newInternship && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-300">Tier</label>
              <Select value={newInternship.tier} onValueChange={(v)=>setNewInternship(prev=>({...(prev as any), tier: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1</SelectItem>
                  <SelectItem value="2">Tier 2</SelectItem>
                  <SelectItem value="3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Months</label>
              <Input type="number" min={1} max={12} value={newInternship.months} onChange={(e)=>setNewInternship(prev=>({...(prev as any), months: Math.min(12, Math.max(1, parseInt(e.target.value)||1))}))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Year</label>
              <Input type="number" min={2020} max={2030} value={newInternship.year} onChange={(e)=>setNewInternship(prev=>({...(prev as any), year: Math.min(2030, Math.max(2020, parseInt(e.target.value)||2024))}))} className="mt-1" />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editingInternshipId}
        title="Edit Internship"
        onClose={()=>{setEditingInternshipId(null); setEditingInternship(null);}}
        footer={<><Button variant="ghost" onClick={()=>{setEditingInternshipId(null); setEditingInternship(null);}}>Cancel</Button>{editingInternshipId && <Button onClick={()=>updateInternship(editingInternshipId)} disabled={saving}>Save</Button>}</>}
      >
        {editingInternship && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-300">Tier</label>
              <Select value={editingInternship.tier} onValueChange={(v)=>setEditingInternship(prev=>({...(prev as any), tier: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1</SelectItem>
                  <SelectItem value="2">Tier 2</SelectItem>
                  <SelectItem value="3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Months</label>
              <Input type="number" min={1} max={12} value={editingInternship.months} onChange={(e)=>setEditingInternship(prev=>({...(prev as any), months: Math.min(12, Math.max(1, parseInt(e.target.value)||1))}))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Year</label>
              <Input type="number" min={2020} max={2030} value={editingInternship.year} onChange={(e)=>setEditingInternship(prev=>({...(prev as any), year: Math.min(2030, Math.max(2020, parseInt(e.target.value)||2024))}))} className="mt-1" />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!newRole}
        title="Add Society Role"
        onClose={()=>setNewRole(null)}
        footer={<><Button variant="ghost" onClick={()=>setNewRole(null)}>Cancel</Button><Button onClick={createRole} disabled={saving || !newRole?.role_title || !newRole?.society_size}>Save</Button></>}
      >
        {newRole && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-300">Role</label>
              <Select value={newRole.role_title} onValueChange={(v)=>setNewRole(prev=>({...(prev as any), role_title: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {['president','vice','committee','member'].map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Size</label>
              <Select value={newRole.society_size} onValueChange={(v)=>setNewRole(prev=>({...(prev as any), society_size: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {['small','medium','large'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Years Active</label>
              <Input type="number" min={1} max={4} value={newRole.years_active} onChange={(e)=>setNewRole(prev=>({...(prev as any), years_active: Math.min(4, Math.max(1, parseInt(e.target.value)||1))}))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Years Ago</label>
              <Input type="number" min={0} max={4} value={newRole.years_ago} onChange={(e)=>setNewRole(prev=>({...(prev as any), years_ago: Math.min(4, Math.max(0, parseInt(e.target.value)||0))}))} className="mt-1" />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editingRoleId}
        title="Edit Society Role"
        onClose={()=>{setEditingRoleId(null); setEditingRole(null);}}
        footer={<><Button variant="ghost" onClick={()=>{setEditingRoleId(null); setEditingRole(null);}}>Cancel</Button>{editingRoleId && <Button onClick={()=>updateRole(editingRoleId)} disabled={saving}>Save</Button>}</>}
      >
        {editingRole && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-gray-300">Role</label>
              <Select value={editingRole.role_title} onValueChange={(v)=>setEditingRole(prev=>({...(prev as any), role_title: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {['president','vice','committee','member'].map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Size</label>
              <Select value={editingRole.society_size} onValueChange={(v)=>setEditingRole(prev=>({...(prev as any), society_size: v}))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select"/></SelectTrigger>
                <SelectContent>
                  {['small','medium','large'].map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-300">Years Active</label>
              <Input type="number" min={1} max={4} value={editingRole.years_active} onChange={(e)=>setEditingRole(prev=>({...(prev as any), years_active: Math.min(4, Math.max(1, parseInt(e.target.value)||1))}))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Years Ago</label>
              <Input type="number" min={0} max={4} value={editingRole.years_ago} onChange={(e)=>setEditingRole(prev=>({...(prev as any), years_ago: Math.min(4, Math.max(0, parseInt(e.target.value)||0))}))} className="mt-1" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}