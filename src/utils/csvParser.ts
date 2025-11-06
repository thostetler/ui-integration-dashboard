import Papa from 'papaparse';
import type { PerformanceData, CSVRow, ComparisonData } from '../types';

const METRICS = ['TTRL', 'TTSBI', 'TTRS', 'TTRR'];

function getSeverity(changePercent: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  const absChange = Math.abs(changePercent);
  if (absChange >= 40) return 'Critical';
  if (absChange >= 30) return 'High';
  if (absChange >= 20) return 'Medium';
  return 'Low';
}

function getStatus(changePercent: number): 'SLOW' | 'OK' {
  return changePercent > 10 ? 'SLOW' : 'OK';
}

export async function loadCSV(filename: string): Promise<CSVRow[]> {
  const response = await fetch(`/data/${filename}`);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

export function calculateChanges(
  baselineData: CSVRow[],
  currentData: CSVRow[],
  environment: 'scix' | 'bbb' = 'scix'
): ComparisonData {
  const normalChanges: PerformanceData[] = [];
  const cpuChanges: PerformanceData[] = [];

  // Create a map for quick lookup
  const currentMap = new Map(
    currentData.map(row => [row['Test Name'], row])
  );

  for (const baseRow of baselineData) {
    const testName = baseRow['Test Name'];
    const currentRow = currentMap.get(testName);
    if (!currentRow) continue;

    // Process normal throttle
    for (const metric of METRICS) {
      const baseKey = `${environment}_normal_${metric}`;
      const baseValue = parseFloat(baseRow[baseKey] || '');
      const currentValue = parseFloat(currentRow[baseKey] || '');

      if (!isNaN(baseValue) && !isNaN(currentValue) && baseValue > 0) {
        const changePercent = ((currentValue - baseValue) / baseValue) * 100;
        const change = currentValue - baseValue;
        if (Math.abs(changePercent) >= 5) { // Only include significant changes
          normalChanges.push({
            test: testName,
            metric,
            baseline: baseValue,
            current: currentValue,
            change,
            changePercent,
            severity: getSeverity(changePercent),
            status: getStatus(changePercent),
          });
        }
      }
    }

    // Process 6x CPU throttle
    for (const metric of METRICS) {
      const baseKey = `${environment}_6x-cpu_${metric}`;
      const baseValue = parseFloat(baseRow[baseKey] || '');
      const currentValue = parseFloat(currentRow[baseKey] || '');

      if (!isNaN(baseValue) && !isNaN(currentValue) && baseValue > 0) {
        const changePercent = ((currentValue - baseValue) / baseValue) * 100;
        const change = currentValue - baseValue;
        if (Math.abs(changePercent) >= 5) { // Only include significant changes
          cpuChanges.push({
            test: testName,
            metric,
            baseline: baseValue,
            current: currentValue,
            change,
            changePercent,
            severity: getSeverity(changePercent),
            status: getStatus(changePercent),
          });
        }
      }
    }
  }

  return {
    normal: normalChanges.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)),
    '6x-cpu': cpuChanges.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)),
  };
}

export async function loadComparisonData(
  baselineFile: string,
  currentFile: string,
  environment: 'scix' | 'bbb' = 'scix'
): Promise<ComparisonData> {
  const [baselineData, currentData] = await Promise.all([
    loadCSV(baselineFile),
    loadCSV(currentFile),
  ]);

  return calculateChanges(baselineData, currentData, environment);
}
