import { createClient } from './supabase/server';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { user: null, profile: null, role: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { 
    user, 
    profile: profileError ? null : profile, 
    role: profile?.role || null 
  };
}

export async function getUserRole() {
  const { role } = await getCurrentUser();
  return role;
}

export async function requireTeacher() {
  const { user, role } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (role !== 'teacher') {
    redirect('/student/dashboard');
  }
  
  return user;
}

export async function requireStudent() {
  const { user, role } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (role !== 'student') {
    redirect('/teacher/dashboard');
  }
  
  return user;
}
