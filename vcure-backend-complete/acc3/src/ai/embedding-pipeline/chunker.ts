/**
 * EMBEDDING PIPELINE — Chunker
 *
 * Splits KnowledgeArticle content into overlapping chunks before embedding.
 * Overlap prevents losing context at chunk boundaries (a sentence explaining
 * a safety-relevant caveat should not be silently split across two chunks
 * with no shared context).
 *
 * Token counting here is a fast approximation (chars/4 ~= tokens for
 * English), not a real tokenizer — accurate enough for chunk sizing and
 * avoids adding a heavy tokenizer dependency to the foundation layer. If
 * exact provider-token-parity is needed later, swap `estimateTokens` for a
 * real tokenizer without changing the chunker's public shape.
 */

export interface Chunk {
  index: number;
  text: string;
  estimatedTokens: number;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, chunkSizeTokens: number, overlapTokens: number): Chunk[] {
  if (chunkSizeTokens <= overlapTokens) {
    throw new Error('chunkSizeTokens must be greater than overlapTokens to make progress');
  }

  const words = text.split(/\s+/).filter(Boolean);
  const approxWordsPerToken = 0.75; // ~4 chars/token, ~5.3 chars/word in English -> ~0.75 words/token
  const chunkSizeWords = Math.max(1, Math.round(chunkSizeTokens * approxWordsPerToken));
  const overlapWords = Math.max(0, Math.round(overlapTokens * approxWordsPerToken));

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSizeWords, words.length);
    const chunkWords = words.slice(start, end);
    const chunkStr = chunkWords.join(' ');
    chunks.push({ index, text: chunkStr, estimatedTokens: estimateTokens(chunkStr) });
    index += 1;

    if (end === words.length) break;
    start = end - overlapWords;
  }

  return chunks;
}
