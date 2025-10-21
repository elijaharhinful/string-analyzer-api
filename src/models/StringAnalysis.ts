import mongoose, { Schema, Document } from 'mongoose';

export interface IStringAnalysis extends Document {
  id: string;
  value: string;
  properties: {
    length: number;
    is_palindrome: boolean;
    unique_characters: number;
    word_count: number;
    sha256_hash: string;
    character_frequency_map: Record<string, number>;
  };
  created_at: Date;
}

const StringAnalysisSchema = new Schema<IStringAnalysis>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: String,
    required: true,
    unique: true,
  },
  properties: {
    length: { type: Number, required: true },
    is_palindrome: { type: Boolean, required: true },
    unique_characters: { type: Number, required: true },
    word_count: { type: Number, required: true },
    sha256_hash: { type: String, required: true },
    character_frequency_map: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IStringAnalysis>('StringAnalysis', StringAnalysisSchema);