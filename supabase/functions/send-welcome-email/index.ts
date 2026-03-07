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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to NEEDMO CONSULT</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#FF6B35,#FF9A6C);height:6px;"></td>
          </tr>

          <!-- Logo + Date -->
          <tr>
            <td style="padding:36px 40px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/NeedMo_Consult_Logo.svg" alt="NEEDMO CONSULT" width="160" style="display:block;" />
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:12px;color:#999999;text-transform:uppercase;letter-spacing:1px;">${date}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;"></div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td align="center" style="padding:36px 40px 28px;">
              <div style="width:64px;height:64px;background:linear-gradient(135deg,#FF6B35,#FF9A6C);border-radius:16px;margin:0 auto 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:16px auto;">
                  <path d="M5 13L9 17L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#1A2332;">Welcome to the Family!</h1>
              <p style="margin:0;font-size:15px;color:#666666;line-height:1.7;max-width:420px;">
                Hi <strong style="color:#1A2332;">${name || "there"}</strong>, thanks for subscribing to the NEEDMO CONSULT newsletter. You've just made a great decision for your brand.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;"></div>
            </td>
          </tr>

          <!-- What to expect heading -->
          <tr>
            <td style="padding:28px 40px 8px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#FF6B35;text-transform:uppercase;letter-spacing:2px;">What to expect</p>
            </td>
          </tr>

          <!-- Feature list -->
          <tr>
            <td style="padding:8px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Social Media Tips -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F5F5F5;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;">
                          <div style="width:36px;height:36px;background:#FFF0EB;border-radius:8px;text-align:center;line-height:36px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <rect x="2" y="2" width="20" height="20" rx="5" stroke="#FF6B35" stroke-width="2"/>
                              <circle cx="12" cy="12" r="4" stroke="#FF6B35" stroke-width="2"/>
                              <circle cx="17.5" cy="6.5" r="1" fill="#FF6B35"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:middle;padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1A2332;">Social Media Tips</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#888888;">Actionable strategies to grow your brand</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Case Studies -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F5F5F5;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;">
                          <div style="width:36px;height:36px;background:#FFF0EB;border-radius:8px;text-align:center;line-height:36px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#FF6B35" stroke-width="2"/>
                              <path d="M8 17V13" stroke="#FF6B35" stroke-width="2" stroke-linecap="round"/>
                              <path d="M12 17V9" stroke="#FF6B35" stroke-width="2" stroke-linecap="round"/>
                              <path d="M16 17V11" stroke="#FF6B35" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:middle;padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1A2332;">Case Studies</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#888888;">Real results from real clients</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Exclusive Offers -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #F5F5F5;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;">
                          <div style="width:36px;height:36px;background:#FFF0EB;border-radius:8px;text-align:center;line-height:36px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#FF6B35" stroke-width="2" stroke-linejoin="round"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:middle;padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1A2332;">Exclusive Offers</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#888888;">Special deals for our subscribers only</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Industry Insights -->
                <tr>
                  <td style="padding:12px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:44px;vertical-align:middle;">
                          <div style="width:36px;height:36px;background:#FFF0EB;border-radius:8px;text-align:center;line-height:36px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#FF6B35" stroke-width="2" stroke-linejoin="round"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:middle;padding-left:12px;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:#1A2332;">Industry Insights</p>
                          <p style="margin:3px 0 0;font-size:13px;color:#888888;">Stay ahead of the latest trends</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:0 40px 40px;">
              <a href="https://needmoconsult.com" style="display:inline-block;background:linear-gradient(90deg,#FF6B35,#FF9A6C);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:15px 40px;border-radius:50px;letter-spacing:0.5px;">
                Visit Our Website &rarr;
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:#F0F0F0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 40px;background-color:#1A2332;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                      <tr>
                        <td style="padding:0 6px;">
                          <a href="https://instagram.com/needmoconsult" style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" stroke-width="2"/>
                              <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2"/>
                              <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                            </svg>
                          </a>
                        </td>
                        <td style="padding:0 6px;">
                          <a href="https://linkedin.com/company/needmoconsult" style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                              <rect x="2" y="9" width="4" height="12" stroke="white" stroke-width="2" stroke-linejoin="round"/>
                              <circle cx="4" cy="4" r="2" stroke="white" stroke-width="2"/>
                            </svg>
                          </a>
                        </td>
                        <td style="padding:0 6px;">
                          <a href="https://twitter.com/needmoconsult" style="display:inline-block;width:32px;height:32px;background:rgba(255,255,255,0.1);border-radius:8px;text-align:center;line-height:32px;text-decoration:none;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
                              <path d="M4 4L20 20M4 20L20 4" stroke="white" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 6px;font-size:13px;color:#aaaaaa;">© ${new Date().getFullYear()} NEEDMO CONSULT. All rights reserved.</p>
                    <p style="margin:0;font-size:12px;color:#666666;">You're receiving this because you subscribed at needmoconsult.com</p>
                  </td>
                </tr>
              </table>
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