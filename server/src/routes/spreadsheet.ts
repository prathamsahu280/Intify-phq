import { Router } from "express";
import { getSpreadsheetData, getSpreadsheetHeaders, getSpreadsheetSheets, uploadExcelFile, getExcelHeaders, getExcelData } from "../controller/spreadsheet-controller";
import multer from 'multer';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.get('/spreadsheet', getSpreadsheetData);
router.get('/spreadsheet/headers', getSpreadsheetHeaders);
router.get('/spreadsheet/sheets', getSpreadsheetSheets);

router.post('/excel/upload', upload.single('file'), uploadExcelFile);
router.get('/excel/headers', getExcelHeaders);
router.get('/excel/data', getExcelData);

export default router;