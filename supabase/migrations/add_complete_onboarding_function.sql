-- =============================================================================
-- Função RPC para completar onboarding
-- Recebe o user_id e a lista de matérias do catálogo
-- Cria as subjects e marca onboarding como completo
-- =============================================================================

-- Função para completar onboarding
CREATE OR REPLACE FUNCTION public.complete_onboarding(
  p_user_id UUID,
  p_subject_names TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_created_count INT := 0;
  v_subject_name TEXT;
  v_group_key TEXT;
BEGIN
  -- Validar input
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User ID is required');
  END IF;

  -- Se não recebeu nomes, usa todos do catálogo para esse usuário
  -- (isso permite backward compatibility)
  IF p_subject_names IS NULL OR array_length(p_subject_names, 1) = 0 THEN
    -- Marca onboarding como completo sem criar subjects
    UPDATE public.user_preferences 
    SET onboarding_completed = true, updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
      'success', true, 
      'message', 'Onboarding completed without creating subjects',
      'created_count', 0
    );
  END IF;

  -- Criar cada matéria do catálogo para o usuário
  FOREACH v_subject_name IN ARRAY p_subject_names
  LOOP
    -- Verificar se já existe
    IF NOT EXISTS (
      SELECT 1 FROM public.subjects 
      WHERE user_id = p_user_id AND name = v_subject_name
    ) THEN
      -- Inserir a matéria
      INSERT INTO public.subjects (user_id, name, color, progress)
      VALUES (
        p_user_id, 
        v_subject_name, 
        -- Gerar cor baseada no nome
        (
          SELECT COALESCE(
            (SELECT color FROM public.subject_catalog WHERE name = v_subject_name LIMIT 1),
            '#' || substr(md5(v_subject_name), 1, 6)
          )
        ),
        0
      );
      v_created_count := v_created_count + 1;
    END IF;
  END LOOP;

  -- Marcar onboarding como completo
  UPDATE public.user_preferences 
  SET onboarding_completed = true, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Se não existia, criar user_preferences
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id, onboarding_completed, created_at, updated_at)
    VALUES (p_user_id, true, NOW(), NOW());
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Onboarding completed',
    'created_count', v_created_count
  );
END;
$$;

-- Permissão para usuários autenticados executarem
GRANT EXECUTE ON FUNCTION public.complete_onboarding TO authenticated;

-- Testar a função (comentar após testar)
-- SELECT public.complete_onboarding('USER_ID_AQUI', ARRAY['Anatomia Humana (Macroscópica)', 'Histologia', 'Bioquímica']);
