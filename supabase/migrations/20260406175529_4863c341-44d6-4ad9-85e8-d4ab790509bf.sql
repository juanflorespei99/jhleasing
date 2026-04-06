INSERT INTO public.user_roles (user_id, role)
VALUES ('efaab731-7e9f-4608-8464-6657bcd30adc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;