import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PASSWORD_RECOVERY_URL =
  "https://jhleasing.scaletechconsulting.mx/reset-password";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller using their JWT
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Solo administradores pueden gestionar usuarios" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "list": {
        const { data: { users }, error } = await adminClient.auth.admin.listUsers({
          perPage: 500,
        });
        if (error) throw error;

        // Get all roles
        const { data: roles } = await adminClient
          .from("user_roles")
          .select("user_id, role");

        const roleMap = new Map<string, string>();
        roles?.forEach((r: { user_id: string; role: string }) => {
          roleMap.set(r.user_id, r.role);
        });

        const userList = users.map((u) => ({
          id: u.id,
          email: u.email,
          role: roleMap.get(u.id) || "user",
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
        }));

        return new Response(JSON.stringify({ users: userList }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "create": {
        const { email, password, role } = body;
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Email y contraseña requeridos" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (createError) throw createError;

        if (role && role !== "user" && newUser.user) {
          await adminClient.from("user_roles").insert({
            user_id: newUser.user.id,
            role,
          });
        }

        return new Response(JSON.stringify({ message: "Usuario creado", user: newUser.user }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_role": {
        const { user_id, role } = body;
        if (!user_id || !role) {
          return new Response(JSON.stringify({ error: "user_id y role requeridos" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete existing role
        await adminClient.from("user_roles").delete().eq("user_id", user_id);

        // Insert new role (if not "user" which is the default/no-role state)
        if (role !== "user") {
          await adminClient.from("user_roles").insert({ user_id, role });
        }

        return new Response(JSON.stringify({ message: "Rol actualizado" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "reset_password": {
        const { email: resetEmail } = body;
        if (!resetEmail) {
          return new Response(JSON.stringify({ error: "Email requerido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: resetError } = await adminClient.auth.resetPasswordForEmail(resetEmail, {
          redirectTo: PASSWORD_RECOVERY_URL,
        });

        if (resetError) throw resetError;

        return new Response(JSON.stringify({ message: "Correo de recuperación enviado" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete": {
        const { user_id } = body;
        if (!user_id) {
          return new Response(JSON.stringify({ error: "user_id requerido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Prevent self-deletion
        if (user_id === caller.id) {
          return new Response(JSON.stringify({ error: "No puedes eliminarte a ti mismo" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);
        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: "Usuario eliminado" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Acción no válida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
