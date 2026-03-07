import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const {
      to,                // single email string OR array of emails
      subject,           // email subject line
      issue,             // issue number e.g. "001"
      heroTitle,         // main headline
      heroIntro,         // hero intro paragraph
      articleTitle,      // featured article title
      articleBody,       // featured article body (HTML allowed)
      articleUrl,        // article link
      tips,              // array of { title, desc }
      offerTitle,        // CTA offer headline
      offerBody,         // CTA offer description
      offerUrl,          // CTA button link
      offerLabel,        // CTA button label
    } = body ? JSON.parse(body) : {};

    if (!to) {
      return new Response(JSON.stringify({ error: "Recipient email(s) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const year = new Date().getFullYear();

    const tipsHtml = (tips || []).map((tip: { title: string; desc: string }, i: number) => `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr>
          <td style="width:36px;vertical-align:top;padding-top:2px;">
            <div style="width:28px;height:28px;background-color:#1A2332;border-radius:8px;text-align:center;line-height:28px;font-size:12px;font-weight:800;color:#D4AF7A;font-family:Arial,sans-serif;">
              ${String(i + 1).padStart(2, "0")}
            </div>
          </td>
          <td style="vertical-align:top;padding-left:14px;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1A2332;font-family:Arial,sans-serif;">${tip.title}</p>
            <p style="margin:0;font-size:13px;color:#777777;line-height:1.6;font-family:Arial,sans-serif;">${tip.desc}</p>
          </td>
        </tr>
      </table>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject || "NEEDMO CONSULT Weekly Insights"}</title>
</head>
<body style="margin:0;padding:0;background-color:#F2F2F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2F2F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#1A2332,#D4AF7A);height:5px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px 20px;background-color:#1A2332;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img
                      src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.svg"
                      alt="NEEDMO CONSULT"
                      height="36"
                      style="display:block;border:0;height:36px;width:auto;"
                    />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:11px;color:#D4AF7A;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Weekly Insights</p>
                    <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;">${date} · Issue #${issue || "001"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 40px 32px;background-color:#1A2332;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">This Week</p>
              <h1 style="margin:0 0 16px;font-size:30px;font-weight:800;color:#FFFFFF;line-height:1.2;font-family:Arial,sans-serif;">
                ${heroTitle || "Your Weekly Social Media Insights"}
              </h1>
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;font-family:Arial,sans-serif;">
                ${heroIntro || "Here's what we're covering this week to help you grow your brand."}
              </p>
            </td>
          </tr>

          <!-- Hero divider -->
          <tr>
            <td style="background-color:#1A2332;padding:0 40px 32px;">
              <div style="height:1px;background-color:rgba(212,175,122,0.2);font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Featured Article -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">Featured Article</p>
              <h2 style="margin:0 0 14px;font-size:22px;font-weight:800;color:#1A2332;line-height:1.3;font-family:Arial,sans-serif;">
                ${articleTitle || "This Week's Feature"}
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.75;font-family:Arial,sans-serif;">
                ${articleBody || ""}
              </p>
              ${articleUrl ? `
              <a href="${articleUrl}" style="display:inline-block;border:2px solid #D4AF7A;color:#D4AF7A;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:50px;font-family:Arial,sans-serif;letter-spacing:0.5px;">
                Read Full Article &rarr;
              </a>` : ""}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background-color:#F0F0F0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Tips List -->
          ${tipsHtml ? `
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">Quick Tips</p>
              <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#1A2332;font-family:Arial,sans-serif;">
                Actionable Insights For This Week
              </h2>
              ${tipsHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background-color:#F0F0F0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>` : ""}

          <!-- CTA / Offer Block -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">Exclusive Offer</p>
                    <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#FFFFFF;line-height:1.3;font-family:Arial,sans-serif;">
                      ${offerTitle || "Book a Free Strategy Call"}
                    </h2>
                    <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.7;font-family:Arial,sans-serif;">
                      ${offerBody || "Ready to take your brand to the next level? Book a free 30-minute strategy call with our team."}
                    </p>
                    <a href="${offerUrl || "https://needmoconsult.com/Contact"}"
                       style="display:inline-block;background-color:#D4AF7A;color:#1A2332;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:50px;font-family:Arial,sans-serif;letter-spacing:0.5px;">
                      ${offerLabel || "Book Free Strategy Call"} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 40px;background-color:#1A2332;border-radius:0 0 16px 16px;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://instagram.com/needmoconsult" style="display:inline-block;width:34px;height:34px;background-color:rgba(212,175,122,0.12);border-radius:8px;text-align:center;line-height:34px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/instagram-new.png" alt="Instagram" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://linkedin.com/company/needmoconsult" style="display:inline-block;width:34px;height:34px;background-color:rgba(212,175,122,0.12);border-radius:8px;text-align:center;line-height:34px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/linkedin.png" alt="LinkedIn" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://twitter.com/needmoconsult" style="display:inline-block;width:34px;height:34px;background-color:rgba(212,175,122,0.12);border-radius:8px;text-align:center;line-height:34px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/twitterx.png" alt="Twitter" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://facebook.com/needmoconsult" style="display:inline-block;width:34px;height:34px;background-color:rgba(212,175,122,0.12);border-radius:8px;text-align:center;line-height:34px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/facebook-new.png" alt="Facebook" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:12px;color:#D4AF7A;font-family:Arial,sans-serif;font-weight:600;">NEEDMO CONSULT</p>
              <p style="margin:0 0 12px;font-size:11px;color:rgba(255,255,255,0.35);font-family:Arial,sans-serif;">&copy; ${year} NEEDMO CONSULT. All rights reserved.</p>
              <p style="margin:0;font-size:11px;font-family:Arial,sans-serif;">
                <a href="https://needmoconsult.com" style="color:rgba(255,255,255,0.3);text-decoration:none;">needmoconsult.com</a>
                &nbsp;&middot;&nbsp;
                <a href="https://needmoconsult.com/unsubscribe" style="color:rgba(255,255,255,0.3);text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const recipients = Array.isArray(to) ? to : [to];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "hello@needmoconsult.com",
        to: recipients,
        subject: subject || "NEEDMO CONSULT Weekly Insights 📬",
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
