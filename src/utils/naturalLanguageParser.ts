export interface ParsedFilters {
  is_palindrome?: boolean;
  min_length?: number;
  max_length?: number;
  word_count?: number;
  contains_character?: string;
}

export function parseNaturalLanguageQuery(query: string): ParsedFilters {
  const lowerQuery = query.toLowerCase();
  const filters: ParsedFilters = {};

  // Palindrome detection
  if (lowerQuery.includes('palindrome') || lowerQuery.includes('palindromic')) {
    filters.is_palindrome = true;
  }

  // Single word detection
  if (lowerQuery.includes('single word')) {
    filters.word_count = 1;
  }

  // Word count pattern: "X word" or "X words"
  const wordCountMatch = lowerQuery.match(/(\d+)\s+words?/);
  if (wordCountMatch && wordCountMatch[1]) {
    filters.word_count = parseInt(wordCountMatch[1]);
  }

  // Length patterns
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch && longerThanMatch[1]) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch && shorterThanMatch[1]) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  const atLeastMatch = lowerQuery.match(/at least (\d+) characters?/);
  if (atLeastMatch && atLeastMatch[1]) {
    filters.min_length = parseInt(atLeastMatch[1]);
  }

  const atMostMatch = lowerQuery.match(/at most (\d+) characters?/);
  if (atMostMatch && atMostMatch[1]) {
    filters.max_length = parseInt(atMostMatch[1]);
  }

  // Contains character patterns
  const containsLetterMatch = lowerQuery.match(/contains? (?:the )?letter ([a-z])/);
  if (containsLetterMatch && containsLetterMatch[1]) {
    filters.contains_character = containsLetterMatch[1];
  }

  // "first vowel" = 'a'
  if (lowerQuery.includes('first vowel')) {
    filters.contains_character = 'a';
  }

  return filters;
}