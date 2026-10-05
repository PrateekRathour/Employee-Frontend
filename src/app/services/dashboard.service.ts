import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, forkJoin } from 'rxjs';
import { DashboardStats } from '../models/dashboard.model';
import { ApiResponse } from '../models/api-response.model';
import { EmployeeService } from './employee.service';
import { DepartmentService } from './department.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private baseUrl = 'http://localhost:8080/api/dashboard/stats';

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(this.baseUrl).pipe(
      map(res => res.data),
      catchError(() => {
        // Compute dynamically from services state for instant zero-latency UI
        return forkJoin({
          empPage: this.employeeService.getEmployees({ size: 100 }),
          depts: this.departmentService.getDepartments()
        }).pipe(
          map(({ empPage, depts }) => {
            const employees = empPage.content;
            const total = employees.length;
            const active = employees.filter(e => e.status === 'ACTIVE').length;
            const onboarding = employees.filter(e => e.status === 'ONBOARDING').length;
            const probation = employees.filter(e => e.status === 'PROBATION').length;
            const onLeave = employees.filter(e => e.status === 'ON_LEAVE').length;

            const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
            const averageSalary = total > 0 ? Math.round(totalPayroll / total) : 0;

            const deptBreakdown = depts.map(d => {
              const deptEmps = employees.filter(e => e.departmentId === d.id);
              const deptSalary = deptEmps.reduce((sum, e) => sum + (Number(e.salary) || 0), 0);
              return {
                departmentId: d.id || 0,
                departmentName: d.name,
                departmentCode: d.code,
                employeeCount: deptEmps.length,
                totalSalary: deptSalary
              };
            });

            const recentJoiners = [...employees]
              .sort((a, b) => (b.joiningDate || '').localeCompare(a.joiningDate || ''))
              .slice(0, 5);

            const stats: DashboardStats = {
              totalEmployees: total,
              activeEmployees: active,
              onboardingEmployees: onboarding,
              probationEmployees: probation,
              onLeaveEmployees: onLeave,
              totalDepartments: depts.length,
              totalPayroll,
              averageSalary,
              statusDistribution: {
                ACTIVE: active,
                ONBOARDING: onboarding,
                PROBATION: probation,
                ON_LEAVE: onLeave,
                TERMINATED: employees.filter(e => e.status === 'TERMINATED').length
              },
              departmentBreakdown: deptBreakdown,
              recentJoiners
            };

            return stats;
          })
        );
      })
    );
  }
}
