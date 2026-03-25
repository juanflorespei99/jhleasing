import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook signature
  const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
  const authHeader = req.headers.get("authorization");
  if (!webhookSecret || !authHeader || authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();
    const { user } = payload.record
      ? { user: payload.record }
      : { user: payload };

    if (!user?.id || !user?.email) {
      return new Response(JSON.stringify({ message: "No user data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const domain = user.email.split("@")[1]?.toLowerCase();

    // Check if domain is in allowed_domains
    const { data: allowedDomain } = await supabaseAdmin
      .from("allowed_domains")
      .select("id")
      .eq("domain", domain)
      .maybeSingle();

    if (!allowedDomain) {
      console.log(`Rejected signup: domain '${domain}' not allowed`);
      // Delete the user since domain is not allowed
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return new Response(
        JSON.stringify({ error: "Acceso restringido a colaboradores autorizados" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const role = "employee";

    // Insert role
    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: user.id,
      role,
    });

    if (error) {
      console.error("Error inserting role:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: `Role '${role}' assigned to ${user.email}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
