import { Employee } from './employee.model';

export interface DepartmentBreakdown {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  employeeCount: number;
  totalSalary: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onboardingEmployees: number;
  probationEmployees: number;
  onLeaveEmployees: number;
  totalDepartments: number;
  totalPayroll: number;
  averageSalary: number;
  statusDistribution: Record<string, number>;
  departmentBreakdown: DepartmentBreakdown[];
  recentJoiners: Employee[];
}
