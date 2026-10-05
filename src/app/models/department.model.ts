export interface Department {
  id?: number;
  name: string;
  code: string;
  description?: string;
  location?: string;
  headOfDepartment?: string;
  employeeCount?: number;
  averageSalary?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentSearchParams {
  query?: string;
  location?: string;
}
