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

export async function searchWikipedia(query: string): Promise<WikiSearchResult[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: query,
    srlimit: '10',
    format: 'json',
    origin: '*',
  });

  try {
    const response = await fetch(`${WIKI_ACTION_API}?${params}`);
    const data = await response.json();

    if (!data.query?.search) return [];

    // Get thumbnails and extracts for each result
    const pageIds = data.query.search.map((r: any) => r.pageid).join('|');
    
    const detailParams = new URLSearchParams({
      action: 'query',
      pageids: pageIds,
      prop: 'pageimages|extracts|description',
      exintro: '1',
      explaintext: '1',
      exlimit: '10',
      pithumbsize: '300',
      format: 'json',
      origin: '*',
    });

    const detailResponse = await fetch(`${WIKI_ACTION_API}?${detailParams}`);
    const detailData = await detailResponse.json();

    const pages = detailData.query?.pages || {};

    return data.query.search.map((result: any) => {
      const pageDetails = pages[result.pageid] || {};
      return {
        pageid: result.pageid,
        title: result.title,
        extract: pageDetails.extract?.slice(0, 200) || result.snippet?.replace(/<[^>]*>/g, ''),
        thumbnail: pageDetails.thumbnail,
        description: pageDetails.description,
      };
    });
  } catch (error) {
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
