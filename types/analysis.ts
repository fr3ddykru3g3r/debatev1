export type AttackRisk = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface AnalysisRequest {
  claimText: string;
  evidenceText?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  authorName?: string;
  publicationName?: string;
  publishedAt?: string; // YYYY-MM-DD format
  topicLabel?: string;
}

export interface ScoreExplanations {
  source_credibility: string;
  recency_fit: string;
  specificity: string;
  quote_integrity: string;
  claim_fit: string;
}

export interface AnalysisModelOutput {
  source_credibility: number; // 1-10 (original or raw)
  recency_fit: number;
  specificity: number;
  quote_integrity: number;
  claim_fit: number;
  attack_risk: AttackRisk;
  confidence_level: ConfidenceLevel;
  one_line_verdict: string;
  strongest_attribute: string;
  biggest_weakness: string;
  suggested_tag: string;
  suggested_best_use: string;
  explanations: ScoreExplanations;
}

export interface AnalysisRecord {
  id: string;
  user_id: string | null;
  claim_text: string;
  evidence_text: string | null;
  source_url: string | null;
  source_title: string | null;
  author_name: string | null;
  publication_name: string | null;
  published_at: string | null;
  topic_label: string | null;
  
  // Normalized scores (1-10)
  source_credibility: number;
  recency_fit: number;
  specificity: number;
  quote_integrity: number;
  claim_fit: number;
  attack_risk: AttackRisk;
  overall_score: number;
  confidence_level: ConfidenceLevel;
  
  one_line_verdict: string;
  strongest_attribute: string;
  biggest_weakness: string;
  suggested_tag: string;
  suggested_best_use: string;
  explanations: ScoreExplanations;
  raw_model_output: any;
  flagged?: boolean;
  flagged_reason?: string | null;
  tag_copied?: boolean;
  created_at: string;
}

export interface ComparisonRecord {
  id: string;
  user_id: string | null;
  analysis_a_id: string;
  analysis_b_id: string;
  winner_id: string;
  comparison_summary: string;
  created_at: string;
}
