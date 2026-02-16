// backend/lib/emailTemplates/morningMatchesV2.js

const COLORS = {
  pageBg: "#f3f4f6",
  cardBg: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  buttonBg: "#eceef1",
  buttonText: "#111827",
  star: "#f6b800",
  starEmpty: "#d1d5db",
};

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
  // basic safety for email HTML
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

function normalizeCountText(count) {
  if (count === 1) return "We have 1 job match for you based on your preferences.";
  return `We have ${count} job matches for you based on your preferences.`;
}

function scoreToStars(rawScore) {
  let stars = 3;

  if (typeof rawScore === "number" && !Number.isNaN(rawScore)) {
    // supports either 0-100 or 0-5 input
    stars = rawScore > 5 ? Math.round(rawScore / 20) : Math.round(rawScore);
  } else if (typeof rawScore === "string" && rawScore.trim() !== "") {
    const parsed = Number(rawScore);
    if (!Number.isNaN(parsed)) {
      stars = parsed > 5 ? Math.round(parsed / 20) : Math.round(parsed);
    }
  }

  stars = Math.max(1, Math.min(5, stars));

  return {
    stars,
    filled: "★".repeat(stars),
    empty: "★".repeat(5 - stars), // same character, different color for consistency
  };
}

function renderMatchRow(match, idx) {
  const title = esc(match?.title || "Opportunity");
  const location = esc(match?.location || "Location TBD");
  const naics = esc(match?.naics || "N/A");
  const type = esc(match?.noticeType || match?.type || "Contract opportunity");
  const due = formatDate(match?.dueDate || match?.responseDate);
  const url = esc(safeUrl(match?.url, "#"));

  const { stars, filled, empty } = scoreToStars(match?.score ?? match?.matchScore);
  const divider = idx > 0 ? `border-top:1px solid ${COLORS.border};` : "";

  return `
    <tr>
      <td style="padding:24px 0; ${divider}">
        <div style="font:700 38px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 10px;">
          ${title}
        </div>

        <div style="margin:0 0 10px;">
          <span style="font:700 20px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.star}; letter-spacing:1px;">
            ${filled}
          </span><span style="font:700 20px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.starEmpty}; letter-spacing:1px;">
            ${empty}
          </span>
          <span style="font:500 14px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.muted}; margin-left:6px;">
            ${stars}
          </span>
        </div>

        <div style="font:500 18px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 14px;">
          <div>🏷️ ${naics}</div>
          <div>🧾 ${type}</div>
          <div>📍 ${location}</div>
          <div>📅 Due: ${due}</div>
        </div>

        <a href="${url}" target="_blank" rel="noopener noreferrer"
           style="display:block; text-align:center; background:${COLORS.buttonBg}; color:${COLORS.buttonText}; text-decoration:none; font:700 18px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; padding:14px 12px; border-radius:8px;">
          View
        </a>
      </td>
    </tr>
  `;
}

function renderLogo(logoUrl) {
  const cleaned = safeUrl(logoUrl, "");
  if (!cleaned) {
    return `
      <div style="font:800 28px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; letter-spacing:0.5px;">
        AMBIT
      </div>
    `;
  }

  return `
    <img src="${esc(cleaned)}"
         alt="AMBIT"
         style="display:block; height:44px; width:auto; border:0; outline:none; text-decoration:none;" />
  `;
}

/**
 * DraftKings-inspired "Morning Matches" layout
 * Visual-only template. Does NOT modify matching/scoring logic.
 */
export function renderMorningMatchesV2({
  customerName = "there",
  matches = [],
  allMatchesUrl = "https://www.ambitco.app/live-opportunities",
  logoUrl = "",
  tagline = "Stop hunting. Start receiving.",
  unsubscribeUrl = "#",
  managePrefsUrl = "#",
  addressLine = "32071 Campanula Way",
  previewText = "Your new AMBIT matches are ready.",
} = {}) {
  const safeName = esc(customerName);
  const safeTagline = esc(tagline);
  const safePreview = esc(previewText);

  const list = Array.isArray(matches) ? matches.slice(0, 3) : [];
  const count = list.length;
  const countText = normalizeCountText(count);
  const safeAllMatchesUrl = esc(safeUrl(allMatchesUrl, "https://www.ambitco.app/live-opportunities"));
  const safeUnsub = esc(safeUrl(unsubscribeUrl, "#"));
  const safePrefs = esc(safeUrl(managePrefsUrl, "#"));

  const matchesHtml = count
    ? list.map((m, i) => renderMatchRow(m, i)).join("")
    : `
      <tr>
        <td style="padding:18px 0; font:500 16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.muted};">
          No new high-confidence matches yet — we’re still scanning for your next fit.
        </td>
      </tr>
    `;

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
              <div style="margin-top:10px; font:700 18px/1.35 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text};">
                ${safeTagline}
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:${COLORS.cardBg}; border-radius:12px; padding:24px 28px;">
              <div style="font:700 42px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 8px;">
                Hi ${safeName}
              </div>
              <div style="font:500 23px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text};">
                ${esc(countText)} Could one of these opportunities be a great fit?
              </div>
            </td>
          </tr>

          <tr><td style="height:16px;"></td></tr>

          <tr>
            <td style="background:${COLORS.cardBg}; border-radius:12px; padding:24px 28px;">
              <div style="font:700 48px/1.15 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 8px;">
                Your matches
              </div>
              <div style="font:500 21px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 14px;">
                Matched to you — based on your current market, location, and relevant keywords.
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${matchesHtml}
              </table>

              <a href="${safeAllMatchesUrl}" target="_blank" rel="noopener noreferrer"
                 style="display:block; text-align:center; background:${COLORS.buttonBg}; color:${COLORS.buttonText}; text-decoration:none; font:700 18px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; padding:14px 12px; border-radius:8px; margin-top:8px;">
                View all matches
              </a>
            </td>
          </tr>

          <tr><td style="height:14px;"></td></tr>

          <tr>
            <td style="padding:0 4px; font:500 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.muted};">
              You’re receiving this email because you signed up for AMBIT alerts.
              <a href="${safeUnsub}" style="color:#374151;">Unsubscribe</a>
              &nbsp;•&nbsp;
              <a href="${safePrefs}" style="color:#374151;">Manage preferences</a><br />
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
