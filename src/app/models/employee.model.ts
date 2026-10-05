export type EmploymentStatus = 'ACTIVE' | 'ONBOARDING' | 'PROBATION' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id?: number;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  designation: string;
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  status: EmploymentStatus;
  salary: number;
  joiningDate: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  address?: string;
  emergencyContact?: string;
  skills: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeFilterParams {
  query?: string;
  departmentId?: number;
  status?: EmploymentStatus | '';
  designation?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}
