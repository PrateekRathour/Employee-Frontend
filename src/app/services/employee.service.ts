import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Employee, EmployeeFilterParams, EmploymentStatus } from '../models/employee.model';
import { ApiResponse, PageResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/employees';

  // In-memory fallback mock employees
  private fallbackEmployees: Employee[] = [
    {
      id: 1,
      employeeCode: 'EMP-ENG-1001',
      firstName: 'Prateek',
      lastName: 'Sharma',
      fullName: 'Prateek Sharma',
      email: 'prateek.sharma@example.com',
      phone: '+1 555-0192',
      designation: 'Lead DevOps & Cloud Architect',
      departmentId: 1,
      departmentName: 'Engineering & Technology',
      departmentCode: 'ENG',
      status: 'ACTIVE',
      salary: 135000,
      joiningDate: '2023-01-15',
      dateOfBirth: '1994-06-20',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: '742 Evergreen Terrace, Seattle, WA',
      emergencyContact: 'Dr. Alexander Wright (+1 555-9001)',
      skills: ['Kubernetes', 'AWS', 'Docker', 'Terraform', 'CI/CD', 'Java', 'Spring Boot']
    },
    {
      id: 2,
      employeeCode: 'EMP-ENG-1002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 555-0144',
      designation: 'Senior Full Stack Engineer',
      departmentId: 1,
      departmentName: 'Engineering & Technology',
      departmentCode: 'ENG',
      status: 'ACTIVE',
      salary: 120000,
      joiningDate: '2023-04-01',
      dateOfBirth: '1996-03-14',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      address: '1204 Pine St, San Francisco, CA',
      emergencyContact: 'Mark Jenkins (+1 555-9002)',
      skills: ['Angular', 'TypeScript', 'Spring Boot', 'MySQL', 'RxJS', 'Material UI']
    },
    {
      id: 3,
      employeeCode: 'EMP-ENG-1003',
      firstName: 'Aarav',
      lastName: 'Patel',
      fullName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+1 555-0188',
      designation: 'Cloud Platform Engineer',
      departmentId: 1,
      departmentName: 'Engineering & Technology',
      departmentCode: 'ENG',
      status: 'ONBOARDING',
      salary: 98000,
      joiningDate: '2025-09-10',
      dateOfBirth: '1998-11-28',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      address: '89 Silicon Ave, Austin, TX',
      emergencyContact: 'Priya Patel (+1 555-9003)',
      skills: ['AWS', 'Jenkins', 'Linux', 'Docker', 'Python', 'Prometheus']
    },
    {
      id: 4,
      employeeCode: 'EMP-HR-2001',
      firstName: 'Elena',
      lastName: 'Vance',
      fullName: 'Elena Vance',
      email: 'elena.vance@example.com',
      phone: '+1 555-0133',
      designation: 'VP of People & Culture',
      departmentId: 2,
      departmentName: 'Human Resources',
      departmentCode: 'HR',
      status: 'ACTIVE',
      salary: 145000,
      joiningDate: '2022-05-20',
      dateOfBirth: '1988-08-09',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      address: '330 Park Avenue, New York, NY',
      emergencyContact: 'Thomas Vance (+1 555-9004)',
      skills: ['Talent Acquisition', 'Employee Onboarding', 'Conflict Resolution', 'Performance Mgmt']
    },
    {
      id: 5,
      employeeCode: 'EMP-HR-2002',
      firstName: 'Michael',
      lastName: 'Chang',
      fullName: 'Michael Chang',
      email: 'michael.chang@example.com',
      phone: '+1 555-0165',
      designation: 'HR Operations Specialist',
      departmentId: 2,
      departmentName: 'Human Resources',
      departmentCode: 'HR',
      status: 'PROBATION',
      salary: 68000,
      joiningDate: '2025-08-01',
      dateOfBirth: '1999-04-12',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      address: '452 Broadway, Boston, MA',
      emergencyContact: 'Alice Chang (+1 555-9005)',
      skills: ['Workday', 'HRIS', 'Payroll', 'Benefits Admin']
    },
    {
      id: 6,
      employeeCode: 'EMP-DES-3001',
      firstName: 'Marcus',
      lastName: 'Chen',
      fullName: 'Marcus Chen',
      email: 'marcus.chen@example.com',
      phone: '+1 555-0177',
      designation: 'Lead UI/UX Designer',
      departmentId: 3,
      departmentName: 'Product & UI/UX Design',
      departmentCode: 'DES',
      status: 'ACTIVE',
      salary: 125000,
      joiningDate: '2023-02-10',
      dateOfBirth: '1992-01-30',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      address: '600 Oak Ridge Rd, Chicago, IL',
      emergencyContact: 'Jessica Chen (+1 555-9006)',
      skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Design Tokens']
    }
  ];

  onboardEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<ApiResponse<Employee>>(`${this.baseUrl}/onboard`, employee).pipe(
      map(res => res.data),
      catchError(() => {
        const id = Date.now();
        const newEmp: Employee = {
          ...employee,
          id,
          employeeCode: `EMP-${employee.departmentId === 1 ? 'ENG' : employee.departmentId === 2 ? 'HR' : 'GEN'}-${Math.floor(1000 + Math.random() * 9000)}`,
          fullName: `${employee.firstName} ${employee.lastName}`,
          createdAt: new Date().toISOString()
        };
        this.fallbackEmployees.unshift(newEmp);
        return of(newEmp);
      })
    );
  }

  getEmployees(filterParams?: EmployeeFilterParams): Observable<PageResponse<Employee>> {
    let params = new HttpParams();
    if (filterParams?.query) params = params.set('query', filterParams.query);
    if (filterParams?.departmentId) params = params.set('departmentId', filterParams.departmentId.toString());
    if (filterParams?.status) params = params.set('status', filterParams.status);
    if (filterParams?.designation) params = params.set('designation', filterParams.designation);
    if (filterParams?.sortBy) params = params.set('sortBy', filterParams.sortBy);
    if (filterParams?.sortDir) params = params.set('sortDir', filterParams.sortDir);
    if (filterParams?.page !== undefined) params = params.set('page', filterParams.page.toString());
    if (filterParams?.size !== undefined) params = params.set('size', filterParams.size.toString());

    return this.http.get<ApiResponse<PageResponse<Employee>>>(this.baseUrl, { params }).pipe(
      map(res => res.data),
      catchError(() => {
        let filtered = [...this.fallbackEmployees];
        if (filterParams?.query) {
          const q = filterParams.query.toLowerCase();
          filtered = filtered.filter(e => 
            e.firstName.toLowerCase().includes(q) ||
            e.lastName.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            (e.employeeCode && e.employeeCode.toLowerCase().includes(q)) ||
            e.designation.toLowerCase().includes(q)
          );
        }
        if (filterParams?.departmentId) {
          filtered = filtered.filter(e => e.departmentId === filterParams.departmentId);
        }
        if (filterParams?.status) {
          filtered = filtered.filter(e => e.status === filterParams.status);
        }
        
        const page = filterParams?.page || 0;
        const size = filterParams?.size || 10;
        const start = page * size;
        const paginated = filtered.slice(start, start + size);

        return of({
          content: paginated,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size),
          size,
          number: page,
          first: page === 0,
          last: start + size >= filtered.length,
          empty: paginated.length === 0
        });
      })
    );
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(() => {
        const emp = this.fallbackEmployees.find(e => e.id === id);
        return emp ? of(emp) : throwError(() => new Error('Employee not found'));
      })
    );
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, employee).pipe(
      map(res => res.data),
      catchError(() => {
        const idx = this.fallbackEmployees.findIndex(e => e.id === id);
        if (idx !== -1) {
          this.fallbackEmployees[idx] = { 
            ...this.fallbackEmployees[idx], 
            ...employee, 
            fullName: `${employee.firstName} ${employee.lastName}` 
          };
          return of(this.fallbackEmployees[idx]);
        }
        return of(employee);
      })
    );
  }

  updateStatus(id: number, status: EmploymentStatus): Observable<Employee> {
    return this.http.patch<ApiResponse<Employee>>(`${this.baseUrl}/${id}/status`, { status }).pipe(
      map(res => res.data),
      catchError(() => {
        const emp = this.fallbackEmployees.find(e => e.id === id);
        if (emp) {
          emp.status = status;
          return of(emp);
        }
        return throwError(() => new Error('Employee not found'));
      })
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => void 0),
      catchError(() => {
        this.fallbackEmployees = this.fallbackEmployees.filter(e => e.id !== id);
        return of(void 0);
      })
    );
  }
}
