import { callModel } from '../lib/model';
import { computeOverallScore } from '../lib/scoring';
import { SEED_DEBATE_DATASET } from '../lib/seedData';
import { extractSourceHints } from '../lib/parser';
import * as fs from 'fs';
import * as path from 'path';

async function runFullEvaluation() {
  console.log('Starting full 20-card evaluation sweep...');
  
  let mdTable = '# CutBase Seed Evaluation Results\n\n';
  mdTable += '| Card ID | Category | Claim/Tag | Cred | Fit | Rec | Spec | Qi | Risk | Overall | Verdict |\n';
  mdTable += '| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |\n';

  for (const card of SEED_DEBATE_DATASET) {
    console.log(`Evaluating ${card.id}...`);
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

      const shortClaim = card.claimText.length > 50 ? `${card.claimText.substring(0, 47)}...` : card.claimText;
      const shortVerdict = result.one_line_verdict.length > 60 ? `${result.one_line_verdict.substring(0, 57)}...` : result.one_line_verdict;

      mdTable += `| ${card.id} | ${card.category} | ${shortClaim} | ${result.source_credibility} | ${result.claim_fit} | ${result.recency_fit} | ${result.specificity} | ${result.quote_integrity} | ${result.attack_risk.toUpperCase()} | **${overall.toFixed(1)}** | ${shortVerdict} |\n`;

    } catch (err: any) {
      console.error(`Error on ${card.id}:`, err.message);
      mdTable += `| ${card.id} | ${card.category} | ERROR | - | - | - | - | - | - | - | ${err.message} |\n`;
    }
  }

  const outputPath = path.join(__dirname, 'seed_evaluation_results.md');
  fs.writeFileSync(outputPath, mdTable);
  console.log(`Full evaluation results written to ${outputPath}`);
}

runFullEvaluation();
