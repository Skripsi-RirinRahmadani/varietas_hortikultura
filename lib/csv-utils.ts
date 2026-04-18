import { Commodity } from './types';

export const exportToCSV = (data: Commodity[], fileName: string) => {
  const headers = [
    'Nama',
    'Jenis Tanah',
    'pH Min',
    'pH Max',
    'Curah Hujan Min',
    'Curah Hujan Max',
    'Suhu Min',
    'Suhu Max',
    'Kecamatan',
    'Status'
  ];

  const rows = data.map(item => [
    item.name,
    item.soil_type || '',
    item.ph_min || '',
    item.ph_max || '',
    item.rainfall_min || '',
    item.rainfall_max || '',
    item.temp_min || '',
    item.temp_max || '',
    item.district?.name || '',
    item.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const parseCSV = (content: string): Partial<Commodity>[] => {
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Basic CSV parser that handles quotes
  const parseLine = (line: string) => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i+1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
  };

  const headers = parseLine(lines[0]);
  const data: Partial<Commodity>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const item: any = {};
    
    // Mapping headers to keys (Manual mapping for safety)
    // We assume the order matches our export headers
    item.name = values[0];
    item.soil_type = values[1];
    item.ph_min = parseFloat(values[2]);
    item.ph_max = parseFloat(values[3]);
    item.rainfall_min = parseFloat(values[4]);
    item.rainfall_max = parseFloat(values[5]);
    item.temp_min = parseFloat(values[6]);
    item.temp_max = parseFloat(values[7]);
    // District mapping will be handled by the caller during import (matching name to ID)
    item._district_name = values[8]; 
    item.status = values[9] === 'Unggulan' ? 'Unggulan' : 'Biasa';
    
    data.push(item);
  }

  return data;
};
