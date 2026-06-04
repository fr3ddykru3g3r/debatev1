import { callModel } from '../lib/model';
import { computeOverallScore } from '../lib/scoring';
import { SEED_DEBATE_DATASET } from '../lib/seedData';
import { extractSourceHints } from '../lib/parser';

async function runEvaluation() {
  console.log('========================================================');
  console.log('            CUTBASE SYSTEMATIC QA EVALUATION            ');
  console.log('========================================================');
  
  // Select one of each archetype to run a clean representative suite
  const testSuite = SEED_DEBATE_DATASET.slice(0, 6);

  for (const card of testSuite) {
    console.log(`\nTesting Category: [${card.category.toUpperCase()}]`);
    console.log(`Claim: "${card.claimText}"`);
    console.log(`Notes: ${card.notes}`);
    
    try {
      const hints = extractSourceHints(card.evidenceText);
      const payload = {
        claimText: card.claimText,
        evidenceText: hints.cleanEvidenceText,
        sourceTitle: card.sourceTitle || hints.title || undefined,
        authorName: card.authorName || hints.author || undefined,
        publicationName: card.publicationName || hints.publication || undefined,
        publishedAt: card.publishedAt || (hints.year ? `${hints.year}-01-01` : undefined),
        topicLabel: card.topicLabel || undefined,
      };

      const result = await callModel(payload);
      const overall = computeOverallScore(
        {
          source_credibility: result.source_credibility,
          claim_fit: result.claim_fit,
          recency_fit: result.recency_fit,
          specificity: result.specificity,
          quote_integrity: result.quote_integrity,
        },
        result.attack_risk
      );

      console.log('--------------------------------------------------------');
      console.log(`- Overall Readiness Score: ${overall}/10`);
      console.log(`- Subscores: Cred:${result.source_credibility} | Fit:${result.claim_fit} | Rec:${result.recency_fit} | Spec:${result.specificity} | Qi:${result.quote_integrity}`);
      console.log(`- Attack Risk: ${result.attack_risk.toUpperCase()} | Confidence: ${result.confidence_level.toUpperCase()}`);
      console.log(`- Verdict: "${result.one_line_verdict}"`);
      console.log(`- Strongest: ${result.strongest_attribute} | Weakest: ${result.biggest_weakness}`);
      console.log(`- Suggested Tag: "${result.suggested_tag}"`);
      console.log('========================================================');

    } catch (err: any) {
      console.error(`FAILED evaluation for seed card ${card.id}:`, err.message || err);
    }
  }
}

runEvaluation();
