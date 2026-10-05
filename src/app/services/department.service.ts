import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { Department, DepartmentSearchParams } from '../models/department.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/departments';

  // In-memory fallback if backend is offline or starting
  private fallbackDepartments: Department[] = [
    { id: 1, name: 'Engineering & Technology', code: 'ENG', description: 'Core software engineering, cloud architecture, devops, and infrastructure', location: 'Building A - Floor 4', headOfDepartment: 'Dr. Alexander Wright', employeeCount: 4, averageSalary: 117666 },
    { id: 2, name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee lifecycle, workplace culture, and compliance', location: 'Building B - Floor 2', headOfDepartment: 'Elena Vance', employeeCount: 2, averageSalary: 106500 },
    { id: 3, name: 'Product & UI/UX Design', code: 'DES', description: 'User research, interface design, design systems, and product strategy', location: 'Building A - Floor 3', headOfDepartment: 'Marcus Chen', employeeCount: 2, averageSalary: 108500 },
    { id: 4, name: 'Global Marketing & Growth', code: 'MKT', description: 'Brand positioning, digital marketing, demand generation, and PR', location: 'Building C - Floor 1', headOfDepartment: 'Sophia Martinez', employeeCount: 1, averageSalary: 130000 },
    { id: 5, name: 'Finance & Operations', code: 'FIN', description: 'Corporate finance, auditing, payroll management, and forecasting', location: 'Building B - Floor 5', headOfDepartment: 'David Sterling', employeeCount: 1, averageSalary: 140000 }
  ];

  getDepartments(searchParams?: DepartmentSearchParams): Observable<Department[]> {
    let params = new HttpParams();
    if (searchParams?.query) params = params.set('query', searchParams.query);
    if (searchParams?.location) params = params.set('location', searchParams.location);

    return this.http.get<ApiResponse<Department[]>>(this.baseUrl, { params }).pipe(
      map(res => res.data),
      catchError(() => {
        let list = [...this.fallbackDepartments];
        if (searchParams?.query) {
          const q = searchParams.query.toLowerCase();
          list = list.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q));
        }
        if (searchParams?.location) {
          const loc = searchParams.location.toLowerCase();
          list = list.filter(d => d.location?.toLowerCase().includes(loc));
        }
        return of(list);
      })
    );
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<ApiResponse<Department>>(`${this.baseUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(() => {
        const found = this.fallbackDepartments.find(d => d.id === id);
        return found ? of(found) : throwError(() => new Error('Department not found'));
      })
    );
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<ApiResponse<Department>>(this.baseUrl, department).pipe(
      map(res => res.data),
      catchError(err => {
        const newDept = { ...department, id: Date.now(), employeeCount: 0, averageSalary: 0 };
        this.fallbackDepartments.push(newDept);
        return of(newDept);
      })
    );
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<ApiResponse<Department>>(`${this.baseUrl}/${id}`, department).pipe(
      map(res => res.data),
      catchError(() => {
        const idx = this.fallbackDepartments.findIndex(d => d.id === id);
        if (idx !== -1) {
          this.fallbackDepartments[idx] = { ...this.fallbackDepartments[idx], ...department };
          return of(this.fallbackDepartments[idx]);
        }
        return of(department);
      })
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(() => void 0),
      catchError(() => {
        this.fallbackDepartments = this.fallbackDepartments.filter(d => d.id !== id);
        return of(void 0);
      })
    );
  }
}
