
import { BandScore } from './types';

// REPLACE THIS ID with your actual Google Sheet ID from the URL
export const GOOGLE_SHEET_ID = '1ikyaICfEiuKTGj-5ta2nRhbWajRPe4X2b-IjoFBc1so'; 
export const SHEET_NAME = 'Scores'; // The name of the tab in your workbook

export const DISPLAY_COLUMNS = [
  "Year", "Show Name", "Show Round", "School", "Total", "Class", "Place:Class", "Place:Panel", "Place:Overall"
] as const;

export const FILTER_COLUMNS = [
  "Year", "Show Name", "Show Round", "Class", "School", "State long"
] as const;
