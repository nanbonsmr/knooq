import { Note, Highlight } from '@/store/useStore';

export function exportToMarkdown(notes: Note[], highlights: Highlight[]): string {
  let markdown = '# knooq Export\n\n';
  markdown += `_Exported on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}_\n\n`;

  // Group notes by article
  const notesByArticle = notes.reduce((acc, note) => {
    const key = note.articleTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  // Group highlights by article
  const highlightsByArticle = highlights.reduce((acc, highlight) => {
    const key = highlight.articleId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(highlight);
    return acc;
  }, {} as Record<string, Highlight[]>);

  // Notes section
  if (notes.length > 0) {
    markdown += '---\n\n## 📝 Notes\n\n';
    
    Object.entries(notesByArticle).forEach(([articleTitle, articleNotes]) => {
      markdown += `### ${articleTitle}\n\n`;
      
      articleNotes.forEach((note) => {
        if (note.highlightedText) {
          markdown += `> "${note.highlightedText}"\n\n`;
        }
        if (note.content) {
          markdown += `${note.content}\n\n`;
        }
        if (note.tags.length > 0) {
          markdown += `**Tags:** ${note.tags.map(t => `\`${t}\``).join(', ')}\n\n`;
        }
        markdown += `_Created: ${new Date(note.createdAt).toLocaleDateString()}_\n\n`;
        markdown += '---\n\n';
      });
    });
  }

  // Highlights section
  if (highlights.length > 0) {
    markdown += '## 🖍️ Highlights\n\n';
    
    highlights.forEach((highlight) => {
      markdown += `> "${highlight.text}"\n\n`;
      markdown += `_Highlighted: ${new Date(highlight.createdAt).toLocaleDateString()}_\n\n`;
      markdown += '---\n\n';
    });
  }

  return markdown;
}

export function downloadMarkdown(content: string, filename: string = 'knooq-export.md'): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportNotesOnly(notes: Note[]): string {
  let markdown = '# knooq Notes\n\n';
  markdown += `_Exported on ${new Date().toLocaleDateString()}_\n\n---\n\n`;

  const notesByArticle = notes.reduce((acc, note) => {
    const key = note.articleTitle;
    if (!acc[key]) acc[key] = [];
    acc[key].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  Object.entries(notesByArticle).forEach(([articleTitle, articleNotes]) => {
    markdown += `## ${articleTitle}\n\n`;
    
    articleNotes.forEach((note) => {
      if (note.highlightedText) {
        markdown += `> "${note.highlightedText}"\n\n`;
      }
      if (note.content) {
        markdown += `${note.content}\n\n`;
      }
      if (note.tags.length > 0) {
        markdown += `**Tags:** ${note.tags.map(t => `\`${t}\``).join(', ')}\n\n`;
      }
      markdown += '---\n\n';
    });
  });

  return markdown;
}

export function exportHighlightsOnly(highlights: Highlight[]): string {
  let markdown = '# knooq Highlights\n\n';
  markdown += `_Exported on ${new Date().toLocaleDateString()}_\n\n---\n\n`;

  highlights.forEach((highlight) => {
    markdown += `> "${highlight.text}"\n\n`;
    markdown += `_${new Date(highlight.createdAt).toLocaleDateString()}_\n\n`;
    markdown += '---\n\n';
  });

  return markdown;
}
