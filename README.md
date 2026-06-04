# CutBase

CutBase is a production-quality argument-quality engine for competitive debate evidence. It evaluates whether pasted evidence actually supports a debate tag/claim, scoring the card across five critical debate-pedagogy dimensions.

---

## Features

1. **Structured Rubric Scoring**: Scores cards 1-10 on Source Credibility, Claim Fit, Recency Fit, Specificity, and Quote Integrity.
2. **Defensive Model Integrity**: Strict Zod validations on JSON structured outputs with automatic retry handles.
3. **Double Mock-Fallback Support**:
   - Runs locally without Supabase keys (falls back to in-memory PG mock database client).
   - Runs locally without LLM keys (falls back to a cost-free mock analysis generator that evaluates input shapes).
4. **Side-by-Side Comparison**: Load two cards and run deterministic winner logic based on primary scoring and tie-breaker guidelines.
5. **Debate-Native UI**: Serious, left-aligned, clean dark-mode research tool aesthetic.

---

## Setup & Local Run

### 1. Installation

Install all required NPM packages:
```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` (or `.env.local` for Next.js):
```bash
cp .env.example .env.local
```

Configure your variables:
- **Google AI Studio (Gemini)**: Default setting. Map `OPENAI_API_KEY` to your AI Studio key.
- **Supabase credentials**: (Optional) Populate to persist database logs. If left blank, local memory handles saving/history logs.

### 3. Run Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Configuration (Supabase)

If utilizing a live Supabase project, execute the definitions located in [`sql/schema.sql`](file:///Users/Kyrosah/Documents/antigravity/serene-hypatia/sql/schema.sql) in your Supabase SQL editor:
1. Enables anonymous sign-in in your Supabase project (authentication configuration).
2. Sets up `users`, `analyses`, and `comparisons` schemas.

---

## Scoring Logic Formula

The final overall readiness score is computed as:
$$\text{Base Score} = 0.25 \times \text{Credibility} + 0.30 \times \text{Claim Fit} + 0.15 \times \text{Recency} + 0.15 \times \text{Specificity} + 0.15 \times \text{Quote Integrity}$$

Then, the following penalty subtraction is applied based on opponent vulnerability risk:
- **High Risk**: Overall score is reduced by `1.0`.
- **Medium Risk**: Overall score is reduced by `0.4`.
- **Low Risk**: Overall score is unchanged.

The final score is clamped between `1.0` (minimum) and `10.0` (maximum).

---

## Seed Test Input Matrix

For offline testing or verifying the app behaves properly, try pasting the following examples into the Analyzer form:

### Sample 1: High Credibility & Fit
*   **Claim/Tag**: `Carbon border adjustments reduce carbon leakage in the medium term.`
*   **Evidence Text**: `A 2024 OECD analysis finds that carbon border mechanisms can reduce leakage risk in emissions-intensive trade-exposed sectors, though effects vary by sector design and partner responses.`
*   **Expected Results**: High credibility, high recency, high claim fit. Low attack risk.

### Sample 2: Overclaim Vulnerability (Low Claim Fit)
*   **Claim/Tag**: `Social media causes democratic collapse.`
*   **Evidence Text**: `Researchers find an association between social-media misinformation exposure and lower trust in public institutions across several surveyed democracies.`
*   **Expected Results**: Decent credibility, weak claim fit, high attack risk. Verdict notes causal overclaim.

### Sample 3: Outdated & Insufficient warrant
*   **Claim/Tag**: `This policy immediately solves grid instability.`
*   **Evidence Text**: `A 2019 think tank report suggests battery deployments can improve resilience under some peak-demand conditions.`
*   **Expected Results**: Medium credibility, weak recency, low claim fit, high attack risk.

---

## Product Scope Rules

### In Scope
- Claims & evidence evaluations.
- Metadata hints parsing.
- Double mock fallbacks.
- Side-by-side card compare.
- Anonymous auth tracking.

### Out of Scope (Skipped)
- Multi-user collaboration workspace directories.
- Automated speech or case layout generation.
- Paid payment subscriptions.
- Browser extensions.
