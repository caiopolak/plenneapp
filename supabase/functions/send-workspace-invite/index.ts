import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  invitedEmail: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  workspaceId: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-WORKSPACE-INVITE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get auth header to verify user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }
    logStep("User authenticated", { userId: userData.user.id });

    // Parse request body
    const { invitedEmail, workspaceName, inviterName, role, workspaceId }: InviteRequest = await req.json();
    
    if (!invitedEmail || !workspaceName || !workspaceId) {
      throw new Error("Missing required fields: invitedEmail, workspaceName, or workspaceId");
    }

    logStep("Sending invite email", { invitedEmail, workspaceName, role });

    // Get the app URL from the request origin
    const origin = req.headers.get("origin") || "https://plenne.app";
    const acceptUrl = `${origin}/app/workspace-invite?workspace=${workspaceId}`;

    // Build email HTML
    const roleLabel = role === "admin" ? "Administrador" : "Membro";
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite para Workspace - Plenne</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Você foi convidado!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Olá! <strong>${inviterName || 'Um usuário'}</strong> convidou você para participar do workspace <strong>"${workspaceName}"</strong> no Plenne.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0;"><strong>📋 Workspace:</strong> ${workspaceName}</p>
              <p style="margin: 0;"><strong>👤 Função:</strong> ${roleLabel}</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
              Se você ainda não tem uma conta no Plenne, precisará criar uma usando este mesmo e-mail (<strong>${invitedEmail}</strong>) para ter acesso ao workspace.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 0;">
              Se você não reconhece este convite, pode ignorar este e-mail.
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Plenne - Gestão Financeira Inteligente</p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Plenne <noreply@resend.dev>",
      to: [invitedEmail],
      subject: `${inviterName || 'Alguém'} convidou você para o workspace "${workspaceName}" no Plenne`,
      html: emailHtml,
    });

    logStep("Email sent successfully", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
