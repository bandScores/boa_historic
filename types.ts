
export interface BandScore {
  ID: number;
  Year: number;
  Event: string;
  Show_Round: string;
  "New School": string;
  Total: number;
  Class: string;
  "Place:Class": number | string;
  "Place:Panel": number | string;
  "Place:Overall": number | string;
  "State long": string;
  Search: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface FilterState {
  Year: string[];
  Event: string[];
  Show_Round: string[];
  Class: string[];
  searchQuery: string;
  newSchools: string[];
  "State long": string[];
}
