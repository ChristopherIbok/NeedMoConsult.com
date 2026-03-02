import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { email, name } = await req.json();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    },
    body: JSON.stringify({
      from: "hello@needmoconsult.com",
      to: email,
      subject: "Welcome to the NEEDMO CONSULT Newsletter! 🎉",
      text: `Hi ${name || "there"},\n\nThank you for subscribing!\n\nWarm regards,\nThe NEEDMO CONSULT Team`,
    }),
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});