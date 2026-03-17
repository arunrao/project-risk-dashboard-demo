import Papa from 'papaparse';
import { ProjectRow, ColumnMapping } from '@/types';

export function parseCSV(file: File): Promise<{ data: ProjectRow[]; mapping: ColumnMapping }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = results.data as Record<string, string>[];
        if (rawRows.length === 0) {
          return reject(new Error('CSV is empty or invalid'));
        }

        const headers = results.meta.fields || [];
        const mapping = mapColumns(headers);
        const mappedData = rawRows.map((row) => mapRowData(row, mapping));

        resolve({ data: mappedData, mapping });
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function mapColumns(headers: string[]): ColumnMapping {
  // Simple heuristic for column mapping
  const findHeader = (keywords: string[]) => {
    return headers.find((h) => keywords.some((k) => h.toLowerCase().includes(k))) || '';
  };

  return {
    name: findHeader(['project', 'name', 'title']),
    owner: findHeader(['owner', 'manager', 'lead']),
    startDate: findHeader(['start', 'begin']),
    endDate: findHeader(['end', 'finish', 'due']),
    pctComplete: findHeader(['%', 'percent', 'complete', 'progress']),
    budget: findHeader(['budget', 'allocated', 'planned cost']),
    actualSpend: findHeader(['actual', 'spend', 'spent', 'cost']),
    status: findHeader(['status', 'state', 'health']),
    notes: findHeader(['note', 'comment', 'description']),
  };
}

function mapRowData(rawRow: Record<string, string>, mapping: ColumnMapping): ProjectRow {
  const parseNum = (val?: string) => {
    if (!val) return undefined;
    const clean = val.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? undefined : num;
  };

  // Extract raw % as number between 0 and 100
  let parsedPct = parseNum(mapping.pctComplete ? rawRow[mapping.pctComplete] : undefined);
  if (parsedPct !== undefined) {
      if (parsedPct > 1 && parsedPct <= 100 && rawRow[mapping.pctComplete]?.includes('%')) {
          // Keep as is, e.g. "50%" -> 50
      } else if (parsedPct <= 1) {
          parsedPct = parsedPct * 100; // e.g. 0.5 -> 50
      }
  }

  return {
    name: mapping.name ? rawRow[mapping.name] : 'Unknown Project',
    owner: mapping.owner ? rawRow[mapping.owner] : undefined,
    startDate: mapping.startDate ? rawRow[mapping.startDate] : undefined,
    endDate: mapping.endDate ? rawRow[mapping.endDate] : undefined,
    pctComplete: parsedPct,
    budget: parseNum(mapping.budget ? rawRow[mapping.budget] : undefined),
    actualSpend: parseNum(mapping.actualSpend ? rawRow[mapping.actualSpend] : undefined),
    status: mapping.status ? rawRow[mapping.status] : undefined,
    notes: mapping.notes ? rawRow[mapping.notes] : undefined,
    rawRowData: rawRow,
  };
}
