import express from 'express';
import {
  createString,
  getString,
  getAllStrings,
  deleteString,
  filterByNaturalLanguage,
} from '../controllers/stringController';

const router = express.Router();

router.post('/strings', createString);
router.get('/strings/filter-by-natural-language', filterByNaturalLanguage);
router.get('/strings/:string_value', getString);
router.get('/strings', getAllStrings);
router.delete('/strings/:string_value', deleteString);

export default router;