import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { email, name } = await req.json();

    // Validate inputs
    if (!email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ ok: false, error: "Email service not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "hello@needmoconsult.com",
        to: email,
        subject: "Welcome to the NEEDMO CONSULT Newsletter! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B35;">Welcome to NEEDMO CONSULT!</h1>
            <p>Hi ${name || "there"},</p>
            <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
            <p>You'll now receive exclusive social media tips, case studies, and growth strategies straight to your inbox.</p>
            <p style="margin-top: 30px; color: #666;">Warm regards,<br/><strong>The NEEDMO CONSULT Team</strong></p>
          </div>
        `,
        text: `Hi ${name || "there"},\n\nThank you for subscribing!\n\nWarm regards,\nThe NEEDMO CONSULT Team`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({
          ok: false,
          error: data.message || "Failed to send email",
        }),
        {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Email sent successfully:", data.id);
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-welcome-email:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
