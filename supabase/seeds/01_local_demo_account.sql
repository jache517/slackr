-- Local-only sign-in account for the demo data.
--
-- The password below is written in plain text, so this file must never be run
-- against a hosted database: it would put a publicly known credential on a
-- deployed site. `supabase db reset` only ever touches the local stack, which
-- is the only place this file is wired up (see config.toml [db.seed]).
--
-- To show the demo data on a deployed site, create the account through the
-- Supabase dashboard with a password of your own, then load
-- 02_demo_data.sql with slackr.demo_owner_email set to that address.
--
-- Sign in as owner@slackr.test with the password slackr-demo.

begin;

-- GoTrue reads these token columns directly and rejects nulls, so the
-- empty strings below are required rather than tidiness.
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at, encrypted_password, raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, email_change, phone_change, phone_change_token, reauthentication_token)
values ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@slackr.test', now(), now(), now(), crypt('slackr-demo', gen_salt('bf')), '{"provider":"email","providers":["email"]}', '{}', false, false, '', '', '', '', '', '', '', '')
on conflict (id) do nothing;

commit;
