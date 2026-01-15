-- Create system_settings table for storing system-wide configuration
CREATE TABLE public.system_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text UNIQUE NOT NULL,
    value text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read system settings (needed for displaying system name)
CREATE POLICY "Anyone can read system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only super admins can manage system settings
CREATE POLICY "Super admins can manage system settings"
ON public.system_settings
FOR ALL
USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system name
INSERT INTO public.system_settings (key, value) VALUES ('system_name', 'Portal de Emendas');
INSERT INTO public.system_settings (key, value) VALUES ('system_subtitle', 'Transparência e Rastreabilidade');