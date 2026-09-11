import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  if (provider !== 'google' && provider !== 'microsoft') {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${req.nextUrl.origin}/api/email-integrations/${provider}/callback`;

  let authUrl = '';
  if (provider === 'google') {
    // Make scopes configurable via env, defaulting to least-privileged readonly access
    const defaultGoogleScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ');
    
    const scopes = process.env.GOOGLE_OAUTH_SCOPES || defaultGoogleScopes;
    
    const searchParams = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${searchParams.toString()}`;
  } else if (provider === 'microsoft') {
    const defaultMicrosoftScopes = [
      'offline_access', 
      'User.Read', 
      'Mail.Read'
    ].join(' ');
    
    const scopes = process.env.MICROSOFT_OAUTH_SCOPES || defaultMicrosoftScopes;
    const tenant = process.env.MICROSOFT_TENANT_ID || 'common';
    
    const searchParams = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: redirectUri,
      response_mode: 'query',
      scope: scopes,
      state,
    });
    authUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${searchParams.toString()}`;
  }

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
