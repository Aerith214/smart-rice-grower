-- Insert admin role for arictediguzman@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('b07fd5a9-6a2d-48a6-a102-8048a63222d6', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;