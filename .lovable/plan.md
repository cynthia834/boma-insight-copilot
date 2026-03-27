

# Plan: Add Authentication with User Stocks Seeding

## Overview
Implement email/password authentication with Lovable Cloud, create a `user_stocks` table, and protect all routes behind auth. On signup, seed default NSE portfolio entries (SCOM, EQTY, KCB).

## Database Changes

**1. Create `user_stocks` table** (migration):
```sql
CREATE TABLE public.user_stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker_symbol text NOT NULL,
  number_of_shares integer NOT NULL DEFAULT 0,
  average_buy_price numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stocks"
  ON public.user_stocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stocks"
  ON public.user_stocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stocks"
  ON public.user_stocks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
```

**2. Configure auth** — enable auto-confirm for email signups (streamlined dev experience; users go straight to dashboard).

## Code Changes

**3. Create `src/pages/Auth.tsx`**
- Login and Signup tabs using shadcn Tabs, Input, Button
- `supabase.auth.signUp({ email, password })` → on success, insert 3 rows into `user_stocks` (SCOM/EQTY/KCB with 0 shares) → navigate to `/`
- `supabase.auth.signInWithPassword({ email, password })` → navigate to `/`
- If insert fails after signup, log error but don't block the user
- Styled with glass card aesthetic matching the app

**4. Create `src/hooks/useAuth.ts`**
- Custom hook using `onAuthStateChange` + `getSession`
- Exposes `session`, `user`, `loading`, `signOut`

**5. Update `src/App.tsx`**
- Add `/auth` route (renders Auth page without AppLayout)
- Wrap protected routes: if no session and not loading, redirect to `/auth`

**6. Update `src/components/AppSidebar.tsx`**
- Add logout button at bottom calling `supabase.auth.signOut()`

## Flow
1. Unauthenticated user → redirected to `/auth`
2. Sign up → account created → default stocks seeded → redirect to dashboard
3. Sign in → redirect to dashboard
4. Logout → session cleared → redirect to `/auth`

