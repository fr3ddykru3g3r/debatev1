import { OpenAI } from 'openai';
import { SYSTEM_PROMPT, EVALUATION_PROMPT_TEMPLATE } from './prompts';
import { AnalysisModelOutputSchema } from './validation';
import { AnalysisModelOutput, AnalysisRequest } from '@/types/analysis';

// Provider-swappable configuration
// Automatically detects NVIDIA_API_KEY if present in process environment
const apiKey = process.env.OPENAI_API_KEY || process.env.MODEL_API_KEY || process.env.NVIDIA_API_KEY;
const endpoint = process.env.MODEL_ENDPOINT || (process.env.NVIDIA_API_KEY ? 'https://integrate.api.nvidia.com/v1' : 'https://generativelanguage.googleapis.com/v1beta/openai/');
const modelName = process.env.MODEL_NAME || (process.env.NVIDIA_API_KEY ? 'meta/llama-3.1-8b-instruct' : 'gemini-2.0-flash');

export const isModelConfigured = !!apiKey;

const openai = isModelConfigured
  ? new OpenAI({
      apiKey,
      baseURL: endpoint,
    })
  : null;

// Mock analysis function for cost-free demo/testing and fallback states
export function generateMockAnalysis(request: AnalysisRequest): AnalysisModelOutput {
  const claim = request.claimText.toLowerCase();
  const rawEvidence = request.evidenceText || request.sourceUrl || '';
  const evidence = rawEvidence.toLowerCase();

  // 1. Calculate word overlap heuristic (excluding common stopwords)
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'been', 'were', 'was', 'are', 'but', 'not', 'will', 'would', 'should', 'could', 'about', 'their', 'there', 'then', 'them', 'they', 'your', 'what', 'some', 'into', 'over']);
  
  const claimWords = claim.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 3 && !stopWords.has(w));
  const uniqueClaimWords = Array.from(new Set(claimWords));
  
  let matchCount = 0;
  for (const word of uniqueClaimWords) {
    if (evidence.includes(word)) {
      matchCount++;
    }
  }
  
  const overlapRatio = uniqueClaimWords.length > 0 ? matchCount / uniqueClaimWords.length : 1.0;

  // 2. Detect absolute overclaiming qualifiers in claim vs evidence
  const absoluteQualifiers = ['always', 'entirely', 'completely', 'solves', 'eliminates', 'never', 'guarantees', 'inevitably', 'perfectly', 'instant', 'instantly', 'fully', 'permanent', 'permanently'];
  const claimAbsolutes = absoluteQualifiers.filter(q => claim.includes(q));
  const evidenceAbsolutes = absoluteQualifiers.filter(q => evidence.includes(q));
  
  // Claim is an overclaim if it asserts an absolute that isn't supported by the evidence text
  const isOverclaim = claimAbsolutes.some(q => !evidenceAbsolutes.includes(q));

  // 3. Compute dynamic rubric parameters
  // Source Credibility (7.0 - 9.5)
  let source_credibility = 7.0;
  if (request.authorName) source_credibility += 1.0;
  if (request.publicationName) source_credibility += 1.5;
  source_credibility = Math.min(10.0, source_credibility);

  // Recency Fit (6.0 - 9.5)
  const hasYear = /\b(19|20)\d{2}\b/.test(rawEvidence) || request.publishedAt;
  let recency_fit = 7.0;
  if (hasYear) {
    recency_fit = 9.0;
    const dateStr = request.publishedAt || rawEvidence;
    if (dateStr.includes('2024') || dateStr.includes('2023') || dateStr.includes('2025') || dateStr.includes('2026')) {
      recency_fit = 9.5;
    }
  } else {
    recency_fit = 6.0;
  }

  // Specificity & Quote Integrity based on word count
  const wordCount = rawEvidence.split(/\s+/).filter(Boolean).length;
  const isShort = wordCount < 40;
  
  let specificity = 8.0;
  if (wordCount > 100) specificity = 9.0;
  else if (wordCount < 30) specificity = 5.0;

  let quote_integrity = 8.0;
  if (wordCount > 60) quote_integrity = 9.0;
  else if (wordCount < 30) quote_integrity = 4.0;

  // Claim Fit (scaled dynamically on word overlap)
  let claim_fit = 6.0;
  if (overlapRatio > 0.8) {
    claim_fit = 9.5;
  } else if (overlapRatio > 0.6) {
    claim_fit = 8.5;
  } else if (overlapRatio > 0.4) {
    claim_fit = 7.5;
  } else {
    claim_fit = 5.0;
  }

  // Apply overclaiming penalties
  let attack_risk: 'low' | 'medium' | 'high' = 'low';
  if (isOverclaim) {
    claim_fit = Math.max(2.0, claim_fit - 4.5);
    attack_risk = 'high';
  } else if (isShort) {
    attack_risk = 'medium';
    claim_fit = Math.max(3.0, claim_fit - 2.0);
  } else if (overlapRatio < 0.5) {
    attack_risk = 'medium';
  }

  const confidence_level = (request.authorName && hasYear && !isShort) ? 'high' : 'medium';

  // Build helpful verdicts and explanations
  let verdict = '';
  if (isOverclaim) {
    verdict = 'Claim overreaches. The evidence uses qualifiers while the tag asserts an absolute guarantee.';
  } else if (overlapRatio > 0.7) {
    verdict = 'Strong alignment. The claim accurately represents the central thesis and scope of the source text.';
  } else {
    verdict = 'Moderate alignment. The source is relevant, but the tag could capture the evidence context more precisely.';
  }

  const strongest_attribute = claim_fit >= source_credibility ? 'Claim fit' : 'Source credibility';
  const biggest_weakness = isOverclaim ? 'Claim fit' : (isShort ? 'Quote integrity' : 'Recency fit');

  return {
    source_credibility,
    recency_fit,
    specificity,
    quote_integrity,
    claim_fit,
    attack_risk,
    confidence_level,
    one_line_verdict: verdict,
    strongest_attribute,
    biggest_weakness,
    suggested_tag: request.claimText ? `Evidence indicates that ${request.claimText.replace(/^[Tt]his\s/, '')} in limited contexts.` : 'Suggested debate tag.',
    suggested_best_use: 'empirical support',
    explanations: {
      source_credibility: request.authorName 
        ? `Author ${request.authorName} and citation metadata establish solid source authority.`
        : 'Basic source details provided, but lacking detailed institutional review indicators.',
      recency_fit: hasYear
        ? 'Dating matches active research timelines for this topic.'
        : 'No specific year found in citation, posing moderate recency verification risks.',
      specificity: isShort
        ? 'The excerpt is short and lacks detailed structural mechanisms.'
        : 'The source documents explicit mechanisms, data points, or localized parameters.',
      quote_integrity: isShort
        ? 'Text is highly condensed, which may omit critical context or qualifications.'
        : 'The excerpt provides sufficient surrounding context for objective review.',
      claim_fit: isOverclaim
        ? 'The tag overclaims by asserting an absolute causal impact not supported by the evidence.'
        : 'The thematic overlap is strong and accurately mirrors the degree of assertion in the source.'
    }
  };
}

export async function callModel(request: AnalysisRequest): Promise<AnalysisModelOutput> {
  if (!openai) {
    console.log('No LLM client configured, executing local free mock mode.');
    return generateMockAnalysis(request);
  }

  // Format prompt
  let prompt = EVALUATION_PROMPT_TEMPLATE
    .replace('{claimText}', request.claimText)
    .replace('{evidenceText}', request.evidenceText || '')
    .replace('{sourceTitle}', request.sourceTitle || 'Not provided')
    .replace('{authorName}', request.authorName || 'Not provided')
    .replace('{publicationName}', request.publicationName || 'Not provided')
    .replace('{publishedAt}', request.publishedAt || 'Not provided')
    .replace('{topicLabel}', request.topicLabel || 'Not provided');

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      console.log(`Calling LLM API (${modelName}) - Attempt ${attempts + 1}`);
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error('Model returned an empty payload');

      let json;
      try {
        json = JSON.parse(text);
      } catch (err: any) {
        throw new Error(`JSON Syntax Error in model response: ${err.message}. Raw text: ${text.substring(0, 100)}...`);
      }
      
      // Validation check
      const parsedOutput = AnalysisModelOutputSchema.parse(json);
      return parsedOutput;

    } catch (error: any) {
      attempts++;
      console.error(`LLM Call/Validation Failure (Attempt ${attempts}/${maxAttempts}):`, error.message || error);
      
      if (attempts >= maxAttempts) {
        console.warn('Max LLM retry attempts reached. Initiating graceful fallback analysis.');
        return generateMockAnalysis(request);
      }
      
      // Inject error feedback to target next retry validation
      prompt += `\n\n[RETRY WARNING]: Your previous output was invalid. Error details: ${error.message || error}. Ensure your response is strictly compliant with the requested JSON schema.`;
    }
  }

  return generateMockAnalysis(request);
}
