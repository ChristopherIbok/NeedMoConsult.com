import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const {
      to,
      subject,
      issue = "001",
      heroTitle = "",
      heroIntro = "",
      articleTitle = "",
      articleBody = "",
      articleUrl = "https://needmoconsult.com/blog",
      pullQuote = "",
      tips = [],
      offerTitle = "",
      offerBody = "",
      offerUrl = "https://needmoconsult.com/Contact",
      offerLabel = "Book Free Strategy Call",
    } = await req.json();

    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const year = new Date().getFullYear();

    const recipients = Array.isArray(to) ? to : [to];

    // ── Build dynamic sections ──────────────────────────────────────────────

    const articleSection = articleTitle ? `
    <!-- ══ FEATURED ARTICLE ══ -->
    <tr>
      <td style="padding:40px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="border-left:3px solid #D4AF7A;padding-left:12px;">
              <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:4px;font-family:Arial,sans-serif;">Featured Article</p>
              <h2 style="margin:0;font-size:22px;font-weight:800;color:#1A2332;line-height:1.3;font-family:Arial,sans-serif;">${articleTitle}</h2>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.8;font-family:Arial,sans-serif;">${articleBody}</p>
        ${pullQuote ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="border-left:4px solid #D4AF7A;background-color:#F8F6F2;padding:16px 20px;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:16px;font-weight:700;color:#1A2332;font-family:Arial,sans-serif;font-style:italic;line-height:1.5;">"${pullQuote}"</p>
            </td>
          </tr>
        </table>` : ""}
        <a href="${articleUrl}" style="display:inline-block;border:2px solid #1A2332;color:#1A2332;font-size:13px;font-weight:700;text-decoration:none;padding:10px 24px;border-radius:4px;font-family:Arial,sans-serif;letter-spacing:0.5px;">
          Read Full Article &rarr;
        </a>
      </td>
    </tr>
    <tr><td style="padding:36px 40px 0;"><div style="height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</div></td></tr>
    ` : "";

    const tipsSection = tips.length > 0 ? `
    <!-- ══ QUICK TIPS ══ -->
    <tr>
      <td style="padding:36px 40px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="border-left:3px solid #D4AF7A;padding-left:12px;">
              <p style="margin:0 0 2px;font-size:10px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:4px;font-family:Arial,sans-serif;">Quick Tips</p>
              <h2 style="margin:0;font-size:22px;font-weight:800;color:#1A2332;line-height:1.3;font-family:Arial,sans-serif;">Actionable Insights For This Week</h2>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${tips.map((tip: { title: string; desc: string }, i: number) => `
          <tr>
            <td style="padding:16px 0;${i < tips.length - 1 ? "border-bottom:1px solid #F0F0F0;" : ""}">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:40px;vertical-align:top;padding-top:1px;">
                    <div style="width:32px;height:32px;background-color:#1A2332;border-radius:4px;text-align:center;line-height:32px;font-size:11px;font-weight:900;color:#D4AF7A;font-family:Arial,sans-serif;">${String(i + 1).padStart(2, "0")}</div>
                  </td>
                  <td style="vertical-align:top;padding-left:16px;">
                    <p style="margin:0 0 5px;font-size:14px;font-weight:700;color:#1A2332;font-family:Arial,sans-serif;">${tip.title}</p>
                    <p style="margin:0;font-size:13px;color:#666666;line-height:1.65;font-family:Arial,sans-serif;">${tip.desc}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>
    <tr><td style="padding:36px 40px 0;"><div style="height:1px;background-color:#EEEEEE;font-size:0;line-height:0;">&nbsp;</div></td></tr>
    ` : "";

    const offerSection = offerTitle ? `
    <!-- ══ CTA OFFER BLOCK ══ -->
    <tr>
      <td style="padding:0 40px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;border-radius:6px;overflow:hidden;">
          <tr><td style="background:linear-gradient(90deg,#D4AF7A,#C49A5E);height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:4px;font-family:Arial,sans-serif;">🎯 &nbsp;Exclusive Subscriber Offer</p>
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#FFFFFF;line-height:1.25;font-family:Arial,sans-serif;">${offerTitle}</h2>
              <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.65);line-height:1.75;font-family:Arial,sans-serif;">${offerBody}</p>
              <a href="${offerUrl}" style="display:inline-block;background-color:#D4AF7A;color:#1A2332;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:4px;font-family:Arial,sans-serif;letter-spacing:0.5px;">${offerLabel} &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : "";

    // ── Full HTML ───────────────────────────────────────────────────────────

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${subject}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; }
      .hero-title { font-size: 26px !important; }
      .section-pad { padding: 28px 24px !important; }
      .two-col td { display: block !important; width: 100% !important; padding-bottom: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#EBEBEB;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EBEBEB;">
<tr><td align="center" style="padding:32px 16px;">

  <table class="email-container" role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">

    <!-- PREHEADER -->
    <tr><td style="display:none;max-height:0;overflow:hidden;font-size:0;line-height:0;">${heroIntro}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</td></tr>

    <!-- TOP BAR -->
    <tr>
      <td style="background-color:#1A2332;padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:linear-gradient(90deg,#D4AF7A 0%,#C49A5E 50%,#1A2332 100%);height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:20px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.svg" alt="NEEDMO CONSULT" height="34" style="display:block;height:34px;width:auto;border:0;"/>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;">
                      Weekly Insights &nbsp;·&nbsp; Issue #${issue} &nbsp;·&nbsp; ${date}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- HERO -->
    <tr>
      <td style="background-color:#1A2332;padding:0 40px 48px;">
        <p style="margin:0 0 16px;font-size:10px;font-weight:700;color:#D4AF7A;text-transform:uppercase;letter-spacing:4px;font-family:Arial,sans-serif;">This Week's Edition</p>
        <h1 class="hero-title" style="margin:0 0 20px;font-size:36px;font-weight:900;color:#FFFFFF;line-height:1.15;font-family:Arial,sans-serif;letter-spacing:-0.5px;">${heroTitle}</h1>
        <div style="width:48px;height:3px;background-color:#D4AF7A;margin-bottom:20px;border-radius:2px;"></div>
        <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.75;font-family:Arial,sans-serif;">${heroIntro}</p>
        <a href="https://needmoconsult.com/Contact" style="display:inline-block;background-color:#D4AF7A;color:#1A2332;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:4px;font-family:Arial,sans-serif;letter-spacing:0.5px;">Book a Free Strategy Call &rarr;</a>
      </td>
    </tr>

    <!-- INTRO STRIP -->
    <tr>
      <td style="background-color:#F8F6F2;border-top:3px solid #D4AF7A;border-bottom:1px solid #E8E4DC;padding:20px 40px;">
        <p style="margin:0;font-size:13px;color:#888888;font-family:Arial,sans-serif;line-height:1.6;font-style:italic;">
          👋 &nbsp;You're receiving this because you subscribed at <a href="https://needmoconsult.com" style="color:#D4AF7A;text-decoration:none;">needmoconsult.com</a>. Every week we share actionable tips, case studies and exclusive offers to help your brand grow online.
        </p>
      </td>
    </tr>

    ${articleSection}
    ${tipsSection}

    <!-- STAT STRIP -->
    <tr>
      <td style="padding:32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="two-col">
          <tr>
            <td style="width:33%;text-align:center;padding:16px;background-color:#F8F6F2;border-radius:4px;">
              <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#1A2332;font-family:Arial,sans-serif;line-height:1;">50+</p>
              <p style="margin:0;font-size:11px;color:#999999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Happy Clients</p>
            </td>
            <td style="width:4%;font-size:0;">&nbsp;</td>
            <td style="width:33%;text-align:center;padding:16px;background-color:#1A2332;border-radius:4px;">
              <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#D4AF7A;font-family:Arial,sans-serif;line-height:1;">3M+</p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">People Reached</p>
            </td>
            <td style="width:4%;font-size:0;">&nbsp;</td>
            <td style="width:33%;text-align:center;padding:16px;background-color:#F8F6F2;border-radius:4px;">
              <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#1A2332;font-family:Arial,sans-serif;line-height:1;">500+</p>
              <p style="margin:0;font-size:11px;color:#999999;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">Posts Created</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${offerSection}

    <!-- SIGN-OFF -->
    <tr>
      <td style="padding:0 40px 40px;">
        <div style="height:1px;background-color:#EEEEEE;margin-bottom:32px;font-size:0;line-height:0;">&nbsp;</div>
        <p style="margin:0 0 6px;font-size:15px;color:#444444;font-family:Arial,sans-serif;line-height:1.6;">Until next week,</p>
        <p style="margin:0 0 16px;font-size:22px;font-weight:900;color:#1A2332;font-family:Arial,sans-serif;letter-spacing:-0.5px;">Kriz</p>
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#1A2332;font-family:Arial,sans-serif;">Founder, NEEDMO CONSULT</p>
        <p style="margin:0;font-size:12px;color:#999999;font-family:Arial,sans-serif;line-height:1.7;">Social Media Strategist &nbsp;·&nbsp; Video Editor &nbsp;·&nbsp; Content Consultant</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr>
            <td style="background-color:#F8F6F2;border-left:3px solid #D4AF7A;padding:16px 20px;border-radius:0 4px 4px 0;">
              <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;font-family:Arial,sans-serif;">
                <strong style="color:#1A2332;">P.S.</strong> If this newsletter helped you, forward it to another business owner who's struggling with social media. They'll thank you for it. 🙏
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color:#1A2332;padding:0;">
        <div style="height:1px;background-color:rgba(212,175,122,0.2);font-size:0;line-height:0;">&nbsp;</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:32px 40px 20px;text-align:center;">
              <img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.svg" alt="NEEDMO CONSULT" height="30" style="display:block;margin:0 auto 8px;height:30px;width:auto;border:0;"/>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.35);font-family:Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;">Your Brand Deserves More</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 24px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 5px;">
                    <a href="https://instagram.com/needmoconsult" style="display:inline-block;width:36px;height:36px;background-color:rgba(212,175,122,0.1);border:1px solid rgba(212,175,122,0.2);border-radius:4px;text-align:center;line-height:36px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/instagram-new.png" width="18" height="18" alt="Instagram" style="display:inline-block;vertical-align:middle;border:0;"/>
                    </a>
                  </td>
                  <td style="padding:0 5px;">
                    <a href="https://linkedin.com/company/needmoconsult" style="display:inline-block;width:36px;height:36px;background-color:rgba(212,175,122,0.1);border:1px solid rgba(212,175,122,0.2);border-radius:4px;text-align:center;line-height:36px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/linkedin.png" width="18" height="18" alt="LinkedIn" style="display:inline-block;vertical-align:middle;border:0;"/>
                    </a>
                  </td>
                  <td style="padding:0 5px;">
                    <a href="https://twitter.com/needmoconsult" style="display:inline-block;width:36px;height:36px;background-color:rgba(212,175,122,0.1);border:1px solid rgba(212,175,122,0.2);border-radius:4px;text-align:center;line-height:36px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/twitterx.png" width="18" height="18" alt="Twitter" style="display:inline-block;vertical-align:middle;border:0;"/>
                    </a>
                  </td>
                  <td style="padding:0 5px;">
                    <a href="https://facebook.com/needmoconsult" style="display:inline-block;width:36px;height:36px;background-color:rgba(212,175,122,0.1);border:1px solid rgba(212,175,122,0.2);border-radius:4px;text-align:center;line-height:36px;text-decoration:none;">
                      <img src="https://img.icons8.com/color/24/facebook-new.png" width="18" height="18" alt="Facebook" style="display:inline-block;vertical-align:middle;border:0;"/>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background-color:rgba(255,255,255,0.07);font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.25);font-family:Arial,sans-serif;line-height:1.6;">
                &copy; ${year} NEEDMO CONSULT. All rights reserved.<br/>
                Lagos, Nigeria &nbsp;·&nbsp; hello@needmoconsult.com
              </p>
              <p style="margin:0;font-size:11px;font-family:Arial,sans-serif;">
                <a href="https://needmoconsult.com" style="color:rgba(212,175,122,0.5);text-decoration:none;">needmoconsult.com</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://needmoconsult.com/PrivacyPolicy" style="color:rgba(212,175,122,0.5);text-decoration:none;">Privacy Policy</a>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                <a href="https://needmoconsult.com/unsubscribe" style="color:rgba(212,175,122,0.5);text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

    // ── Send via Resend ─────────────────────────────────────────────────────

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kriz at NEEDMO CONSULT <hello@needmoconsult.com>",
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});