import crypto from 'crypto';

export interface StringProperties {
  length: number;
  is_palindrome: boolean;
  unique_characters: number;
  word_count: number;
  sha256_hash: string;
  character_frequency_map: Record<string, number>;
}

export function analyzeString(value: string): StringProperties {
  // Length
  const length = value.length;

  // SHA-256 hash
  const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');

  // Palindrome check (case-insensitive)
  const normalized = value.toLowerCase().replace(/\s+/g, '');
  const is_palindrome = normalized === normalized.split('').reverse().join('');

  // Unique characters
  const unique_characters = new Set(value).size;

  // Word count
  const word_count = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Character frequency map
  const character_frequency_map: Record<string, number> = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}