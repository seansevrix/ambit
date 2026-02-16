// backend/lib/emailTemplates/morningMatchesV2.js

const COLORS = {
  pageBg: "#f3f4f6",
  cardBg: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
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
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:")) return v;
  return fallback;
}

function formatDate(value) {
  if (!value) return "TBD";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  }
  return esc(value);
}

function scoreToStars(rawScore) {
  let stars = 3;

  if (typeof rawScore === "number" && !Number.isNaN(rawScore)) {
    stars = rawScore > 5 ? Math.round(rawScore / 20) : Math.round(rawScore);
  } else if (typeof rawScore === "string" && rawScore.trim() !== "") {
    const n = Number(rawScore);
    if (!Number.isNaN(n)) {
      stars = n > 5 ? Math.round(n / 20) : Math.round(n);
    }
  }

  stars = Math.max(1, Math.min(5, stars));

  return {
    stars,
    filled: "★".repeat(stars),
    empty: "★".repeat(5 - stars),
  };
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
    <img
      src="${esc(cleaned)}"
      alt="AMBIT"
      width="140"
      height="44"
      style="display:block; width:auto; height:44px; border:0; outline:none; text-decoration:none;"
    />
  `;
}

function renderTopMatch(match) {
  if (!match) {
    return `
      <div style="padding:18px 0; font:500 16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.muted};">
        No top match available yet — we’re still scanning for your best fit.
      </div>
    `;
  }

  const title = esc(match.title || "Opportunity");
  const location = esc(match.location || "Location TBD");
  const naics = esc(match.naics || "N/A");
  const type = esc(match.noticeType || match.type || "Contract opportunity");
  const due = formatDate(match.dueDate || match.responseDate);
  const url = esc(safeUrl(match.url, "#"));
  const { stars, filled, empty } = scoreToStars(match.score ?? match.matchScore);

  return `
    <div style="padding:18px 0; border-top:1px solid ${COLORS.border};">
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
         style="display:inline-block; color:#111827; text-decoration:underline; font:700 16px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        View top match
      </a>
    </div>
  `;
}

/**
 * Morning Matches v2 (Top Match Only)
 * Visual-only template. Does NOT change matching logic.
 */
export function renderMorningMatchesV2({
  customerName = "there",
  matches = [],
  allMatchesUrl = "https://www.ambitco.app/live-opportunities",
  logoUrl = "https://www.ambitco.app/branding/ambit-logo-email.jpeg",
  tagline = "Stop hunting. Start receiving.",
  unsubscribeUrl = "#",
  managePrefsUrl = "#",
  addressLine = "32071 Campanula Way",
  previewText = "Your AMBIT top match is ready.",
} = {}) {
  // TOP MATCH ONLY
  const topMatch = Array.isArray(matches) && matches.length ? matches[0] : null;

  const safeName = esc(customerName);
  const safeTagline = esc(tagline);
  const safePreview = esc(previewText);
  const safeAllMatchesUrl = esc(safeUrl(allMatchesUrl, "https://www.ambitco.app/live-opportunities"));
  const safeUnsub = esc(safeUrl(unsubscribeUrl, "#"));
  const safePrefs = esc(safeUrl(managePrefsUrl, "#"));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AMBIT Morning Match</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.pageBg};">
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
                Here is your top match for today.
              </div>
            </td>
          </tr>

          <tr><td style="height:16px;"></td></tr>

          <tr>
            <td style="background:${COLORS.cardBg}; border-radius:12px; padding:24px 28px;">
              <div style="font:700 48px/1.15 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${COLORS.text}; margin:0 0 8px;">
                Your top match
              </div>

              ${renderTopMatch(topMatch)}

              <div style="margin-top:8px;">
                <a href="${safeAllMatchesUrl}" target="_blank" rel="noopener noreferrer"
                   style="color:#111827; text-decoration:underline; font:700 17px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
                  View all matches
                </a>
              </div>
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
