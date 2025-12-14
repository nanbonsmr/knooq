import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  articleTitle: string;
  articleId: string;
  content: string;
  highlightedText?: string;
  sectionId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Highlight {
  id: string;
  articleId: string;
  text: string;
  color: string;
  createdAt: Date;
}

export interface ArticleState {
  title: string;
  pageid: number;
  extract: string;
  content: string;
  thumbnail?: string;
}

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface StoreState {
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;

  // Current article
  currentArticle: ArticleState | null;
  setCurrentArticle: (article: ArticleState | null) => void;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, content: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Highlights
  highlights: Highlight[];
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (id: string) => void;
  getHighlightsForArticle: (articleId: string) => Highlight[];

  // UI State
  isNotePanelOpen: boolean;
  setNotePanelOpen: (isOpen: boolean) => void;
  isStudyMode: boolean;
  setStudyMode: (isStudy: boolean) => void;

  // Recent articles
  recentArticles: ArticleState[];
  addRecentArticle: (article: ArticleState) => void;

  // Bookmarks
  bookmarks: ArticleState[];
  addBookmark: (article: ArticleState) => void;
  removeBookmark: (pageid: number) => void;
  isBookmarked: (pageid: number) => boolean;

  // Breadcrumb navigation
  breadcrumbs: BreadcrumbItem[];
  addBreadcrumb: (item: BreadcrumbItem) => void;
  navigateToBreadcrumb: (index: number) => BreadcrumbItem[];
  clearBreadcrumbs: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),
      isSearching: false,
      setIsSearching: (isSearching) => set({ isSearching }),

      // Current article
      currentArticle: null,
      setCurrentArticle: (article) => set({ currentArticle: article }),

      // Notes
      notes: [],
      addNote: (note) =>
        set((state) => ({
          notes: [
            ...state.notes,
            {
              ...note,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),
      updateNote: (id, content) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...content, updatedAt: new Date() }
              : note
          ),
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        })),

      // Highlights
      highlights: [],
      addHighlight: (highlight) =>
        set((state) => ({
          highlights: [
            ...state.highlights,
            {
              ...highlight,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),
      removeHighlight: (id) =>
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== id),
        })),
      getHighlightsForArticle: (articleId) =>
        get().highlights.filter((h) => h.articleId === articleId),

      // UI State
      isNotePanelOpen: false,
      setNotePanelOpen: (isOpen) => set({ isNotePanelOpen: isOpen }),
      isStudyMode: false,
      setStudyMode: (isStudy) => set({ isStudyMode: isStudy }),

      // Recent articles
      recentArticles: [],
      addRecentArticle: (article) =>
        set((state) => {
          const filtered = state.recentArticles.filter(
            (a) => a.pageid !== article.pageid
          );
          return {
            recentArticles: [article, ...filtered].slice(0, 10),
          };
        }),

      // Bookmarks
      bookmarks: [],
      addBookmark: (article) =>
        set((state) => ({
          bookmarks: [article, ...state.bookmarks],
        })),
      removeBookmark: (pageid) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.pageid !== pageid),
        })),
      isBookmarked: (pageid) => get().bookmarks.some((b) => b.pageid === pageid),

      // Breadcrumb navigation
      breadcrumbs: [],
      addBreadcrumb: (item) =>
        set((state) => {
          // Don't add duplicate consecutive breadcrumbs
          const last = state.breadcrumbs[state.breadcrumbs.length - 1];
          if (last?.path === item.path) return state;
          // Keep max 10 breadcrumbs
          return {
            breadcrumbs: [...state.breadcrumbs, item].slice(-10),
          };
        }),
      navigateToBreadcrumb: (index) => {
        const state = get();
        const newBreadcrumbs = state.breadcrumbs.slice(0, index + 1);
        set({ breadcrumbs: newBreadcrumbs });
        return newBreadcrumbs;
      },
      clearBreadcrumbs: () => set({ breadcrumbs: [] }),
    }),
    {
      name: 'knooq-knowledge-store',
      partialize: (state) => ({
        notes: state.notes,
        highlights: state.highlights,
        recentArticles: state.recentArticles,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
