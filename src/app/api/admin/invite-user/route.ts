import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create admin client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Verify the request is from an authenticated super_admin
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check if user is super_admin
      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('role')
        .eq('email', user.email)
        .single();

      if (!adminUser || adminUser.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Only super admins can invite users' },
          { status: 403 }
        );
      }
    }

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === email);

    if (userExists) {
      // User already has auth account, just send password reset
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pacificwavedigital.com'}/admin`,
        },
      });

      if (resetError) {
        console.error('Reset link error:', resetError);
        return NextResponse.json(
          { error: 'Failed to send password reset email' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Password reset email sent' 
      });
    }

    // Invite new user
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pacificwavedigital.com'}/admin`,
    });

    if (error) {
      console.error('Invite error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      userId: data.user?.id,
      message: 'Invite email sent' 
    });

  } catch (error) {
    console.error('Invite user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
