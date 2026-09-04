const SENSITIVE_EMPLOYMENT_PATTERNS = [
  /возраст/i,
  /дата\s+рождени/i,
  /год\s+рождени/i,
  /(?:^|[^а-яё])пол(?:$|[^а-яё])/i,
  /гендер/i,
  /национальн/i,
  /этнич/i,
  /расов/i,
  /религи/i,
  /вероисповед/i,
  /инвалид/i,
  /здоров/i,
  /беремен/i,
  /семейн(?:ое|ый|ая)?\s+положен/i,
  /наличи[ея]\s+дет/i,
  /сексуальн/i,
  /ориентац/i,
  /политическ/i,
  /профсоюз/i,
  /\bage\b/i,
  /date\s+of\s+birth/i,
  /year\s+of\s+birth/i,
  /\bgender\b/i,
  /\bsex\b/i,
  /\brace\b/i,
  /ethnic/i,
  /nationality/i,
  /religion/i,
  /disabilit/i,
  /health/i,
  /pregnan/i,
  /marital/i,
  /sexual\s+orientation/i,
  /political/i,
  /trade\s+union/i,
];

function criteriaLines(value: string): string[] {
  return value
    .replace(/\r\n/g, "\n")
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isSensitiveEmploymentCriterion(value: string): boolean {
  return SENSITIVE_EMPLOYMENT_PATTERNS.some((pattern) => pattern.test(value));
}

export function splitEmploymentCriteria(value: string): {
  allowed: string[];
  blocked: string[];
} {
  const allowed: string[] = [];
  const blocked: string[] = [];

  criteriaLines(value).forEach((criterion) => {
    if (isSensitiveEmploymentCriterion(criterion)) blocked.push(criterion);
    else allowed.push(criterion);
  });

  return { allowed, blocked };
}
