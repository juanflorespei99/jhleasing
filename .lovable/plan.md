

## Problem

The error "Password is known to be weak and easy to guess" comes from Supabase's **Leaked Password Protection** feature. It checks passwords against the HaveIBeenPwned database. The password "Antonio12345." was found in a data breach, so Supabase rejects it even though it meets complexity requirements.

## Solution

This is a **Supabase dashboard setting**, not a code change. You need to disable it manually:

1. Go to **Supabase Dashboard > Authentication > Settings** (or URL below)
2. Scroll to **Password Protection** section
3. Disable **"Leaked Password Protection"** (HaveIBeenPwned check)
4. Save

No code changes are needed.

## Optional Code Improvement

Translate the error message in `Register.tsx` so users see a Spanish message instead of the English one. In `handleSubmit`, after receiving the error from Supabase, map `weak_password` errors to a user-friendly Spanish message like "La contraseña es muy común. Por favor elige una diferente."

