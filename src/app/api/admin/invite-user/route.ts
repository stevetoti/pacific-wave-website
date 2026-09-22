import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authorize } from '@/lib/server/auth';
import { apiError, readJson } from '@/lib/server/http';

export async function POST(request: Request) {
  const access = await authorize(request, ['super_admin']);
  if (access.response) return access.response;
  try {
    const { email } = await readJson(request, z.object({ email: z.string().trim().email().max(254) }));
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://pacificwavedigital.com'}/admin/reset-password`;
    const { data, error } = await access.db.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (error) {
      if (error.code === 'email_exists' || error.code === 'user_already_exists') {
        const { error: resetError } = await access.db.auth.resetPasswordForEmail(email, { redirectTo });
        if (resetError) throw resetError;
        return NextResponse.json({ success: true, message: 'Password reset email requested' });
      }
      throw error;
    }
    return NextResponse.json({ success: true, userId: data.user?.id, message: 'Invite email sent' });
  } catch (error) { return apiError(error, '/api/admin/invite-user'); }
}
