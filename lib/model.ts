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
  const evidence = request.evidenceText.toLowerCase();

  if (claim.includes('carbon') || evidence.includes('oecd') || evidence.includes('carbon')) {
    return {
      source_credibility: 9.2,
      recency_fit: 9.5,
      specificity: 8.8,
      quote_integrity: 8.5,
      claim_fit: 8.0,
      attack_risk: 'low',
      confidence_level: 'high',
      one_line_verdict: 'Strong, highly credible source with highly specific empirical findings that support the core claim with minor caveats.',
      strongest_attribute: 'Source credibility',
      biggest_weakness: 'Claim fit',
      suggested_tag: 'Carbon border adjustments reduce carbon leakage risks in trade-exposed industrial sectors.',
      suggested_best_use: 'empirical support',
      explanations: {
        source_credibility: 'OECD is a top-tier global research institution providing highly objective macroeconomic analyses.',
        recency_fit: 'The evidence is from 2024, which represents up-to-date policy research matching the current timeline.',
        specificity: 'Explicitly names mechanisms (leakage risk) and target areas (emissions-intensive sectors).',
        quote_integrity: 'The excerpt is well-warranted and includes necessary context without misleading clips.',
        claim_fit: 'Directly supports the claim, although the source notes that impacts depend on specific sector designs.'
      }
    };
  }

  if (claim.includes('social media') || claim.includes('democracy') || evidence.includes('social-media') || evidence.includes('misinformation')) {
    return {
      source_credibility: 7.8,
      recency_fit: 8.5,
      specificity: 6.5,
      quote_integrity: 7.0,
      claim_fit: 4.5,
      attack_risk: 'high',
      confidence_level: 'medium',
      one_line_verdict: 'Decent source but the claim fit is weak. The tag overclaims the causal connection found in the evidence.',
      strongest_attribute: 'Source credibility',
      biggest_weakness: 'Claim fit',
      suggested_tag: 'Social media misinformation is associated with lower levels of trust in public institutions.',
      suggested_best_use: 'historical example',
      explanations: {
        source_credibility: 'Academic researchers provide solid credibility, though specific institutional backing is unnamed.',
        recency_fit: 'The research is recent enough, addressing modern platform dynamics.',
        specificity: 'The findings are relatively abstract, failing to detail specific platform mechanisms.',
        quote_integrity: 'The quote integrity is decent, but the tag dramatically overstates the warrant present.',
        claim_fit: 'The evidence only proves a correlation with "lower trust", not a causal relationship leading to "collapse".'
      }
    };
  }

  const hasYear = /\b(19|20)\d{2}\b/.test(request.evidenceText);
  const wordCount = request.evidenceText.split(/\s+/).length;
  const isShort = wordCount < 40;

  return {
    source_credibility: request.authorName ? 7.5 : 5.0,
    recency_fit: hasYear ? 8.0 : 4.0,
    specificity: isShort ? 4.5 : 7.0,
    quote_integrity: isShort ? 3.5 : 7.5,
    claim_fit: 6.0,
    attack_risk: isShort ? 'high' : 'medium',
    confidence_level: request.authorName && hasYear ? 'high' : 'medium',
    one_line_verdict: isShort 
      ? 'Under-warranted card. The text is too short to establish a reliable argument or citation context.'
      : 'Moderate quality evidence with a standard fit, requiring some qualifiers in the debate tag.',
    strongest_attribute: 'Specificity',
    biggest_weakness: isShort ? 'Quote integrity' : 'Recency fit',
    suggested_tag: request.claimText ? `Evidence indicates that ${request.claimText.replace(/^[Tt]his\s/, '')} in limited contexts.` : 'Suggested debate tag.',
    suggested_best_use: 'empirical support',
    explanations: {
      source_credibility: request.authorName 
        ? `Author ${request.authorName} is specified, providing a basic credibility reference.`
        : 'No author metadata was detected or provided, reducing verification authority.',
      recency_fit: hasYear
        ? 'Dating shows the evidence is contextually active.'
        : 'No year was found in the source citation, raising recency concerns.',
      specificity: isShort
        ? 'The evidence text is extremely short and lacks concrete mechanisms.'
        : 'The evidence details some causal pathways and specific findings.',
      quote_integrity: isShort
        ? 'Heavy clipping detected; the quote does not contain a full academic warrant.'
        : 'The quote is contiguous and contains sufficient context for analysis.',
      claim_fit: 'The evidence matches the general theme but fails to support a universal guarantee.'
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
    .replace('{evidenceText}', request.evidenceText)
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
