import { z } from 'zod';

export const AttackRiskSchema = z.enum(['low', 'medium', 'high']);
export const ConfidenceLevelSchema = z.enum(['low', 'medium', 'high']);

export const AnalysisRequestSchema = z.object({
  claimText: z.string()
    .trim()
    .min(1, 'Claim is required')
    .max(500, 'Claim must not exceed 500 characters'),
  evidenceText: z.string()
    .trim()
    .min(1, 'Evidence is required')
    .max(8000, 'Evidence must not exceed 8000 characters'),
  sourceTitle: z.string().trim().max(200).optional().nullable(),
  authorName: z.string().trim().max(100).optional().nullable(),
  publicationName: z.string().trim().max(100).optional().nullable(),
  publishedAt: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().or(z.literal('')).nullable(),
  topicLabel: z.string().trim().max(50).optional().nullable(),
});

export const ScoreExplanationsSchema = z.object({
  source_credibility: z.string().trim().min(1),
  recency_fit: z.string().trim().min(1),
  specificity: z.string().trim().min(1),
  quote_integrity: z.string().trim().min(1),
  claim_fit: z.string().trim().min(1),
});

export const AnalysisModelOutputSchema = z.object({
  source_credibility: z.number().min(1).max(10),
  recency_fit: z.number().min(1).max(10),
  specificity: z.number().min(1).max(10),
  quote_integrity: z.number().min(1).max(10),
  claim_fit: z.number().min(1).max(10),
  attack_risk: AttackRiskSchema,
  confidence_level: ConfidenceLevelSchema,
  one_line_verdict: z.string().trim().min(1),
  strongest_attribute: z.string().trim().min(1),
  biggest_weakness: z.string().trim().min(1),
  suggested_tag: z.string().trim().min(1),
  suggested_best_use: z.string().trim().min(1),
  explanations: ScoreExplanationsSchema,
});
