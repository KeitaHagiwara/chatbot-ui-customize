-- create public.users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES public.users ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id) REFERENCES public.profiles (user_id)
);

-- RLS settings
ALTER TABLE public.users
    ENABLE ROW LEVEL security;

CREATE POLICY "Allow select for all authenticated users."
    ON public.users FOR SELECT USING (
        auth.role() = 'authenticated'
    )

CREATE POLICY "Allow update for admin users."
    ON public.users FOR UPDATE USING (
        auth.role() = 'authenticated'
    );

-- create Database Functions that copy auth.users to public.users
CREATE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$
LANGUAGE plpgsql
SECURITY definer
SET search_path = public;

-- trigger INSERT to auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
