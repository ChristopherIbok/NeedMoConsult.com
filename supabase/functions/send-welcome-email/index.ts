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
    const { email, name } = body ? JSON.parse(body) : {};

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const features = [
      {
        icon: "https://img.icons8.com/color/48/instagram-new.png",
        title: "Social Media Tips",
        desc: "Actionable strategies to grow your brand",
      },
      {
        icon: "https://img.icons8.com/color/48/bar-chart.png",
        title: "Case Studies",
        desc: "Real results from real clients",
      },
      {
        icon: "https://img.icons8.com/color/48/star.png",
        title: "Exclusive Offers",
        desc: "Special deals for our subscribers only",
      },
      {
        icon: "https://img.icons8.com/color/48/lightning-bolt.png",
        title: "Industry Insights",
        desc: "Stay ahead of the latest trends",
      },
    ];

    const featureRows = features.map(f => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #F5F5F5;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="width:52px;vertical-align:middle;">
                <div style="width:40px;height:40px;background-color:#FFF0EB;border-radius:10px;text-align:center;line-height:40px;">
                  <img src="${f.icon}" alt="${f.title}" width="24" height="24" style="display:inline-block;vertical-align:middle;border:0;" />
                </div>
              </td>
              <td style="vertical-align:middle;padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:700;color:#1A2332;font-family:Arial,sans-serif;">${f.title}</p>
                <p style="margin:3px 0 0;font-size:13px;color:#888888;font-family:Arial,sans-serif;">${f.desc}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to NEEDMO CONSULT</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">

          <!-- Top accent bar -->
          <tr>
            <td style="background-color:#FF6B35;height:6px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Logo + Date -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img
                      src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.svg"
                      alt="NEEDMO CONSULT"
                      width="150"
                      height="40"
                      style="display:block;border:0;"
                    />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">${date}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding:32px 40px 24px;">
              <img src="https://img.icons8.com/color/96/checked--v1.png" alt="Welcome" width="56" height="56" style="display:block;margin:0 auto 18px;border:0;" />
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1A2332;font-family:Arial,sans-serif;">
                Welcome to the Family!
              </h1>
              <p style="margin:0;font-size:15px;color:#666666;line-height:1.7;font-family:Arial,sans-serif;">
                Hi <strong style="color:#1A2332;">${name || "there"}</strong>, thanks for subscribing to the<br/>NEEDMO CONSULT newsletter. You've just made<br/>a great decision for your brand.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="padding:24px 40px 4px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#FF6B35;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">What to expect</p>
            </td>
          </tr>

          <!-- Feature list -->
          <tr>
            <td style="padding:4px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${featureRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 36px;">
              <a href="https://needmoconsult.com"
                 style="display:inline-block;background-color:#FF6B35;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:50px;font-family:Arial,sans-serif;letter-spacing:0.5px;">
                Visit Our Website &rarr;
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px;background-color:#1A2332;border-radius:0 0 16px 16px;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://instagram.com/needmoconsult"
                       style="display:inline-block;width:32px;height:32px;background-color:rgba(255,255,255,0.12);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/instagram-new.png" alt="Instagram" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://linkedin.com/company/needmoconsult"
                       style="display:inline-block;width:32px;height:32px;background-color:rgba(255,255,255,0.12);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/linkedin.png" alt="LinkedIn" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                  <td style="padding:0 6px;">
                    <a href="https://twitter.com/needmoconsult"
                       style="display:inline-block;width:32px;height:32px;background-color:rgba(255,255,255,0.12);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/twitterx.png" alt="Twitter" width="18" height="18" style="display:inline-block;vertical-align:middle;border:0;" />
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:12px;color:#aaaaaa;font-family:Arial,sans-serif;">
                &copy; ${new Date().getFullYear()} NEEDMO CONSULT. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#666666;font-family:Arial,sans-serif;">
                You're receiving this because you subscribed at needmoconsult.com
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