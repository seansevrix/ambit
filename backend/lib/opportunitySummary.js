const KEYWORDS = [
  "scope",
  "services",
  "work includes",
  "contractor shall",
  "vendor shall",
  "install",
  "provide",
  "repair",
  "replace",
  "maintenance",
  "janitorial",
  "custodial",
  "landscaping",
  "grounds",
  "electrical",
  "hvac",
  "plumbing",
  "security",
  "staffing",
  "office supplies",
  "deadline",
  "due",
  "proposal",
  "quote",
  "bid",
  "site visit",
  "walkthrough",
  "submission",
];

function cleanText(input = "") {
  return String(input)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/www\.\S+/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[•●▪◦■□]+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text = "") {
  return cleanText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function truncateAtWord(text = "", maxLength = 300) {
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

function scoreSentence(sentence = "", index = 0) {
  const lower = sentence.toLowerCase();
  let score = 0;

  for (const keyword of KEYWORDS) {
    if (lower.includes(keyword)) score += 3;
  }

  if (
    /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|monday|tuesday|wednesday|thursday|friday)\b/i.test(
      sentence
    )
  ) {
    score += 2;
  }

  if (/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/.test(sentence)) {
    score += 2;
  }

  if (/\bsubmit|proposal|deadline|due|quote|bid|walkthrough|site visit\b/i.test(lower)) {
    score += 4;
  }

  if (sentence.length >= 60 && sentence.length <= 180) {
    score += 2;
  }

  score += Math.max(0, 3 - index);

  return score;
}

function fallbackSummary(opportunity = {}) {
  const title = cleanText(opportunity.title || opportunity.name || "Opportunity");
  const location = cleanText(
    opportunity.location ||
      [opportunity.city, opportunity.state].filter(Boolean).join(", ")
  );

  if (location) {
    return `${title} in ${location}. Review the scope, deadline, and submission requirements to decide whether to pursue.`;
  }

  return `${title}. Review the scope, deadline, and submission requirements to decide whether to pursue.`;
}

function buildOpportunitySummary(opportunity = {}) {
  const title = cleanText(opportunity.title || opportunity.name || "");
  const location = cleanText(
    opportunity.location ||
      [opportunity.city, opportunity.state].filter(Boolean).join(", ")
  );

  const sourceText = cleanText(
    opportunity.opportunitySummary ||
      opportunity.summary ||
      opportunity.description ||
      opportunity.requirements ||
      opportunity.scope ||
      opportunity.details ||
      opportunity.rawText ||
      opportunity.sourceText ||
      opportunity.content ||
      opportunity.fullText ||
      ""
  );

  if (!sourceText) {
    return fallbackSummary(opportunity);
  }

  const uniqueSentences = [];
  const seen = new Set();

  for (const sentence of splitSentences(sourceText)) {
    const normalized = sentence.toLowerCase();
    if (sentence.length < 35) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    uniqueSentences.push(sentence);
  }

  if (!uniqueSentences.length) {
    return fallbackSummary(opportunity);
  }

  const ranked = uniqueSentences
    .map((sentence, index) => ({
      sentence,
      score: scoreSentence(sentence, index),
    }))
    .sort((a, b) => b.score - a.score);

  const picked = [];
  for (const item of ranked) {
    if (picked.length >= 2) break;
    picked.push(item.sentence);
  }

  let summary = picked.join(" ");

  if (title && !summary.toLowerCase().includes(title.toLowerCase().slice(0, 20))) {
    summary = `${title}. ${summary}`;
  }

  if (location && !summary.toLowerCase().includes(location.toLowerCase())) {
    summary = `${summary} Location: ${location}.`;
  }

  return truncateAtWord(summary, 300);
}

function addOpportunitySummary(opportunity = {}) {
  return {
    ...opportunity,
    opportunitySummary: buildOpportunitySummary(opportunity),
  };
}

function addSummaryToList(items = []) {
  return items.map((item) => addOpportunitySummary(item));
}

module.exports = {
  buildOpportunitySummary,
  addOpportunitySummary,
  addSummaryToList,
};