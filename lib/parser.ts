interface ParsedSourceHints {
  author?: string;
  year?: string;
  publication?: string;
  title?: string;
  isFormalCard: boolean;
  cleanEvidenceText: string;
}

export function extractSourceHints(evidenceText: string): ParsedSourceHints {
  const lines = evidenceText.split('\n').map(l => l.trim()).filter(Boolean);
  
  let author: string | undefined;
  let year: string | undefined;
  let publication: string | undefined;
  let title: string | undefined;
  let isFormalCard = false;
  
  // 1. Look for year in the entire text (typically a 4-digit number starting with 19 or 20)
  const yearRegex = /\b((?:19|20)\d{2})\b/;
  const yearMatch = evidenceText.match(yearRegex);
  if (yearMatch) {
    year = yearMatch[1];
  }

  // 2. Try to separate citation header from main body
  // Debaters often paste cards in the format: Author Year (or Author 'Year) \n Title / Publication \n [Evidence Body]
  // Let's assume the first 1 to 2 lines might be the header if they are short and followed by the rest
  let headerLines: string[] = [];
  let bodyLines = [...lines];

  if (lines.length > 1) {
    // If the first line is relatively short (e.g. under 150 chars) or contains a year
    const firstLine = lines[0];
    const isFirstLineHeader = firstLine.length < 150 || yearRegex.test(firstLine);
    
    if (isFirstLineHeader) {
      headerLines.push(lines[0]);
      bodyLines.shift();
      
      // Check if second line is also part of header
      if (lines.length > 2 && lines[1].length < 150 && !lines[1].toLowerCase().includes(' the ')) {
        headerLines.push(lines[1]);
        bodyLines.shift();
      }
    }
  }

  const headerText = headerLines.join(' ');
  const cleanEvidenceText = bodyLines.join('\n');

  if (headerText) {
    isFormalCard = true;

    // Try to extract author: usually first word(s) or names before the year
    // e.g. "Smith 24" or "Krugman, 2020" or "National Academy of Sciences, 2021"
    const authorRegex = /^([A-Z][a-zA-Z\s]+)(?:,|\s|\b)/;
    const authorMatch = headerText.match(authorRegex);
    if (authorMatch) {
      author = authorMatch[1].trim();
    }

    // Try to find publication/title hints
    // Often separated by separators like " - ", " | ", ",", "published in"
    const separators = /[\-\–\|]|,|\b(published in|in|at)\b/i;
    const parts = headerText.split(separators).map(p => p?.trim()).filter(Boolean);
    
    if (parts.length > 1) {
      // If we found multiple parts, assign title/publication
      title = parts[1];
      if (parts.length > 2) {
        publication = parts[2];
      }
    }
  }

  return {
    author: author || undefined,
    year: year || undefined,
    publication: publication || undefined,
    title: title || undefined,
    isFormalCard,
    cleanEvidenceText: cleanEvidenceText || evidenceText,
  };
}

export function cleanHtmlToText(html: string): string {
  // Replace script and style tags and their contents
  let text = html.replace(/<(script|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '');
  // Replace all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  // Normalize whitespaces
  text = text.replace(/\s+/g, ' ').trim();
  // Limit to 8000 characters
  return text.substring(0, 8000);
}

export async function fetchUrlText(url: string): Promise<{ text: string; title?: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch web page: ${response.statusText} (${response.status})`);
  }

  const html = await response.text();
  
  // Try to parse the title
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : undefined;

  const text = cleanHtmlToText(html);
  return { text, title };
}

