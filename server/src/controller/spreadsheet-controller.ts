import { Request, Response } from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.API_KEY || "AIzaSyCxrvxY0Nmf5txZwCIuTBWEEIw7HVC8bro";

function processField(field: string) {
    return field.replace(/\n/g, '\\n');
}

function removeEmptyValues(obj: any) {
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].filter((value: string) => value !== null && value !== undefined && value !== '');
        }
    }
    return obj;
}

export const getSpreadsheetData = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const name = (req.query.name as string).split("+").join(" ");

    // Get the spreadsheet ID from the request
    const spreadsheetId = req.query.id as string;

    if (!spreadsheetId) {
        return res.status(400).send('Spreadsheet ID is required');
    }

    const range = `${name}!A1:Z`; // Adjust the range as needed

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        let rows: any = response.data.values;
        if (name.toLowerCase() === 'naxal profile') {
            rows = rows.shift();
            rows = response.data.values?.map(row => ({
                id: processField(row[0] || ''),
                name: processField(row[1] || ''),
                description: processField(row[2] || ''),
                rank: processField(row[3] || ''),
                level: processField(row[4] || ''),
                central: processField(row[5] || ''),
                zonal: processField(row[6] || ''),
                subZonal: processField(row[7] || ''),
                division: processField(row[8] || ''),
                areaCommittee: processField(row[9] || ''),
                company: processField(row[10] || ''),
                platoon: processField(row[11] || ''),
                rpc: processField(row[12] || ''),
                weapon: processField(row[13] || ''),
                electronicGadget: processField(row[14] || ''),
                status: processField(row[15] || ''),
                otherInfo: processField(row[16] || ''),
                resident: processField(row[17] || ''),
                district: processField(row[18] || ''),
                workArea: processField(row[19] || ''),
            }));
        }
        else if (name.toLowerCase() === 'db-naxal') {
            rows = rows.shift();
            let filterTypes: {
                rank: string[],
                level: string[],
                central: string[],
                zonal: string[],
                subZonal: string[],
                division: string[],
                areaCommittee: string[],
                company: string[],
                platoon: string[],
                weapon: string[],
                electronicGadget: string[],
                status: string[],
                rpc: string[]
            } = {
                rank: [],
                level: [],
                central: [],
                zonal: [],
                subZonal: [],
                division: [],
                areaCommittee: [],
                company: [],
                platoon: [],
                weapon: [],
                electronicGadget: [],
                status: [],
                rpc: []
            };
            response.data.values?.map(row => {
                filterTypes.rank.push(processField(row[12] || ''));
                filterTypes.level.push(processField(row[0] || ''));
                filterTypes.central.push(processField(row[1] || ''));
                filterTypes.zonal.push(processField(row[2] || ''));
                filterTypes.subZonal.push(processField(row[3] || ''));
                filterTypes.division.push(processField(row[4] || ''));
                filterTypes.areaCommittee.push(processField(row[5] || ''));
                filterTypes.company.push(processField(row[6] || ''));
                filterTypes.platoon.push(processField(row[7] || ''));
                filterTypes.rpc.push(processField(row[8] || ''));
                filterTypes.weapon.push(processField(row[9] || ''));
                filterTypes.electronicGadget.push(processField(row[10] || ''));
                filterTypes.status.push(processField(row[11] || ''));
            });
            filterTypes = removeEmptyValues(filterTypes);
            return res.status(200).json(filterTypes);
        }

        if (rows.length) {
            res.status(200).json(rows);
        } else {
            res.status(404).send('No data found.');
        }
    } catch (err: any) {
        console.error('The API returned an error:', err);
        res.status(500).send(err.message || "Error occurred while fetching spreadsheet");
    }
};

export const getSpreadsheetHeaders = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const spreadsheetId = req.query.id as string;
    const name = (req.query.name as string).split("+").join(" ");

    if (!spreadsheetId) {
        return res.status(400).send('Spreadsheet ID is required');
    }

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${name}!A1:Z1`, // Assuming headers are in the first row
        });

        const headers = response.data.values?.[0] || [];
        res.status(200).json(headers);
    } catch (err: any) {
        console.error('Error fetching spreadsheet headers:', err);
        res.status(500).send(err.message || "Error occurred while fetching spreadsheet headers");
    }
};
export const getSpreadsheetSheets = async (req: Request, res: Response) => {
    const sheets = google.sheets({ version: 'v4', auth: apiKey });
    const spreadsheetId = req.query.id as string;

    if (!spreadsheetId) {
        return res.status(400).send('Spreadsheet ID is required');
    }

    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: 'sheets.properties.title',
        });

        const sheetNames = response.data.sheets?.map(sheet => sheet.properties?.title).filter(Boolean) as string[];
        res.status(200).json(sheetNames);
    } catch (err: any) {
        console.error('Error fetching spreadsheet sheets:', err);
        res.status(500).send(err.message || "Error occurred while fetching spreadsheet sheets");
    }
};