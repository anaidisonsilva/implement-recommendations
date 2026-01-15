-- Function to update valor_executado based on sum of payments
CREATE OR REPLACE FUNCTION public.update_emenda_valor_executado()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_emenda_id uuid;
  v_total numeric;
BEGIN
  -- Get the emenda_id from the empresa
  IF TG_OP = 'DELETE' THEN
    SELECT emenda_id INTO v_emenda_id 
    FROM empresas_licitacao 
    WHERE id = OLD.empresa_id;
  ELSE
    SELECT emenda_id INTO v_emenda_id 
    FROM empresas_licitacao 
    WHERE id = NEW.empresa_id;
  END IF;

  -- Calculate total payments for this emenda
  SELECT COALESCE(SUM(p.valor), 0) INTO v_total
  FROM pagamentos p
  JOIN empresas_licitacao e ON e.id = p.empresa_id
  WHERE e.emenda_id = v_emenda_id;

  -- Update the emenda
  UPDATE emendas 
  SET valor_executado = v_total 
  WHERE id = v_emenda_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for pagamentos table
CREATE TRIGGER trigger_update_emenda_valor_executado
AFTER INSERT OR UPDATE OR DELETE ON pagamentos
FOR EACH ROW
EXECUTE FUNCTION update_emenda_valor_executado();

-- Update existing emendas with current payment totals
UPDATE emendas e
SET valor_executado = COALESCE((
  SELECT SUM(p.valor)
  FROM pagamentos p
  JOIN empresas_licitacao el ON el.id = p.empresa_id
  WHERE el.emenda_id = e.id
), 0);