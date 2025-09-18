-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create harvest logs table
CREATE TABLE public.harvest_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  actual_harvest_date DATE NOT NULL,
  actual_harvest_time TIME,
  recommended_harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on harvest logs
ALTER TABLE public.harvest_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for harvest logs
CREATE POLICY "Users can view their own harvest logs"
ON public.harvest_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own harvest logs"
ON public.harvest_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own harvest logs"
ON public.harvest_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own harvest logs"
ON public.harvest_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create harvest analysis table for storing comparison data
CREATE TABLE public.harvest_analysis (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  harvest_log_id uuid NOT NULL REFERENCES public.harvest_logs(id) ON DELETE CASCADE,
  rainfall_during_period NUMERIC,
  rainfall_relevance_score INTEGER CHECK (rainfall_relevance_score BETWEEN 1 AND 5),
  timing_difference_days INTEGER,
  weather_impact_factor TEXT,
  accuracy_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on harvest analysis
ALTER TABLE public.harvest_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for harvest analysis
CREATE POLICY "Users can view analysis for their harvest logs"
ON public.harvest_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.harvest_logs hl 
    WHERE hl.id = harvest_analysis.harvest_log_id 
    AND hl.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analysis for their harvest logs"
ON public.harvest_analysis
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.harvest_logs hl 
    WHERE hl.id = harvest_analysis.harvest_log_id 
    AND hl.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_harvest_logs_updated_at
BEFORE UPDATE ON public.harvest_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();