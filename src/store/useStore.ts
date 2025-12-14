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

export interface ArticleState {
  title: string;
  pageid: number;
  extract: string;
  content: string;
  thumbnail?: string;
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
    }),
    {
      name: 'nexus-knowledge-store',
      partialize: (state) => ({
        notes: state.notes,
        recentArticles: state.recentArticles,
        bookmarks: state.bookmarks,
      }),
    }
  )
);
