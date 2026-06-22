# Chrome Web Store Listing — CutBase Clipper

> Last Updated: 2026-06-22

## Store Listing

**Extension Name**  
CutBase Clipper

**Short Description**  
Evaluate debate evidence quality, scrape citations, and copy Verbatim formatted cards directly from your browser.

**Detailed Description**  
CutBase Clipper is an AI-powered design-focused utility built for competitive debate preparation. Analyze policy, Lincoln-Douglas, and Public Forum evidence against any target claim in real-time. 

With one click of the extension action icon, CutBase Clipper scrapes the active webpage's text content, removes non-essential headers, sidebars, and footer scripts, heuristic-identifies author publication years, and runs a structured 5-dimension rubric evaluation (Source Credibility, Claim Fit, Recency, Specificity, and Quote Integrity).

Key Features:
- Automatic Web Evaluation: Instant scraping and argument fit scoring for NYT, Brookings, OECD, and academic articles.
- Debate Tag Repair: Displays a suggested, safe, and qualified debate claim tag that is less vulnerable to opponents' attacks.
- Verbatim Copying: Copy evaluated cards in styled HTML rich-text directly into Microsoft Word preserving debate standards (bold tags, small citations, and serif body text).
- Skeptical Bias Modifiers: Automatically applies Readiness penalties for medium and high attack risks.

How to Use:
1. Navigate to any news page, academic research article, or think-tank document.
2. Click the CutBase Clipper extension icon to open the Side Panel. The page is automatically scraped and analyzed.
3. Review scores and repair recommendations. Click "Copy Verbatim" to paste directly into your debate document.
4. Or, select any paragraph, right-click, and select "Evaluate selection with CutBase" to isolate specific evidence warrants.

**Category**  
Productivity

**Single Purpose**  
Analyze webpage content to score debate argument fit and export formatted evidence cards.

**Primary Language**  
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon | 128×128 PNG | ⬜ Not created | Omitted (uses Chrome default) |
| Screenshot 1 | 1280×800 or 640×400 | ⬜ Not created | `docs/screenshots/clip-1.png` |
| Screenshot 2 | 1280×800 or 640×400 | ⬜ Not created | `docs/screenshots/clip-2.png` |

---

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `sidePanel` | permissions | Required to host the glassmorphic analysis dashboard alongside the user's research tab. |
| `contextMenus` | permissions | Required to register the right-click "Evaluate selection with CutBase" context option. |
| `scripting` | permissions | Required to execute safe text extraction scripts on the active tab DOM content. |
| `tabs` | permissions | Required to read the current tab URL and title to pre-fill citation dates and default claims. |
| `activeTab` | permissions | Required to grant temporary script execution rights to scrape the active page on user click. |
| `https://*/*` | host_permissions | Required to send POST analyze payloads to Vercel/localhost backend servers. |
| `http://*/*` | host_permissions | Required to allow debugging on localhost server ports. |

---

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| User activity | Yes | Yes (to target server) | Evaluating claim-evidence metrics. | No |
| Website content | Yes | Yes (to target server) | Extracted text is sent to the LLM analyzer. | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Privacy Policy
Please refer to [https://serene-hypatia.vercel.app/privacy](https://serene-hypatia.vercel.app/privacy) for detailed policies. No raw scraped article text is logged permanently by CutBase default servers.

---

## Distribution
**Visibility**: Public  
**Regions**: All regions  
**Pricing**: Free

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-22 | Initial packaging of Manifest V3 clipper side panel with auto-scraping and right-click menus. | Draft |
