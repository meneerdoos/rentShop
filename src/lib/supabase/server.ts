import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieMethods: CookieMethodsServer = {
    async getAll() {
      return (await cookies()).getAll()
    },
    async setAll(cookiesToSet) {
      try {
        const store = await cookies()
        for (const { name, value, options } of cookiesToSet) {
          store.set(name, value, options)
        }
      } catch {}
    },
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  )
}

export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}
