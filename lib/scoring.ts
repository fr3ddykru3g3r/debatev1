import { AttackRisk } from '@/types/analysis';

export interface ScoreWeights {
  sourceCredibility: number;
  claimFit: number;
  recencyFit: number;
  specificity: number;
  quoteIntegrity: number;
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  sourceCredibility: 0.25,
  claimFit: 0.30,
  recencyFit: 0.15,
  specificity: 0.15,
  quoteIntegrity: 0.15,
};

export function computeOverallScore(
  scores: {
    source_credibility: number;
    claim_fit: number;
    recency_fit: number;
    specificity: number;
    quote_integrity: number;
  },
  attackRisk: AttackRisk,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  // Normalize each score just in case they exceed bounds (1-10 range)
  const cred = Math.min(10, Math.max(1, scores.source_credibility));
  const fit = Math.min(10, Math.max(1, scores.claim_fit));
  const rec = Math.min(10, Math.max(1, scores.recency_fit));
  const spec = Math.min(10, Math.max(1, scores.specificity));
  const qi = Math.min(10, Math.max(1, scores.quote_integrity));

  // Compute weighted base score
  let overall = 
    cred * weights.sourceCredibility +
    fit * weights.claimFit +
    rec * weights.recencyFit +
    spec * weights.specificity +
    qi * weights.quoteIntegrity;

  // Apply attack risk penalty
  if (attackRisk === 'high') {
    overall -= 1.0;
  } else if (attackRisk === 'medium') {
    overall -= 0.4;
  }

  // Clamp final overall score to [1.0, 10.0] and round to 1 decimal place
  const rounded = Math.round(Math.min(10.0, Math.max(1.0, overall)) * 10) / 10;
  return rounded;
}
