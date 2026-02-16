// backend/lib/emailTemplates/morningMatchesV2.js

const COLORS = {
  pageBg: "#f3f4f6",
  cardBg: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e5e7eb",
  ambitBlue: "#2563eb",
  ambitBlueHoverSafe: "#1d4ed8",
};

const FONT_STACK =
  "Inter, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(value, fallback = "#") {
  const v = String(value || "").trim();
  if (!v) return fallback;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:")) return v;
  return fallback;
}

function formatDate(value) {
  if (!value) return "TBD";
  const asDate = new Date(value);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  }
  return esc(value);
}

function renderLogo(logoUrl) {
  const cleaned = safeUrl(logoUrl, "");
  if (!cleaned) {
    return `
      <div style="font:800 28px/1 ${FONT_STACK}; color:${COLORS.text}; letter-spacing:0.5px;">
        AMBIT
      </div>
    `;
  }

  return `
    <img
      src="${esc(cleaned)}"
      alt="AMBIT"
      style="display:block; max-height:44px; width:auto; border:0; outline:none; text-decoration:none;"
    />
  `;
}

function renderTopMatchCard(match) {
  if (!match || typeof match !== "object") {
    return `
      <div style="border:1px solid ${COLORS.border}; border-radius:12px; padding:18px;">
        <div style="font:700 24px/1.25 ${FONT_STACK}; color:${COLORS.text}; margin:0 0 10px;">
          No new top match today
        </div>
        <div style="font:500 17px/1.6 ${FONT_STACK}; color:${COLORS.muted};">
          We are still scanning and ranking opportunities for your profile.
        </div>
      </div>
    `;
  }

  const title = esc(match?.title || match?.opportunityTitle || match?.name || "Opportunity");
  const location = esc(match?.location || match?.place || match?.cityState || "Location TBD");
  const naics = esc(match?.naics || match?.naicsCode || "N/A");
  const type = esc(match?.noticeType || match?.type || "Contract opportunity");
  const due = formatDate(match?.dueDate || match?.responseDate || match?.deadline);

  return `
    <div style="border:1px solid ${COLORS.border}; border-radius:12px; padding:18px;">
      <div style="font:800 44px/1.1 ${FONT_STACK}; color:${COLORS.text}; margin:0 0 12px; letter-spacing:-0.02em;">
        ${title}
      </div>

      <div style="font:500 23px/1.55 ${FONT_STACK}; color:${COLORS.text};">
        <div><strong style="font-weight:700;">NAICS:</strong> ${naics}</div>
        <div><strong style="font-weight:700;">Type:</strong> ${type}</div>
        <div><strong style="font-weight:700;">Location:</strong> ${location}</div>
        <div><strong style="font-weight:700;">Due:</strong> ${due}</div>
      </div>
    </div>
  `;
}

/**
 * Tech-forward AMBIT morning digest template:
 * - Only one clickable link in the entire email: "View My Matches"
 * - No stars, no emojis, no opportunity-level links
 */
export function renderMorningMatchesV2({
  customerName = "there",
  matches = [],
  logoUrl = "",
  tagline = "Stop hunting. Start receiving.",
  // keep these accepted so existing callers won't break; links are intentionally not used
  unsubscribeUrl = "",
  managePrefsUrl = "",
  addressLine = "32071 Campanula Way",
  previewText = "Your top AMBIT match is ready.",
  allMatchesUrl = "",
  viewMatchesUrl = "https://www.ambitco.app/login",
} = {}) {
  const safeName = esc(customerName);
  const safeTagline = esc(tagline);
  const safePreview = esc(previewText);

  // hard-limit to top 1 for this template
  const topMatch = Array.isArray(matches) && matches.length > 0 ? matches[0] : null;
  const countText = topMatch
    ? "We identified your top match for today."
    : "No new top match today. We are still scanning for your next fit.";

  // CTA URL preference: explicit viewMatchesUrl -> allMatchesUrl -> login fallback
  const ctaUrl = esc(
    safeUrl(viewMatchesUrl || allMatchesUrl || "https://www.ambitco.app/login", "https://www.ambitco.app/login")
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AMBIT Morning Matches</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.pageBg};">
  <!-- Hidden preheader -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all; visibility:hidden;">
    ${safePreview}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.pageBg};">
    <tr>
      <td align="center" style="padding:26px 12px;">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px; max-width:640px;">

          <tr>
            <td style="padding:0 4px 16px 4px;">
              ${renderLogo(logoUrl)}
              <div style="margin-top:10px; font:700 28px/1.35 ${FONT_STACK}; color:${COLORS.text}; letter-spacing:-0.01em;">
                ${safeTagline}
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:${COLORS.cardBg}; border-radius:12px; padding:24px 28px;">
              <div style="font:800 64px/1.1 ${FONT_STACK}; color:${COLORS.text}; margin:0 0 8px; letter-spacing:-0.03em;">
                Hi ${safeName}
              </div>
              <div style="font:500 34px/1.35 ${FONT_STACK}; color:${COLORS.text}; letter-spacing:-0.01em;">
                ${esc(countText)}
              </div>
            </td>
          </tr>

          <tr><td style="height:16px;"></td></tr>

          <tr>
            <td style="background:${COLORS.cardBg}; border-radius:12px; padding:24px 28px;">
              <div style="font:800 58px/1.1 ${FONT_STACK}; color:${COLORS.text}; margin:0 0 10px; letter-spacing:-0.02em;">
                Your top match
              </div>
              <div style="font:500 30px/1.4 ${FONT_STACK}; color:${COLORS.text}; margin:0 0 16px; letter-spacing:-0.01em;">
                Matched to your market, location, and profile signals.
              </div>

              ${renderTopMatchCard(topMatch)}

              <div style="margin-top:16px;">
                <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer"
                   style="display:block; text-align:center; background:${COLORS.ambitBlue}; color:#ffffff; text-decoration:none; font:700 24px/1 ${FONT_STACK}; padding:16px 14px; border-radius:10px;">
                  View My Matches
                </a>
              </div>

              <div style="margin-top:14px; font:500 17px/1.6 ${FONT_STACK}; color:${COLORS.muted};">
                Reach out to ambit@sevrixgov.com to be connected with an AMBIT Associate for next steps.
              </div>
            </td>
          </tr>

          <tr><td style="height:14px;"></td></tr>

          <tr>
            <td style="padding:0 4px; font:500 13px/1.7 ${FONT_STACK}; color:${COLORS.muted};">
              You’re receiving this email because you signed up for AMBIT alerts.<br />
              ${esc(addressLine)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
