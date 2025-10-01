-- Create typhoon records table
CREATE TABLE public.typhoons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  date_entered DATE NOT NULL,
  date_exited DATE,
  max_wind_speed NUMERIC,
  rainfall_amount NUMERIC,
  affected_areas TEXT,
  damage_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.typhoons ENABLE ROW LEVEL SECURITY;

-- Create policies for typhoon records
CREATE POLICY "Everyone can view typhoon records" 
ON public.typhoons 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert typhoon records" 
ON public.typhoons 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update typhoon records" 
ON public.typhoons 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete typhoon records" 
ON public.typhoons 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_typhoons_updated_at
BEFORE UPDATE ON public.typhoons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();