
import { BandScore } from '../types.js';
import { GOOGLE_SHEET_ID, SHEET_NAME } from '../constants.js';

export const fetchScoresFromSheet = async (): Promise<BandScore[]> => {
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  
  try {
    const response = await fetch(url);
    const text = await response.text();
    const jsonData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = jsonData.table.rows;
    const cols = jsonData.table.cols;

    const getIdx = (label: string) => {
      const normalized = label.toLowerCase().replace(/\s/g, '');
      return cols.findIndex((c: any) => {
        if (!c.label) return false;
        const colLabelNormalized = c.label.toLowerCase().replace(/\s/g, '');
        return colLabelNormalized === normalized;
      });
    };

    return rows.map((row: any) => {
      const getVal = (label: string) => {
        const idx = getIdx(label);
        if (idx === -1) return null;
        const cell = row.c[idx];
        return cell ? (cell.v ?? cell.f ?? null) : null;
      };

      return {
        ID: Number(getVal('ID') || 0),
        Year: Number(getVal('Year')),
        Event: String(getVal('Event') || ''),
        Show_Round: String(getVal('Show_Round') || getVal('P/S/F') || ''),
        "New School": String(getVal('New School') || ''),
        Total: Number(getVal('Total') || 0),
        Class: String(getVal('Class') || ''),
        "Place:Class": getVal('Place:Class') ?? getVal('Place: Class') ?? '-',
        "Place:Panel": getVal('Place:Panel') ?? getVal('Place: Panel') ?? '-',
        "Place:Overall": getVal('Place:Overall') ?? getVal('Place: Overall') ?? '-',
        "State long": String(getVal('State long') || ''),
        Search: String(getVal('Search') || '')
      };
    });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw new Error("Failed to connect to Google Sheets. Ensure the sheet is 'Published to the Web'.");
  }
};
