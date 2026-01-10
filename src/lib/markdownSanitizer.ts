/**
 * Markdown Sanitizer Utility
 * 
 * Uses DOMPurify to sanitize HTML content rendered from markdown
 * to prevent XSS attacks from potentially malicious content.
 */
import DOMPurify from 'dompurify';

// Configure DOMPurify with allowed tags and attributes
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li',
  'a',
  'code', 'pre',
  'blockquote',
  'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'class'
];

/**
 * Converts basic markdown to HTML
 */
function markdownToHtml(content: string): string {
  return content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-8 mb-4 text-primary border-b border-border pb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-4 text-primary">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-6 text-primary">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong class="font-bold text-primary"><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-muted-foreground">$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted rounded-lg p-4 my-4 overflow-x-auto border"><code class="text-sm">$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 pr-4 rounded-r">$1</blockquote>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-6 my-2 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 my-2 list-decimal">$1</li>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-8 border-border" />')
    // Links - enforce safe attributes
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>')
    // Paragraphs
    .replace(/\n\n/gim, '</p><p class="my-4">')
    .replace(/\n/gim, '<br />');
}

/**
 * Sanitizes HTML content using DOMPurify
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Force all links to have noopener noreferrer
    ADD_ATTR: ['target'],
    // Remove any javascript: or data: URLs
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button']
  });
}

/**
 * Converts markdown to sanitized HTML
 * This is the main function to use for rendering user-provided markdown content
 */
export function renderSafeMarkdown(content: string): string {
  const html = markdownToHtml(content);
  return sanitizeHtml(`<p class="my-4">${html}</p>`);
}

/**
 * Simple markdown conversion for basic content (headers, bold, italic, lists)
 * Used in CourseViewer for simpler markdown rendering
 */
export function renderSimpleMarkdown(content: string): string {
  const html = content
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\n/gim, '<br />');
  
  return sanitizeHtml(html);
}

/**
 * Preview markdown for editor (similar to full but slightly different styling)
 */
export function renderPreviewMarkdown(content: string): string {
  const html = content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-primary">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-primary">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6 text-primary">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre class="bg-muted rounded-lg p-4 my-4 border"><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic">$1</blockquote>')
    .replace(/^\- (.*$)/gim, '<li class="ml-6 my-1 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-6 my-1 list-decimal">$1</li>')
    .replace(/^---$/gim, '<hr class="my-6" />')
    .replace(/\n\n/gim, '</p><p class="my-4">')
    .replace(/\n/gim, '<br />');

  return sanitizeHtml(`<p class="my-4">${html}</p>`);
}
