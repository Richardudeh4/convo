function normalizeSpanish(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[¿?¡!.,;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

function wordMatchScore(spoken: string, expected: string): number {
  const spokenWords = spoken.split(" ").filter(Boolean);
  const expectedWords = expected.split(" ").filter(Boolean);
  if (expectedWords.length === 0) return 0;

  let matched = 0;
  for (const expectedWord of expectedWords) {
    const found = spokenWords.some((spokenWord) => {
      if (spokenWord === expectedWord) return true;
      const distance = levenshtein(spokenWord, expectedWord);
      const maxLen = Math.max(spokenWord.length, expectedWord.length);
      return maxLen > 0 && 1 - distance / maxLen >= 0.8;
    });
    if (found) matched += 1;
  }

  return matched / expectedWords.length;
}

export function evaluateSpanishAnswer(
  spoken: string,
  expected: string,
): { isCorrect: boolean; score: number } {
  const normalizedSpoken = normalizeSpanish(spoken);
  const normalizedExpected = normalizeSpanish(expected);

  if (!normalizedSpoken) {
    return { isCorrect: false, score: 0 };
  }

  if (normalizedSpoken === normalizedExpected) {
    return { isCorrect: true, score: 1 };
  }

  if (
    normalizedSpoken.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedSpoken)
  ) {
    return { isCorrect: true, score: 0.95 };
  }

  const distance = levenshtein(normalizedSpoken, normalizedExpected);
  const maxLen = Math.max(normalizedSpoken.length, normalizedExpected.length);
  const phraseSimilarity = maxLen > 0 ? 1 - distance / maxLen : 0;
  const wordSimilarity = wordMatchScore(normalizedSpoken, normalizedExpected);
  const score = Math.max(phraseSimilarity, wordSimilarity);
  const threshold = normalizedExpected.length <= 8 ? 0.72 : 0.82;

  return {
    isCorrect: score >= threshold,
    score,
  };
}
