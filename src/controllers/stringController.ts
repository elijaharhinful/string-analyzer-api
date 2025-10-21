import { Request, Response } from 'express';
import StringAnalysis from '../models/StringAnalysis';
import { analyzeString } from '../utils/stringAnalyzer';
import { parseNaturalLanguageQuery } from '../utils/naturalLanguageParser';

// Helper function to format response
const formatResponse = (stringAnalysis: any) => ({
  id: stringAnalysis.id,
  value: stringAnalysis.value,
  properties: {
    length: stringAnalysis.properties.length,
    is_palindrome: stringAnalysis.properties.is_palindrome,
    unique_characters: stringAnalysis.properties.unique_characters,
    word_count: stringAnalysis.properties.word_count,
    sha256_hash: stringAnalysis.properties.sha256_hash,
    character_frequency_map: stringAnalysis.properties.character_frequency_map instanceof Map
      ? Object.fromEntries(stringAnalysis.properties.character_frequency_map)
      : stringAnalysis.properties.character_frequency_map,
  },
  created_at: stringAnalysis.created_at,
});

export const createString = async (req: Request, res: Response) => {
  try {
    const { value } = req.body;

    // Validation
    if (!value) {
      return res.status(400).json({ error: 'Missing "value" field' });
    }

    if (typeof value !== 'string') {
      return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
    }

    // Analyze string
    const properties = analyzeString(value);

    // Check if string already exists
    const existing = await StringAnalysis.findOne({ value });
    if (existing) {
      return res.status(409).json({ error: 'String already exists in the system' });
    }

    // Create and save
    const stringAnalysis = new StringAnalysis({
      id: properties.sha256_hash,
      value,
      properties,
    });

    await stringAnalysis.save();

    return res.status(201).json(formatResponse(stringAnalysis));
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getString = async (req: Request, res: Response) => {
  try {
    const { string_value } = req.params;

    const stringAnalysis = await StringAnalysis.findOne({ value: string_value });

    if (!stringAnalysis) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    return res.status(200).json(formatResponse(stringAnalysis));
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllStrings = async (req: Request, res: Response) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

    const filter: any = {};
    const filters_applied: any = {};

    // filter
    if (is_palindrome !== undefined) {
      if (is_palindrome !== 'true' && is_palindrome !== 'false') {
        return res.status(400).json({ error: 'Invalid query parameter: is_palindrome must be true or false' });
      }
      filter['properties.is_palindrome'] = is_palindrome === 'true';
      filters_applied.is_palindrome = is_palindrome === 'true';
    }

    if (min_length !== undefined) {
      const minLen = parseInt(min_length as string);
      if (isNaN(minLen)) {
        return res.status(400).json({ error: 'Invalid query parameter: min_length must be an integer' });
      }
      filter['properties.length'] = { ...filter['properties.length'], $gte: minLen };
      filters_applied.min_length = minLen;
    }

    if (max_length !== undefined) {
      const maxLen = parseInt(max_length as string);
      if (isNaN(maxLen)) {
        return res.status(400).json({ error: 'Invalid query parameter: max_length must be an integer' });
      }
      filter['properties.length'] = { ...filter['properties.length'], $lte: maxLen };
      filters_applied.max_length = maxLen;
    }

    if (word_count !== undefined) {
      const wc = parseInt(word_count as string);
      if (isNaN(wc)) {
        return res.status(400).json({ error: 'Invalid query parameter: word_count must be an integer' });
      }
      filter['properties.word_count'] = wc;
      filters_applied.word_count = wc;
    }

    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || contains_character.length !== 1) {
        return res.status(400).json({ error: 'Invalid query parameter: contains_character must be a single character' });
      }
      filter.value = { $regex: contains_character, $options: 'i' };
      filters_applied.contains_character = contains_character;
    }

    const strings = await StringAnalysis.find(filter);

    const data = strings.map(s => formatResponse(s));

    return res.status(200).json({
      data,
      count: data.length,
      filters_applied,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const filterByNaturalLanguage = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Unable to parse natural language query' });
    }

    const parsedFilters = parseNaturalLanguageQuery(query);

    // Check for conflicting filters
    if (parsedFilters.min_length && parsedFilters.max_length && parsedFilters.min_length > parsedFilters.max_length) {
      return res.status(422).json({ error: 'Query parsed but resulted in conflicting filters' });
    }

    // MongoDB filter
    const filter: any = {};

    if (parsedFilters.is_palindrome !== undefined) {
      filter['properties.is_palindrome'] = parsedFilters.is_palindrome;
    }

    if (parsedFilters.min_length !== undefined) {
      filter['properties.length'] = { ...filter['properties.length'], $gte: parsedFilters.min_length };
    }

    if (parsedFilters.max_length !== undefined) {
      filter['properties.length'] = { ...filter['properties.length'], $lte: parsedFilters.max_length };
    }

    if (parsedFilters.word_count !== undefined) {
      filter['properties.word_count'] = parsedFilters.word_count;
    }

    if (parsedFilters.contains_character !== undefined) {
      filter.value = { $regex: parsedFilters.contains_character, $options: 'i' };
    }

    const strings = await StringAnalysis.find(filter);

    const data = strings.map(s => formatResponse(s));

    return res.status(200).json({
      data,
      count: data.length,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteString = async (req: Request, res: Response) => {
  try {
    const { string_value } = req.params;

    const result = await StringAnalysis.findOneAndDelete({ value: string_value });

    if (!result) {
      return res.status(404).json({ error: 'String does not exist in the system' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};