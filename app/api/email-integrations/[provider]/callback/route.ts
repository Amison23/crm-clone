import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEmailProvider } from '@/lib/email-integration/factory';
import { encryptToken } from '@/lib/email-integration/encryption';

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

  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error(`OAuth error from ${provider}:`, error);
    return NextResponse.redirect(new URL(`/protected/settings/email?error=${error}`, req.url));
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  const savedState = req.cookies.get(`oauth_state_${provider}`)?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.json({ error: 'Invalid state parameter (CSRF detected)' }, { status: 400 });
  }

  try {
    const emailProvider = getEmailProvider(provider as 'google' | 'microsoft');
    const redirectUri = `${req.nextUrl.origin}/api/email-integrations/${provider}/callback`;

    // 1. Exchange code for tokens
    const tokenData = await emailProvider.exchangeCodeForTokens(code, redirectUri);
    if (!tokenData) {
      throw new Error('Failed to retrieve tokens');
    }

    // 2. Fetch the connected account profile
    const profile = await emailProvider.getAccountProfile(tokenData.accessToken);

    // 3. Encrypt the tokens
    const encryptedAccess = encryptToken(tokenData.accessToken);
    const encryptedRefresh = encryptToken(tokenData.refreshToken);

    // 4. Fetch the employee record to associate the connected account with the company
    const { data: employee } = await supabase
      .from('employees')
      .select('id, company_id')
      .eq('id', user.id)
      .single();

    if (!employee || !employee.company_id) {
      throw new Error('User is not associated with a company');
    }

    // 5. Upsert into connected_email_accounts
    const { error: dbError } = await supabase
      .from('connected_email_accounts')
      .upsert({
        company_id: employee.company_id,
        employee_id: employee.id,
        provider,
        provider_account_id: profile.providerAccountId,
        email_address: profile.emailAddress,
        display_name: profile.displayName,
        access_token: encryptedAccess,
        refresh_token: encryptedRefresh,
        token_expires_at: tokenData.expiresAt.toISOString(),
        scopes: tokenData.scopes,
        sync_status: 'pending',
      }, {
        onConflict: 'company_id, provider_account_id'
      });

    if (dbError) {
      console.error('Database error saving connected account:', dbError);
      throw new Error('Failed to save connection to database');
    }

    // Clear the state cookie
    const response = NextResponse.redirect(new URL('/protected/settings/email?success=true', req.url));
    response.cookies.delete(`oauth_state_${provider}`);
    
    return response;
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(new URL(`/protected/settings/email?error=${encodeURIComponent(err.message)}`, req.url));
  }
}
