import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create client with user's token to verify permissions
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user: currentUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !currentUser) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has permission to create users
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role, prefeitura_id')
      .eq('user_id', currentUser.id);

    if (rolesError) {
      console.error('Roles error:', rolesError);
      return new Response(JSON.stringify({ error: 'Erro ao verificar permissões' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isSuperAdmin = roles?.some(r => r.role === 'super_admin');
    const isPrefeituraAdmin = roles?.find(r => r.role === 'prefeitura_admin');

    if (!isSuperAdmin && !isPrefeituraAdmin) {
      return new Response(JSON.stringify({ error: 'Sem permissão para criar usuários' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get request body
    const { email, password, nome_completo, role, prefeitura_id } = await req.json();

    if (!email || !password || !nome_completo || !role) {
      return new Response(JSON.stringify({ error: 'Dados incompletos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate role permissions
    if (role === 'super_admin' && !isSuperAdmin) {
      return new Response(JSON.stringify({ error: 'Apenas super admin pode criar super admins' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prefeitura admin can only create users for their own prefeitura
    if (isPrefeituraAdmin && !isSuperAdmin) {
      if (prefeitura_id !== isPrefeituraAdmin.prefeitura_id) {
        return new Response(JSON.stringify({ error: 'Você só pode criar usuários para sua própria prefeitura' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Prefeitura admin can only create prefeitura_user, not prefeitura_admin
      if (role !== 'prefeitura_user') {
        return new Response(JSON.stringify({ error: 'Você só pode criar usuários comuns da prefeitura' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create user with admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        nome_completo,
      },
    });

    if (createError) {
      console.error('Create user error:', createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign role to user
    const rolePayload: { user_id: string; role: string; prefeitura_id?: string } = {
      user_id: newUser.user.id,
      role,
    };

    if (role !== 'super_admin' && prefeitura_id) {
      rolePayload.prefeitura_id = prefeitura_id;
    }

    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert(rolePayload);

    if (roleError) {
      console.error('Role assignment error:', roleError);
      // User was created but role assignment failed - try to delete user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: 'Erro ao atribuir permissão: ' + roleError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      user: { 
        id: newUser.user.id, 
        email: newUser.user.email,
        nome_completo 
      } 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});