export type Page =
  | 'dashboard'
  | 'funding-discovery'
  | 'funding-eligibility'
  | 'prioritization'
  | 'grievance'
  | 'pattern-analysis'
  | 'root-cause'
  | 'solution'
  | 'budget'
  | 'map'
  | 'assistant'
  | 'reports'
  | 'workforce';

export interface BudgetProjectData {
  _id: string;
  projectName: string;
  schemeName?: string;
  section?: string;
  department?: string;
  description?: string;
  financialYear: string;
  estimatedCost?: number | null;
  estimatedCostUnit?: string | null;
  allocatedAmount?: number | null;
  allocatedAmountUnit?: string | null;
  utilizedAmount?: number;
  remainingAmount?: number | null;
  fundingSource?: string;
  metricName?: string;
  metricValue?: number;
  metricUnit?: string;
  location?: string;
  wardNumbers?: string[];
  pdfPage: number;
  documentPage?: number | null;
  sourceReference?: string;
  sourceDocument?: string;
  sourceTitle?: string;
  eligibility?: string;
}

export interface BudgetFundSummaryData {
  fundName: string;
  revenueReceipts: number;
  capitalReceipts: number;
  totalReceipts: number;
  revenueExpenditure: number;
  capitalExpenditure: number;
  totalExpenditure: number;
  surplusDeficit: number;
  unit: string;
  pdfPage: number;
  documentPage?: number | null;
  sourceReference?: string;
}

export interface OfficerWorkspaceData {
  officer: {
    id: string;
    username: string;
    name: string;
    department?: string;
    municipality?: string;
  };
  metrics: {
    availableFunds: string;
    corporationBudgetEstimate?: string;
    activeGrievances: number;
    repeatedIssues: number;
    highPriority: number;
    budgetUtilization: string;
  };
  complaints: any[];
  budgetSummary?: {
    organization: string;
    financialYear: string;
    totalReceipts: string;
    totalExpenditure: string;
    surplusDeficit: string;
    sourceDocument: string;
    documentPage: number;
    pdfPage: number;
    sourceReference: string;
  };
  fundSummaries?: BudgetFundSummaryData[];
  budgetProjects?: BudgetProjectData[];
  wardOverview: Array<{
    ward: string;
    complaints: number;
    severity: string;
    pct: number;
  }>;
  aiInsights: Array<{
    type: string;
    tag: string;
    title: string;
    desc: string;
    action: string;
    page: Page;
    color: string;
    bg: string;
    sourceDocument?: string;
    pdfPage?: number;
    documentPage?: number;
  }>;
  recentActivity: Array<{
    time: string;
    action: string;
    status: 'success' | 'warning' | 'danger' | 'info';
  }>;
}
