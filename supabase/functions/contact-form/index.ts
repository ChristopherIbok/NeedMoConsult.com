import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const {
      name,
      email,
      company,
      service,
      budget,
      message,
      localTime,
      timezone,
    } = await req.json();

    // send the email to the admin address
    const body = `New contact form submission:

Name: ${name || "(none)"}
Email: ${email || "(none)"}
Company: ${company || "(none)"}
Service: ${service || "(none)"}
Budget: ${budget || "(none)"}
Time: ${localTime || ""} (${timezone || ""})

Message:
${message || "(none)"}`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "hello@needmoconsult.com",
        to: "hello@needmoconsult.com",
        subject: "New contact form submission",
        text: body,
      }),
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("contact-form function error", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
