import { Router } from "express";
import { getSpreadsheetData, getSpreadsheetHeaders, getSpreadsheetSheets } from "../controller/spreadsheet-controller";

const router = Router();

router.get('/spreadsheet', getSpreadsheetData);
router.get('/spreadsheet/headers', getSpreadsheetHeaders);
router.get('/spreadsheet/sheets', getSpreadsheetSheets);

export default router;