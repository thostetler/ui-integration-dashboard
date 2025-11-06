export interface PerformanceData {
  test: string;
  metric: string;
  baseline: number;
  current: number;
  change: number;
  changePercent: number;
  status?: 'SLOW' | 'OK';
  severity?: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface CSVRow {
  'Test Name': string;
  scix_normal_TTRL?: string;
  scix_normal_TTSBI?: string;
  scix_normal_TTRS?: string;
  scix_normal_TTRR?: string;
  bbb_normal_TTRL?: string;
  bbb_normal_TTSBI?: string;
  bbb_normal_TTRS?: string;
  bbb_normal_TTRR?: string;
  scix_6x_cpu_TTRL?: string;
  scix_6x_cpu_TTSBI?: string;
  scix_6x_cpu_TTRS?: string;
  scix_6x_cpu_TTRR?: string;
  bbb_6x_cpu_TTRL?: string;
  bbb_6x_cpu_TTSBI?: string;
  bbb_6x_cpu_TTRS?: string;
  bbb_6x_cpu_TTRR?: string;
  [key: string]: string | undefined;
}

export interface ComparisonData {
  normal: PerformanceData[];
  '6x-cpu': PerformanceData[];
}

export interface ComparisonLabels {
  before: string;
  after: string;
}

export type ThrottleType = 'normal' | '6x-cpu';
export type ComparisonType = 'nov24-nov25' | 'oct-nov25' | 'jan-nov25';
