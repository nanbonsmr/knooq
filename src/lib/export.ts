import { jsPDF } from 'jspdf';
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

// Single note export
export function exportSingleNote(note: Note): string {
  let markdown = `# Note: ${note.articleTitle}\n\n`;
  markdown += `_Exported on ${new Date().toLocaleDateString()}_\n\n---\n\n`;
  
  if (note.highlightedText) {
    markdown += `## Highlighted Text\n\n> "${note.highlightedText}"\n\n`;
  }
  
  if (note.content) {
    markdown += `## Notes\n\n${note.content}\n\n`;
  }
  
  if (note.tags.length > 0) {
    markdown += `## Tags\n\n${note.tags.map(t => `\`${t}\``).join(', ')}\n\n`;
  }
  
  markdown += `---\n\n_Created: ${new Date(note.createdAt).toLocaleDateString()}_\n`;
  markdown += `_Updated: ${new Date(note.updatedAt).toLocaleDateString()}_\n`;
  
  return markdown;
}

// PDF Export Functions
export function exportToPDF(notes: Note[], highlights: Highlight[], filename: string = 'knooq-export.pdf'): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = 20;
  
  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += 2;
  };
  
  // Title
  addText('knooq Export', 24, true, [99, 102, 241]);
  yPos += 5;
  addText(`Exported on ${new Date().toLocaleDateString()}`, 10, false, [128, 128, 128]);
  yPos += 10;
  
  // Notes section
  if (notes.length > 0) {
    addText('Notes', 18, true);
    yPos += 5;
    
    const notesByArticle = notes.reduce((acc, note) => {
      if (!acc[note.articleTitle]) acc[note.articleTitle] = [];
      acc[note.articleTitle].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
    
    Object.entries(notesByArticle).forEach(([articleTitle, articleNotes]) => {
      addText(articleTitle, 14, true, [59, 130, 246]);
      yPos += 3;
      
      articleNotes.forEach((note) => {
        if (note.highlightedText) {
          addText(`"${note.highlightedText}"`, 10, false, [180, 140, 40]);
          yPos += 2;
        }
        if (note.content) {
          addText(note.content, 11, false);
        }
        if (note.tags.length > 0) {
          addText(`Tags: ${note.tags.join(', ')}`, 9, false, [128, 128, 128]);
        }
        yPos += 5;
      });
      yPos += 5;
    });
  }
  
  // Highlights section
  if (highlights.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    addText('Highlights', 18, true);
    yPos += 5;
    
    highlights.forEach((highlight) => {
      addText(`"${highlight.text}"`, 11, false, [180, 140, 40]);
      addText(new Date(highlight.createdAt).toLocaleDateString(), 9, false, [128, 128, 128]);
      yPos += 5;
    });
  }
  
  doc.save(filename);
}

export function exportSingleNoteToPDF(note: Note): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let yPos = 20;
  
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    const lineHeight = fontSize * 0.5;
    
    lines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
    yPos += 2;
  };
  
  // Title
  addText('knooq Note', 20, true, [99, 102, 241]);
  yPos += 5;
  addText(note.articleTitle, 14, true, [59, 130, 246]);
  yPos += 10;
  
  // Highlighted text
  if (note.highlightedText) {
    addText('Highlighted Text:', 12, true);
    yPos += 3;
    addText(`"${note.highlightedText}"`, 11, false, [180, 140, 40]);
    yPos += 8;
  }
  
  // Note content
  if (note.content) {
    addText('Notes:', 12, true);
    yPos += 3;
    addText(note.content, 11, false);
    yPos += 8;
  }
  
  // Tags
  if (note.tags.length > 0) {
    addText('Tags:', 12, true);
    yPos += 3;
    addText(note.tags.join(', '), 10, false, [128, 128, 128]);
    yPos += 8;
  }
  
  // Metadata
  yPos += 5;
  addText(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 9, false, [128, 128, 128]);
  addText(`Updated: ${new Date(note.updatedAt).toLocaleDateString()}`, 9, false, [128, 128, 128]);
  
  const safeTitle = note.articleTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  doc.save(`knooq-note-${safeTitle}.pdf`);
}

export function exportNotesToPDF(notes: Note[]): void {
  exportToPDF(notes, [], 'knooq-notes.pdf');
}

export function exportHighlightsToPDF(highlights: Highlight[]): void {
  exportToPDF([], highlights, 'knooq-highlights.pdf');
}
