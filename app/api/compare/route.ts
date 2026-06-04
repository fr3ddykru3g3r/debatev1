import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/supabase';
import { AnalysisRecord } from '@/types/analysis';

function chooseWinner(a: AnalysisRecord, b: AnalysisRecord): AnalysisRecord {
  const diff = Math.abs(a.overall_score - b.overall_score);
  if (diff > 0.3) {
    return a.overall_score > b.overall_score ? a : b;
  }
  if (a.claim_fit !== b.claim_fit) {
    return a.claim_fit > b.claim_fit ? a : b;
  }
  const riskWeights = { low: 3, medium: 2, high: 1 };
  if (riskWeights[a.attack_risk] !== riskWeights[b.attack_risk]) {
    return riskWeights[a.attack_risk] > riskWeights[b.attack_risk] ? a : b;
  }
  if (a.source_credibility !== b.source_credibility) {
    return a.source_credibility > b.source_credibility ? a : b;
  }
  return a;
}

function buildComparisonSummary(a: AnalysisRecord, b: AnalysisRecord, winner: AnalysisRecord): string {
  const loser = winner.id === a.id ? b : a;
  const reasons: string[] = [];
  
  // Debate-specific winner analysis
  if (winner.claim_fit > loser.claim_fit) {
    reasons.push(`provides a far tighter **claim-fit match**, offering a direct warrant for the proposed tag rather than forcing a logical leap or overclaim that opponents can indict`);
  }
  if (winner.source_credibility > loser.source_credibility) {
    reasons.push(`carries higher **source credibility**, leveraging qualified authors or rigorous peer-reviewed publishing standards that insulate your argument against author-qualification indicts`);
  }
  const winYear = winner.published_at ? new Date(winner.published_at).getFullYear() : 0;
  const loseYear = loser.published_at ? new Date(loser.published_at).getFullYear() : 0;
  if (winYear > loseYear && (winner.recency_fit > loser.recency_fit)) {
    reasons.push(`offers superior **recency alignment** (${winYear} vs ${loseYear}), making its warrants more resilient to post-date updates and time-frame arguments`);
  }
  if (winner.specificity > loser.specificity) {
    reasons.push(`contains higher **warrant specificity**, detailing explicit causal mechanisms and regional bounds rather than relying on abstract generalizations`);
  }
  if (winner.quote_integrity > loser.quote_integrity) {
    reasons.push(`preserves stronger **quote integrity**, reducing the risk of being called out for miscutting or taking quotes out of context during cross-examination`);
  }
  if (winner.attack_risk === 'low' && loser.attack_risk !== 'low') {
    reasons.push(`presents a significantly **safer attack profile**, leaving fewer vulnerable angles for your opponents to exploit (e.g. source bias, logical gaps, or stale post-dating)`);
  }

  // Fallback if identical
  if (reasons.length === 0) {
    reasons.push(`scores marginally higher across standard debate criteria (readiness: ${winner.overall_score} vs ${loser.overall_score})`);
  }

  const preferredConditions: string[] = [];
  if (loser.recency_fit > winner.recency_fit) {
    preferredConditions.push(`the round requires a **post-date advantage** to defeat an opponent's timeline arguments`);
  }
  if (loser.source_credibility > winner.source_credibility) {
    preferredConditions.push(`your judge panel heavily weights **institutional expertise** over the exactness of the tag-fit`);
  }
  if (loser.specificity > winner.specificity) {
    preferredConditions.push(`you require **micro-level evidence** or highly specific case examples to build a local link`);
  }
  if (loser.claim_fit > winner.claim_fit) {
    preferredConditions.push(`the debate pivots strictly on supporting a **narrower, localized contention** that Card B aligns with`);
  }

  const preferredTxt = preferredConditions.length > 0
    ? ` However, the alternative card (${loser.author_name || 'unnamed author'} ${getYear(loser)}) could still be preferred if ${preferredConditions.join(', or if ')}.`
    : ` The alternative card offers no significant advantages over the winning card across the rubric dimensions.`;

  return `Winner card (**${winner.author_name || 'unnamed author'} ${getYear(winner)}**) is preferred because it ${reasons.join(', and it ')}.${preferredTxt}`;
}

function getYear(record: AnalysisRecord): string {
  return record.published_at ? new Date(record.published_at).getFullYear().toString() : 'N/A';
}

export async function POST(req: NextRequest) {
  try {
    const { analysisAId, analysisBId } = await req.json();

    if (!analysisAId || !analysisBId) {
      return NextResponse.json({ error: 'Missing analysis ID(s) for comparison' }, { status: 400 });
    }

    const a = await db.getAnalysisById(analysisAId);
    const b = await db.getAnalysisById(analysisBId);

    if (!a || !b) {
      return NextResponse.json({ error: 'One or both analyses could not be found' }, { status: 404 });
    }

    const winner = chooseWinner(a, b);
    const summary = buildComparisonSummary(a, b, winner);

    // Save comparison
    const userId = req.headers.get('x-user-id') || null;
    const comparison = await db.createComparison({
      user_id: userId,
      analysis_a_id: a.id,
      analysis_b_id: b.id,
      winner_id: winner.id,
      comparison_summary: summary,
    });

    return NextResponse.json({
      comparison,
      analysisA: a,
      analysisB: b,
      winnerId: winner.id,
      summary,
    });

  } catch (error: any) {
    console.error('Error in POST /api/compare:', error);
    return NextResponse.json({ error: error.message || 'Comparison failed' }, { status: 500 });
  }
}
