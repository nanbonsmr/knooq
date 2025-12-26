const WIKI_API_BASE = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_ACTION_API = 'https://en.wikipedia.org/w/api.php';

export interface WikiSearchResult {
  pageid: number;
  title: string;
  extract?: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  description?: string;
}

export interface WikiArticle {
  title: string;
  pageid: number;
  extract: string;
  content_urls?: {
    desktop: { page: string };
    mobile: { page: string };
  };
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
}

export async function searchWikipedia(query: string, signal?: AbortSignal): Promise<WikiSearchResult[]> {
  if (!query.trim()) return [];

  // Use opensearch for faster initial results, then batch fetch details
  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: query,
    gsrlimit: '8',
    prop: 'pageimages|extracts|description',
    exintro: '1',
    explaintext: '1',
    exlimit: '8',
    pithumbsize: '200',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`${WIKI_ACTION_API}?${params}`, { signal });
    const data = await response.json();

    if (!data.query?.pages) return [];

    const pages = Object.values(data.query.pages) as any[];

    return pages
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map((page) => ({
        pageid: page.pageid,
        title: page.title,
        extract: page.extract?.slice(0, 150),
        thumbnail: page.thumbnail,
        description: page.description,
      }));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    console.error('Wikipedia search error:', error);
    return [];
  }
}

export async function getArticle(title: string): Promise<WikiArticle | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(`${WIKI_API_BASE}/page/summary/${encodedTitle}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      title: data.title,
      pageid: data.pageid,
      extract: data.extract,
      content_urls: data.content_urls,
      thumbnail: data.thumbnail,
    };
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

export async function getArticleContent(title: string): Promise<string | null> {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(`${WIKI_API_BASE}/page/html/${encodedTitle}`);
    
    if (!response.ok) return null;
    
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch article content:', error);
    return null;
  }
}

export async function getRandomArticles(count: number = 5): Promise<WikiSearchResult[]> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'random',
    rnlimit: String(count),
    rnnamespace: '0',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`${WIKI_ACTION_API}?${params}`);
    const data = await response.json();

    if (!data.query?.random) return [];

    const titles = data.query.random.map((r: any) => r.title).join('|');
    
    const detailParams = new URLSearchParams({
      action: 'query',
      titles: titles,
      prop: 'pageimages|extracts|description',
      exintro: '1',
      explaintext: '1',
      exlimit: String(count),
      pithumbsize: '400',
      format: 'json',
      origin: '*',
    });

    const detailResponse = await fetch(`${WIKI_ACTION_API}?${detailParams}`);
    const detailData = await detailResponse.json();

    const pages = Object.values(detailData.query?.pages || {}) as any[];

    return pages.map((page) => ({
      pageid: page.pageid,
      title: page.title,
      extract: page.extract?.slice(0, 200),
      thumbnail: page.thumbnail,
      description: page.description,
    }));
  } catch (error) {
    console.error('Failed to fetch random articles:', error);
    return [];
  }
}

export async function getFeaturedArticle(): Promise<WikiArticle | null> {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const response = await fetch(
      `${WIKI_API_BASE}/feed/featured/${year}/${month}/${day}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const tfa = data.tfa;
    
    if (!tfa) return null;
    
    return {
      title: tfa.title,
      pageid: tfa.pageid,
      extract: tfa.extract,
      thumbnail: tfa.thumbnail,
    };
  } catch (error) {
    console.error('Failed to fetch featured article:', error);
    return null;
  }
}

export async function getTrendingArticles(): Promise<WikiSearchResult[]> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    
    const response = await fetch(
      `${WIKI_API_BASE}/feed/featured/${year}/${month}/${day}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const mostRead = data.mostread?.articles?.slice(0, 8) || [];
    
    return mostRead.map((article: any) => ({
      pageid: article.pageid,
      title: article.title,
      extract: article.extract?.slice(0, 200),
      thumbnail: article.thumbnail,
      description: article.description,
    }));
  } catch (error) {
    console.error('Failed to fetch trending articles:', error);
    return [];
  }
}

export async function getRelatedArticles(title: string): Promise<WikiSearchResult[]> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'links',
    pllimit: '20',
    plnamespace: '0',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`${WIKI_ACTION_API}?${params}`);
    const data = await response.json();

    const pages = Object.values(data.query?.pages || {}) as any[];
    const links = pages[0]?.links?.slice(0, 8) || [];
    
    if (links.length === 0) return [];

    const titles = links.map((l: any) => l.title).join('|');
    
    const detailParams = new URLSearchParams({
      action: 'query',
      titles: titles,
      prop: 'pageimages|extracts|description',
      exintro: '1',
      explaintext: '1',
      exlimit: '8',
      pithumbsize: '200',
      format: 'json',
      origin: '*',
    });

    const detailResponse = await fetch(`${WIKI_ACTION_API}?${detailParams}`);
    const detailData = await detailResponse.json();

    const detailPages = Object.values(detailData.query?.pages || {}) as any[];

    return detailPages
      .filter((page) => page.pageid && page.pageid > 0)
      .slice(0, 8)
      .map((page) => ({
        pageid: page.pageid,
        title: page.title,
        extract: page.extract?.slice(0, 100),
        thumbnail: page.thumbnail,
        description: page.description,
      }));
  } catch (error) {
    console.error('Failed to fetch related articles:', error);
    return [];
  }
}
