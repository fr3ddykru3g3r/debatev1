import { NextRequest, NextResponse } from 'next/server';
import { AnalysisRequestSchema } from '@/lib/validation';
import { extractSourceHints } from '@/lib/parser';
import { callModel } from '@/lib/model';
import { computeOverallScore } from '@/lib/scoring';
import { db } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request
    const validated = AnalysisRequestSchema.parse(body);

    // Extract hints using citation parser
    const hints = extractSourceHints(validated.evidenceText);

    // Prefer user input, fall back to parsed hints
    const sourceTitle = validated.sourceTitle || hints.title || null;
    const authorName = validated.authorName || hints.author || null;
    const publicationName = validated.publicationName || hints.publication || null;
    const publishedAt = validated.publishedAt || (hints.year ? `${hints.year}-01-01` : null);
    const topicLabel = validated.topicLabel || null;

    // Build the request payload for the model, attaching any resolved hints
    const modelPayload = {
      claimText: validated.claimText,
      evidenceText: hints.cleanEvidenceText,
      sourceTitle: sourceTitle || undefined,
      authorName: authorName || undefined,
      publicationName: publicationName || undefined,
      publishedAt: publishedAt || undefined,
      topicLabel: topicLabel || undefined,
    };

    // Call the model (with retry/validation handling inside)
    const modelOutput = await callModel(modelPayload);

    // Compute final overall weighted score
    const overallScore = computeOverallScore(
      {
        source_credibility: modelOutput.source_credibility,
        claim_fit: modelOutput.claim_fit,
        recency_fit: modelOutput.recency_fit,
        specificity: modelOutput.specificity,
        quote_integrity: modelOutput.quote_integrity,
      },
      modelOutput.attack_risk
    );

    // Anonymous User ID from body/headers
    const userId = req.headers.get('x-user-id') || body.userId || null;

    // Save record to DB
    const record = await db.createAnalysis({
      user_id: userId,
      claim_text: validated.claimText,
      evidence_text: validated.evidenceText,
      source_title: sourceTitle,
      author_name: authorName,
      publication_name: publicationName,
      published_at: publishedAt,
      topic_label: topicLabel,
      
      source_credibility: modelOutput.source_credibility,
      recency_fit: modelOutput.recency_fit,
      specificity: modelOutput.specificity,
      quote_integrity: modelOutput.quote_integrity,
      claim_fit: modelOutput.claim_fit,
      attack_risk: modelOutput.attack_risk,
      overall_score: overallScore,
      confidence_level: modelOutput.confidence_level,
      
      one_line_verdict: modelOutput.one_line_verdict,
      strongest_attribute: modelOutput.strongest_attribute,
      biggest_weakness: modelOutput.biggest_weakness,
      suggested_tag: modelOutput.suggested_tag,
      suggested_best_use: modelOutput.suggested_best_use,
      explanations: modelOutput.explanations,
      raw_model_output: modelOutput,
    });

    return NextResponse.json(record);

  } catch (error: any) {
    console.error('Error in POST /api/analyze:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'An error occurred during analysis' }, { status: 500 });
  }
}
