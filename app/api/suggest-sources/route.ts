import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

const LOCAL_CLI_PATH = '/Users/Kyrosah/.gemini/config/plugins/science/skills/literature_search_openalex/scripts/openalex_cli.py';

interface OpenAlexWork {
  title: string;
  author: string;
  year: number;
  journal: string;
  url: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
    }

    const cleanQuery = query.trim().replace(/["']/g, '');
    let works: OpenAlexWork[] = [];

    // Path A: Check if local CLI is present in development workspace
    if (fs.existsSync(LOCAL_CLI_PATH)) {
      try {
        console.log(`OpenAlex local CLI detected. Running search command for: "${cleanQuery}"`);
        const tempOutputFile = path.join(process.cwd(), 'scratch', `openalex_${Date.now()}.json`);
        
        // Execute the CLI
        const cmd = `uv run ${LOCAL_CLI_PATH} filter works --search "${cleanQuery}" --per-page 3 > ${tempOutputFile}`;
        await execAsync(cmd);
        
        if (fs.existsSync(tempOutputFile)) {
          const rawData = fs.readFileSync(tempOutputFile, 'utf-8');
          const data = JSON.parse(rawData);
          
          if (data && data.results) {
            works = data.results.map((w: any) => {
              const authors = w.authorships?.map((a: any) => a.author?.display_name).filter(Boolean).slice(0, 3).join(', ') || 'Unknown Author';
              const journal = w.primary_location?.source?.display_name || w.host_venue?.name || 'Academic Journal';
              return {
                title: w.display_name || w.title || 'Untitled Research',
                author: authors,
                year: w.publication_year || new Date().getFullYear(),
                journal: journal,
                url: w.doi || w.ids?.doi || w.primary_location?.landing_page_url || `https://openalex.org/works/${w.id.split('/').pop()}`,
              };
            });
          }
          
          // Clean up temp file
          fs.unlinkSync(tempOutputFile);
        }
      } catch (err: any) {
        console.error('Local OpenAlex CLI execution error, falling back to direct API fetch:', err.message || err);
      }
    }

    // Path B: Fallback to direct fetch if CLI fails or if running on Vercel production
    if (works.length === 0) {
      console.log('Querying OpenAlex API directly via REST endpoint...');
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(cleanQuery)}&per_page=3`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'mailto:pilot@cutbase.app', // Polite pool contact
        }
      });
      
      if (!response.ok) {
        throw new Error(`OpenAlex API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data && data.results) {
        works = data.results.map((w: any) => {
          const authors = w.authorships?.map((a: any) => a.author?.display_name).filter(Boolean).slice(0, 3).join(', ') || 'Unknown Author';
          const journal = w.primary_location?.source?.display_name || 'Academic Journal';
          return {
            title: w.display_name || w.title || 'Untitled Research',
            author: authors,
            year: w.publication_year || new Date().getFullYear(),
            journal: journal,
            url: w.doi || w.ids?.doi || w.primary_location?.landing_page_url || `https://openalex.org/works/${w.id.split('/').pop()}`,
          };
        });
      }
    }

    return NextResponse.json(works);

  } catch (error: any) {
    console.error('Error in GET /api/suggest-sources:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve academic sources' }, { status: 500 });
  }
}
