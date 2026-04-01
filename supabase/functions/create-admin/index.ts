import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const adminEmail = "admin@points.com";
    const adminPassword = "Admin@123456";

    // Check if admin already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(u => u.email === adminEmail);

    if (existing) {
      // Ensure admin role
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: existing.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      return new Response(JSON.stringify({ message: "Admin already exists", email: adminEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin user
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "Administrador Points!" },
    });

    if (error) throw error;

    // Add admin role
    await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "admin" });

    // Update profile
    await supabaseAdmin.from("profiles").update({ full_name: "Administrador Points!" }).eq("id", newUser.user.id);

    return new Response(JSON.stringify({ 
      message: "Admin created successfully", 
      email: adminEmail,
      password: adminPassword 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
