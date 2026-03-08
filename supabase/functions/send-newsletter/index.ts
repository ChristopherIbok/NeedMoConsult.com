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
      year: "numeric", month: "long", day: "numeric",
    });
    const year = new Date().getFullYear();
    const recipients = Array.isArray(to) ? to : [to];

    // ── Dynamic sections ────────────────────────────────────────────────────

    const articleSection = articleTitle ? `
    <tr>
      <td style="padding:52px 40px 0;">
        <p style="margin:0 0 16px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Featured Article</p>
        <h2 style="margin:0 0 20px;font-size:26px;font-weight:normal;color:#1A2332;line-height:1.3;font-family:Georgia,serif;">${articleTitle}</h2>
        <p style="margin:0 0 32px;font-size:15px;color:#5A5A5A;line-height:1.85;font-family:Georgia,serif;">${articleBody}</p>
        ${pullQuote ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
          <tr>
            <td style="padding:24px 28px;background-color:#F9F7F4;border-left:2px solid #D4AF7A;">
              <p style="margin:0 0 10px;font-size:19px;color:#1A2332;line-height:1.5;font-family:Georgia,serif;font-style:italic;">&#8220;${pullQuote}&#8221;</p>
              <p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">&mdash; NEEDMO CONSULT</p>
            </td>
          </tr>
        </table>` : ""}
        <a href="${articleUrl}" style="display:inline-block;border:1px solid #1A2332;color:#1A2332;font-size:10px;text-decoration:none;padding:12px 28px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Read Full Article &rarr;</a>
      </td>
    </tr>
    <tr><td style="padding:52px 40px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:40px;height:1px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td>
          <td style="height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
    </td></tr>` : "";

    const tipsRows = tips.map((tip: { title: string; desc: string }, i: number) => `
          <tr><td style="padding:20px 0;border-top:1px solid #EEEBE5;${i === tips.length - 1 ? "border-bottom:1px solid #EEEBE5;" : ""}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="width:32px;vertical-align:top;padding-top:3px;"><p style="margin:0;font-size:11px;color:#D4AF7A;font-family:Georgia,serif;">${String(i + 1).padStart(2, "0")}</p></td>
              <td><p style="margin:0 0 5px;font-size:14px;color:#1A2332;font-family:Georgia,serif;font-weight:bold;">${tip.title}</p><p style="margin:0;font-size:13px;color:#777;line-height:1.7;font-family:Georgia,serif;">${tip.desc}</p></td>
            </tr></table>
          </td></tr>`).join("");

    const tipsSection = tips.length > 0 ? `
    <tr>
      <td style="padding:44px 40px 0;">
        <p style="margin:0 0 6px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Quick Tips</p>
        <h2 style="margin:0 0 32px;font-size:22px;font-weight:normal;color:#1A2332;font-family:Georgia,serif;">Actionable Insights For This Week</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${tipsRows}</table>
      </td>
    </tr>` : "";

    const offerSection = offerTitle ? `
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;">
          <tr><td style="height:2px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:48px 40px;">
              <p style="margin:0 0 20px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">Exclusive Subscriber Offer</p>
              <h2 style="margin:0 0 16px;font-size:28px;font-weight:normal;color:#FFFFFF;line-height:1.3;font-family:Georgia,serif;">${offerTitle}</h2>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.85;font-family:Georgia,serif;">${offerBody}</p>
              <a href="${offerUrl}" style="display:inline-block;background-color:#D4AF7A;color:#1A2332;font-size:11px;text-decoration:none;padding:15px 36px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">${offerLabel} &rarr;</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : "";

    // ── Full HTML ────────────────────────────────────────────────────────────

    const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${subject}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .email-wrap { width:100%!important;padding:0!important; }
      .email-body { width:100%!important; }
      .pad        { padding:32px 24px!important; }
      .hero-title { font-size:28px!important;line-height:1.2!important; }
      .stat-cell  { display:block!important;width:100%!important;padding:16px 0!important;border-right:none!important;border-bottom:1px solid #EEEBE5!important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#E8E6E1;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#E8E6E1;">
<tr><td class="email-wrap" align="center" style="padding:40px 16px;">
  <table class="email-body" role="presentation" width="580" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;">

    <!-- PREHEADER -->
    <tr><td style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;">${heroIntro}&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;&nbsp;&#847;</td></tr>

    <!-- HEADER -->
    <tr><td>
      <div style="height:3px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A2332;">
        <tr><td style="padding:20px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;"><img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Light.webp?V=2" alt="NEEDMO CONSULT" height="56" style="display:block;height:56px;width:auto;border:0;"/></td>
            <td align="right" style="vertical-align:middle;"><p style="margin:0;font-size:9px;color:rgba(255,255,255,0.35);font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Weekly Insights</p></td>
          </tr></table>
        </td></tr>
      </table>
    </td></tr>

    <!-- ISSUE LINE -->
    <tr><td style="padding:24px 40px;border-bottom:1px solid #EEEBE5;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td><p style="margin:0;font-size:10px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Issue No. ${issue} &nbsp;&mdash;&nbsp; ${date}</p></td>
        <td align="right"><p style="margin:0;font-size:10px;color:#B8A882;font-family:Georgia,serif;letter-spacing:2px;text-transform:uppercase;">Brand &amp; Social Intelligence</p></td>
      </tr></table>
    </td></tr>

    <!-- HERO -->
    <tr><td style="padding:52px 40px 44px;">
      <p style="margin:0 0 20px;font-size:9px;color:#D4AF7A;font-family:Georgia,serif;letter-spacing:5px;text-transform:uppercase;">This Week&#8217;s Edition</p>
      <h1 class="hero-title" style="margin:0 0 28px;font-size:38px;font-weight:normal;color:#1A2332;line-height:1.15;font-family:Georgia,serif;letter-spacing:-0.5px;">${heroTitle}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="width:40px;height:1px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</td>
          <td style="width:8px;">&nbsp;</td>
          <td style="width:460px;height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:0 0 32px;font-size:16px;color:#5A5A5A;line-height:1.85;font-family:Georgia,serif;">${heroIntro}</p>
      <a href="https://needmoconsult.com/Contact" style="display:inline-block;background-color:#1A2332;color:#D4AF7A;font-size:11px;text-decoration:none;padding:14px 32px;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Book a Free Strategy Call &rarr;</a>
    </td></tr>

    <!-- INTRO NOTE -->
    <tr><td style="padding:20px 40px;background-color:#F9F7F4;border-top:1px solid #EEEBE5;border-bottom:1px solid #EEEBE5;">
      <p style="margin:0;font-size:12px;color:#999;line-height:1.7;font-family:Georgia,serif;font-style:italic;">
        You&#8217;re receiving this because you subscribed at <a href="https://needmoconsult.com" style="color:#D4AF7A;text-decoration:none;">needmoconsult.com</a>. Every week we share brand intelligence, social strategy and exclusive offers to help your business grow.
      </p>
    </td></tr>

    ${articleSection}
    ${tipsSection}

    <!-- STATS -->
    <tr><td style="padding:48px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td class="stat-cell" align="center" style="padding:0 32px 0 0;border-right:1px solid #EEEBE5;vertical-align:middle;">
          <p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">50<span style="color:#D4AF7A;">+</span></p>
          <p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Happy Clients</p>
        </td>
        <td class="stat-cell" align="center" style="padding:0 32px;border-right:1px solid #EEEBE5;vertical-align:middle;">
          <p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">3M<span style="color:#D4AF7A;">+</span></p>
          <p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">People Reached</p>
        </td>
        <td class="stat-cell" align="center" style="padding:0 0 0 32px;vertical-align:middle;">
          <p style="margin:0 0 6px;font-size:38px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;line-height:1;">500<span style="color:#D4AF7A;">+</span></p>
          <p style="margin:0;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Posts Created</p>
        </td>
      </tr></table>
    </td></tr>

    ${offerSection}

    <!-- SIGN-OFF -->
    <tr><td style="padding:52px 40px 44px;">
      <p style="margin:0 0 4px;font-size:14px;color:#999;font-family:Georgia,serif;font-style:italic;">Until next week,</p>
      <p style="margin:0 0 16px;font-size:30px;color:#1A2332;font-family:Georgia,serif;font-weight:normal;font-style:italic;">Chris</p>
      <p style="margin:0 0 2px;font-size:12px;color:#1A2332;font-family:Georgia,serif;font-weight:bold;">Founder, NEEDMO CONSULT</p>
      <p style="margin:0 0 36px;font-size:11px;color:#B8A882;font-family:Georgia,serif;letter-spacing:1px;">Social Media Strategist &nbsp;&middot;&nbsp; Video Editor &nbsp;&middot;&nbsp; Content Consultant</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:20px 24px;background-color:#F9F7F4;border-left:2px solid #D4AF7A;">
            <p style="margin:0;font-size:13px;color:#666;line-height:1.75;font-family:Georgia,serif;font-style:italic;">
              <strong style="color:#1A2332;font-style:normal;">P.S.</strong> &nbsp;If this newsletter helped you, forward it to another business owner who&#8217;s struggling with social media. They&#8217;ll thank you for it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td>
      <div style="height:1px;background-color:#EEEBE5;font-size:0;line-height:0;">&nbsp;</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F9F7F4;">
        <tr><td style="padding:32px 40px;" align="center">
          <img src="https://qemjyupxlivyylpbnsjo.supabase.co/storage/v1/object/public/assets/Logo-Dark.webp?V=2" alt="NEEDMO CONSULT" height="56" style="display:block;margin:0 auto 8px;height:56px;width:auto;border:0;"/>
          <p style="margin:0 0 24px;font-size:9px;color:#B8A882;font-family:Georgia,serif;letter-spacing:3px;text-transform:uppercase;">Your Brand Deserves More</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr>
              <td style="padding:0 5px;"><a href="https://instagram.com/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/instagram-new.png" width="14" height="14" alt="Instagram" style="display:inline-block;vertical-align:middle;border:0;"/></a></td>
              <td style="padding:0 5px;"><a href="https://linkedin.com/company/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/linkedin.png" width="14" height="14" alt="LinkedIn" style="display:inline-block;vertical-align:middle;border:0;"/></a></td>
              <td style="padding:0 5px;"><a href="https://twitter.com/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/twitterx.png" width="14" height="14" alt="Twitter/X" style="display:inline-block;vertical-align:middle;border:0;"/></a></td>
              <td style="padding:0 5px;"><a href="https://facebook.com/needmoconsult" style="display:inline-block;width:30px;height:30px;border:1px solid #D4AF7A;text-align:center;line-height:30px;text-decoration:none;"><img src="https://img.icons8.com/ios/20/D4AF7A/facebook-new.png" width="14" height="14" alt="Facebook" style="display:inline-block;vertical-align:middle;border:0;"/></a></td>
            </tr>
          </table>
          <div style="height:1px;background-color:#E8E4DC;margin-bottom:20px;font-size:0;line-height:0;">&nbsp;</div>
          <p style="margin:0 0 8px;font-size:11px;color:#B8A882;font-family:Georgia,serif;line-height:1.6;">&copy; ${year} NEEDMO CONSULT &nbsp;&middot;&nbsp; Lagos, Nigeria &nbsp;&middot;&nbsp; hello@needmoconsult.com</p>
          <p style="margin:0;font-size:11px;font-family:Georgia,serif;">
            <a href="https://needmoconsult.com" style="color:#B8A882;text-decoration:none;">needmoconsult.com</a>
            &nbsp;&middot;&nbsp;
            <a href="https://needmoconsult.com/PrivacyPolicy" style="color:#B8A882;text-decoration:none;">Privacy Policy</a>
            &nbsp;&middot;&nbsp;
            <a href="https://needmoconsult.com/unsubscribe" style="color:#B8A882;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
      <div style="height:3px;background-color:#D4AF7A;font-size:0;line-height:0;">&nbsp;</div>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

    // ── Send via Resend ──────────────────────────────────────────────────────

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "NeedMo Consult <hello@needmoconsult.com>",
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to send email");

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
