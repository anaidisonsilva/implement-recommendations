
-- Create enum for esfera
CREATE TYPE public.esfera_emenda AS ENUM ('federal', 'estadual');

-- Add column to emendas table
ALTER TABLE public.emendas ADD COLUMN esfera esfera_emenda NOT NULL DEFAULT 'federal';
