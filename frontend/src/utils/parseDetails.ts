/**
 * Parse torrent details content from BBCode-like syntax to HTML
 * Converts:
 * - \n to <br>
 * - [b]...[/b] to <strong>...</strong>
 * - [i]...[/i] to <em>...</em>
 * - [u]...[/u] to <u>...</u>
 * - * * * separator to <hr>
 */
export function parseDetails(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/\n/g, '<br>')
    .replace(/<br><br>\* \* \*<br><br>/gi, '<hr>')
    .replace(/\[b\](.*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\](.*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
}