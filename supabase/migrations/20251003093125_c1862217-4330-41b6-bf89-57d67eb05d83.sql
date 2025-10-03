-- Create planting_logs table to track user planting activities
CREATE TABLE public.planting_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crop_type TEXT NOT NULL,
  actual_planting_date DATE NOT NULL,
  actual_planting_time TIME,
  recommended_planting_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on planting_logs
ALTER TABLE public.planting_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for planting logs
CREATE POLICY "Users can view their own planting logs"
ON public.planting_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planting logs"
ON public.planting_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planting logs"
ON public.planting_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planting logs"
ON public.planting_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planting_logs_updated_at
BEFORE UPDATE ON public.planting_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();