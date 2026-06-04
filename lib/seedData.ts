import { AnalysisRequest } from '@/types/analysis';

export interface SeedCard extends AnalysisRequest {
  id: string;
  category: 'strong-narrow' | 'overclaim' | 'old-defensible' | 'great-source-bad-fit' | 'no-metadata' | 'clipped-quote' | 'standard';
  notes?: string;
}

export const SEED_DEBATE_DATASET: SeedCard[] = [
  {
    id: 'seed-1',
    category: 'strong-narrow',
    notes: 'Case A: Strong recent expert source, narrow claim.',
    claimText: 'Carbon border adjustments reduce carbon leakage in the medium term.',
    evidenceText: 'A 2024 OECD analysis finds that carbon border mechanisms can reduce leakage risk in emissions-intensive trade-exposed sectors, though effects vary by sector design and partner responses.',
    authorName: 'OECD Secretariat',
    publishedAt: '2024-03-15',
    publicationName: 'OECD Publishing',
    sourceTitle: 'Carbon Border Leakage Report',
    topicLabel: 'Economics'
  },
  {
    id: 'seed-2',
    category: 'overclaim',
    notes: 'Case B: Broad claim / narrow evidence mismatch.',
    claimText: 'Social media causes democratic collapse.',
    evidenceText: 'Researchers find an association between social-media misinformation exposure and lower trust in public institutions across several surveyed democracies.',
    authorName: 'Stanford Research Group',
    publishedAt: '2023-09-10',
    publicationName: 'Journal of Communication',
    sourceTitle: 'Media and Public Trust Index',
    topicLabel: 'Politics'
  },
  {
    id: 'seed-3',
    category: 'old-defensible',
    notes: 'Case C: Fast-moving topic / old evidence but stable theory.',
    claimText: 'Offensive realism dictates that states inevitably seek regional hegemony.',
    evidenceText: 'In his seminal 2001 theory of offensive realism, John Mearsheimer argues that the anarchic structure of the international system forces great powers to maximize their relative power and seek hegemony as the only secure state posture.',
    authorName: 'John Mearsheimer',
    publishedAt: '2001-10-01',
    publicationName: 'Norton Publishers',
    sourceTitle: 'The Tragedy of Great Power Politics',
    topicLabel: 'IR Theory'
  },
  {
    id: 'seed-4',
    category: 'great-source-bad-fit',
    notes: 'Case D: Excellent credibility source, but bad claim fit.',
    claimText: 'Artificial intelligence immediately solves the nursing shortage.',
    evidenceText: 'A 2024 World Health Organization report notes that AI tools can help triage nursing shifts and automate scheduling administration, though direct nursing labor shortages are projected to persist.',
    authorName: 'World Health Organization',
    publishedAt: '2024-02-18',
    publicationName: 'WHO Press',
    sourceTitle: 'Global Health Workforce Strategy',
    topicLabel: 'Healthcare'
  },
  {
    id: 'seed-5',
    category: 'no-metadata',
    notes: 'Case E: Missing metadata but okay quote.',
    claimText: 'Nuclear deterrence stabilizes competitive border regions.',
    evidenceText: 'Strategic nuclear arsenals deter high-intensity state conflicts by imposing unacceptable retaliatory costs on attackers, neutralizing minor borders clashes.',
    topicLabel: 'Defense Policy'
  },
  {
    id: 'seed-6',
    category: 'clipped-quote',
    notes: 'Case F: Clipped quote / apparent overclaim.',
    claimText: 'Solar power entirely replaces natural gas backup grid capacity.',
    evidenceText: 'Solar panels generate surplus grid capacity [when peak sun conditions align].',
    authorName: 'Energy News Brief',
    publishedAt: '2022-05-12',
    topicLabel: 'Energy'
  },
  {
    id: 'seed-7',
    category: 'strong-narrow',
    claimText: 'Direct cash transfers reduce absolute poverty indicators.',
    evidenceText: 'A randomized control trial of basic income grants in 2024 shows a 25% reduction in absolute poverty indicators across rural target areas.',
    authorName: 'Banerjee et al.',
    publishedAt: '2024-01-20',
    publicationName: 'MIT Press',
    sourceTitle: 'Universal Basic Income Trials',
    topicLabel: 'Development Economics'
  },
  {
    id: 'seed-8',
    category: 'overclaim',
    claimText: 'Genetically modified crops solve global malnutrition by 2030.',
    evidenceText: 'Introduction of GM drought-resistant seeds improved crop yields by 12% in regional pilot sites, providing a tool to mitigate localized food security pressures.',
    authorName: 'Borlaug Foundation',
    publishedAt: '2023-04-14',
    publicationName: 'Agronomy Journal',
    sourceTitle: 'Yield Enhancements in Arid Regions',
    topicLabel: 'Agriculture'
  },
  {
    id: 'seed-9',
    category: 'old-defensible',
    claimText: 'Democratic peace theory prevents direct interstate wars.',
    evidenceText: 'Michael Doyle\'s 1983 study argues that liberal democratic states exhibit a strong pacifist union among themselves, which prevents them from engaging in direct armed conflict against one another.',
    authorName: 'Michael Doyle',
    publishedAt: '1983-06-15',
    publicationName: 'Philosophy & Public Affairs',
    sourceTitle: 'Kant and Liberal Legacies',
    topicLabel: 'IR Theory'
  },
  {
    id: 'seed-10',
    category: 'great-source-bad-fit',
    claimText: 'Cryptocurrency fully replaces central banking monetary operations.',
    evidenceText: 'A 2024 Federal Reserve whitepaper analyzes how decentralized ledger technologies can improve interbank transaction settlements and reduce clearing latency.',
    authorName: 'Federal Reserve Board',
    publishedAt: '2024-01-05',
    publicationName: 'Fed Notes',
    sourceTitle: 'Distributed Ledger Integration',
    topicLabel: 'Finance'
  },
  {
    id: 'seed-11',
    category: 'clipped-quote',
    claimText: 'Space exploration instantly triggers economic hypergrowth.',
    evidenceText: 'A NASA briefing slide notes: "A 2% budget increase creates jobs [in regional sub-contractors]."',
    authorName: 'NASA Press Office',
    publishedAt: '2021-11-12',
    topicLabel: 'Space'
  },
  {
    id: 'seed-12',
    category: 'strong-narrow',
    claimText: 'Pre-trial detention programs increase plea-bargaining rates.',
    evidenceText: 'A 2023 study by the Department of Justice indicates that defendants held in pre-trial detention are 30% more likely to accept plea deals within 60 days of indictment.',
    authorName: 'DOJ Research Division',
    publishedAt: '2023-08-11',
    publicationName: 'DOJ Reports',
    sourceTitle: 'Detention and Case Disposition',
    topicLabel: 'Legal Reform'
  },
  {
    id: 'seed-13',
    category: 'overclaim',
    claimText: 'Quantum computing renders all modern encryption obsolete.',
    evidenceText: 'Laboratory prototypes of 50-qubit quantum computers have successfully factored small composite integers, illustrating theoretical pathways that could challenge RSA cryptography given massive scale-ups.',
    authorName: 'NIST Security Lab',
    publishedAt: '2024-05-18',
    publicationName: 'NIST Standards',
    sourceTitle: 'Post-Quantum Cryptography Assessment',
    topicLabel: 'Cybersecurity'
  },
  {
    id: 'seed-14',
    category: 'old-defensible',
    claimText: 'Keynesian fiscal stimulus limits severe recessionary damage.',
    evidenceText: 'In 1936, John Maynard Keynes established that active government deficit spending is necessary to offset private demand contractions during economic depressions.',
    authorName: 'John Maynard Keynes',
    publishedAt: '1936-02-12',
    publicationName: 'Palgrave Macmillan',
    sourceTitle: 'The General Theory of Employment, Interest, and Money',
    topicLabel: 'Macroeconomics'
  },
  {
    id: 'seed-15',
    category: 'great-source-bad-fit',
    claimText: 'Tariffs permanently restore manufacturing employment.',
    evidenceText: 'A 2024 IMF working paper confirms that steel tariffs led to short-term wage increases of 2% for localized regional smelter operations.',
    authorName: 'International Monetary Fund',
    publishedAt: '2024-04-10',
    publicationName: 'IMF Working Papers',
    sourceTitle: 'Steel Tariffs Trade Impact',
    topicLabel: 'Trade Policy'
  },
  {
    id: 'seed-16',
    category: 'no-metadata',
    claimText: 'Deficit spending increases national debt levels.',
    evidenceText: 'Persistent budget deficits accumulate over time, requiring additional treasury bond issuances that increase the outstanding public debt.',
    topicLabel: 'Public Finance'
  },
  {
    id: 'seed-17',
    category: 'clipped-quote',
    claimText: 'Urban zoning reform guarantees zero homelessness.',
    evidenceText: 'A planning memo notes: "removing parking mandates increases local supply [in selected luxury sub-sectors]."',
    authorName: 'Planning Brief',
    publishedAt: '2023-10-05',
    topicLabel: 'Urban Planning'
  },
  {
    id: 'seed-18',
    category: 'strong-narrow',
    claimText: 'Mandatory carbon disclosures increase corporate ESG accountability.',
    evidenceText: 'A 2024 SEC regulatory impact analysis shows that public companies subjected to mandatory scope 1 disclosure standards reduced greenhouse emissions by 4% on average.',
    authorName: 'Securities and Exchange Commission',
    publishedAt: '2024-03-06',
    publicationName: 'SEC Rules',
    sourceTitle: 'Climate Disclosure Standards',
    topicLabel: 'Regulations'
  },
  {
    id: 'seed-19',
    category: 'overclaim',
    claimText: 'Bilingual education models completely eliminate academic achievement gaps.',
    evidenceText: 'A study of dual-language immersion programs in Texas found that participating students scored 5% higher on standard reading assessments at the end of fifth grade.',
    authorName: 'Texas Education Agency',
    publishedAt: '2023-11-15',
    publicationName: 'TEA Publications',
    sourceTitle: 'Dual Language Program Outcomes',
    topicLabel: 'Education'
  },
  {
    id: 'seed-20',
    category: 'old-defensible',
    claimText: 'The tragedy of the commons requires state regulations or private property.',
    evidenceText: 'In his classic 1968 paper, Garrett Hardin details that rational individuals acting in their own self-interest will inevitably deplete shared open-access resources, necessitating mutual coercion.',
    authorName: 'Garrett Hardin',
    publishedAt: '1968-12-13',
    publicationName: 'Science Magazine',
    sourceTitle: 'The Tragedy of the Commons',
    topicLabel: 'Economics'
  }
];
