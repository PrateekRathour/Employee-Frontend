import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
import { Employee, EmployeeFilterParams, EmploymentStatus } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { EmployeeOnboardingComponent } from '../employee-onboarding/employee-onboarding.component';
import { EmployeeProfileComponent } from '../employee-profile/employee-profile.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">Employee Directory</h1>
          <p class="page-subtitle">Manage organization staff, view profiles, track onboarding progress and status</p>
        </div>
        <div class="header-right">
          <button mat-flat-button color="primary" class="onboard-action-btn" (click)="openOnboarding()">
            <mat-icon>person_add</mat-icon>
            <span>Onboard Employee</span>
          </button>
        </div>
      </div>

      <!-- Filters & Search Bar Card -->
      <div class="filters-card wp-card">
        <div class="filters-row">
          
          <!-- Search Input -->
          <div class="search-field-wrap">
            <mat-form-field appearance="outline" class="search-input">
              <mat-label>Search employees</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="applyFilters()" placeholder="Search by name, code, email, designation..." />
              <mat-icon matPrefix class="search-icon">search</mat-icon>
              <button *ngIf="searchQuery" matSuffix mat-icon-button aria-label="Clear" (click)="searchQuery=''; applyFilters()">
                <mat-icon>close</mat-icon>
              </button>
            </mat-form-field>
          </div>

          <!-- Department Filter -->
          <div class="dept-filter-wrap">
            <mat-form-field appearance="outline">
              <mat-label>All Departments</mat-label>
              <mat-select [(ngModel)]="selectedDepartmentId" (selectionChange)="applyFilters()">
                <mat-option [value]="undefined">All Departments</mat-option>
                <mat-option *ngFor="let d of departments" [value]="d.id">
                  {{ d.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Status Filter Chips -->
          <div class="status-chips-wrap">
            <button class="filter-chip" [class.active]="selectedStatus === ''" (click)="setStatusFilter('')">
              All ({{ totalElements }})
            </button>
            <button class="filter-chip chip-active" [class.active]="selectedStatus === 'ACTIVE'" (click)="setStatusFilter('ACTIVE')">
              Active
            </button>
            <button class="filter-chip chip-onboard" [class.active]="selectedStatus === 'ONBOARDING'" (click)="setStatusFilter('ONBOARDING')">
              Onboarding
            </button>
            <button class="filter-chip chip-probation" [class.active]="selectedStatus === 'PROBATION'" (click)="setStatusFilter('PROBATION')">
              Probation
            </button>
            <button class="filter-chip chip-leave" [class.active]="selectedStatus === 'ON_LEAVE'" (click)="setStatusFilter('ON_LEAVE')">
              On Leave
            </button>
          </div>

          <!-- Reset Button -->
          <button mat-button class="reset-btn" (click)="resetFilters()" title="Reset All Filters">
            <mat-icon>restart_alt</mat-icon>
            <span>Reset</span>
          </button>

        </div>
      </div>

      <!-- Employees Table Card -->
      <div class="table-card wp-card">
        <div class="table-responsive">
          <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSortChange($event)" class="employee-table">

            <!-- Employee Column (Avatar + Info) -->
            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="firstName">EMPLOYEE</th>
              <td mat-cell *matCellDef="let emp" class="employee-cell" (click)="viewProfile(emp)">
                <div class="employee-info-lockup">
                  <div class="avatar-container">
                    <img [src]="emp.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + emp.firstName" [alt]="emp.fullName" class="emp-avatar" />
                    <span class="status-bullet" [ngClass]="'status-' + emp.status.toLowerCase()"></span>
                  </div>
                  <div class="emp-text-details">
                    <div class="emp-name">{{ emp.fullName || (emp.firstName + ' ' + emp.lastName) }}</div>
                    <div class="emp-meta">
                      <span class="code-tag">{{ emp.employeeCode }}</span>
                      <span class="email-text">{{ emp.email }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Department & Role Column -->
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="departmentId">DEPARTMENT & ROLE</th>
              <td mat-cell *matCellDef="let emp">
                <div class="role-cell-wrap">
                  <div class="emp-designation">{{ emp.designation }}</div>
                  <div class="dept-badge">{{ emp.departmentName || 'Engineering' }}</div>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="status">STATUS</th>
              <td mat-cell *matCellDef="let emp">
                <span class="badge" [ngClass]="'badge-' + emp.status.toLowerCase()">
                  {{ emp.status }}
                </span>
              </td>
            </ng-container>

            <!-- Salary Column -->
            <ng-container matColumnDef="salary">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="salary">SALARY</th>
              <td mat-cell *matCellDef="let emp" class="salary-cell">
                \${{ emp.salary | number:'1.0-0' }}
                <span class="salary-frequency">/yr</span>
              </td>
            </ng-container>

            <!-- Joining Date Column -->
            <ng-container matColumnDef="joiningDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header="joiningDate">JOINING DATE</th>
              <td mat-cell *matCellDef="let emp" class="date-cell">
                {{ emp.joiningDate | date:'mediumDate' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">ACTIONS</th>
              <td mat-cell *matCellDef="let emp" class="actions-cell">
                <button mat-icon-button (click)="viewProfile(emp); $event.stopPropagation()" title="View Profile" class="action-btn">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="actionMenu" (click)="$event.stopPropagation()" class="action-btn">
                  <mat-icon>more_vert</mat-icon>
                </button>

                <mat-menu #actionMenu="matMenu" class="action-popup-menu">
                  <button mat-menu-item (click)="viewProfile(emp)">
                    <mat-icon>account_box</mat-icon>
                    <span>View Profile</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="updateStatus(emp, 'ACTIVE')">
                    <mat-icon class="text-emerald">check_circle</mat-icon>
                    <span>Set Active</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(emp, 'ON_LEAVE')">
                    <mat-icon class="text-violet">pause_circle</mat-icon>
                    <span>Set On Leave</span>
                  </button>
                  <button mat-menu-item (click)="updateStatus(emp, 'PROBATION')">
                    <mat-icon class="text-amber">hourglass_top</mat-icon>
                    <span>Set Probation</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteEmployee(emp)" class="text-danger">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete Record</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="interactive-row"></tr>

            <!-- No Data Found Row -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">
                <div class="empty-state-wrap">
                  <mat-icon class="empty-icon">search_off</mat-icon>
                  <h3>No Employees Found</h3>
                  <p>No matching employee profiles found for the selected filter criteria.</p>
                  <button mat-stroked-button color="primary" (click)="resetFilters()">Clear Filters</button>
                </div>
              </td>
            </tr>

          </table>
        </div>

        <!-- Paginator -->
        <mat-paginator 
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
          class="custom-paginator">
        </mat-paginator>
      </div>

    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.03em;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 4px 0 0 0;
    }

    .onboard-action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%) !important;
      color: white !important;
      font-weight: 700 !important;
      padding: 0 20px !important;
      height: 44px !important;
      border-radius: var(--radius-md) !important;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
    }

    .filters-card {
      padding: 16px 20px;
    }

    .filters-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .search-field-wrap {
      flex: 1;
      min-width: 260px;
    }

    .dept-filter-wrap {
      width: 220px;
    }

    .status-chips-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-chip {
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid var(--border-subtle);
      background: #ffffff;
      color: #64748b;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .filter-chip:hover {
      background: #f1f5f9;
      color: var(--text-primary);
    }

    .filter-chip.active {
      background: #0f172a;
      color: #ffffff;
      border-color: #0f172a;
    }

    .reset-btn {
      color: #64748b;
      font-weight: 600;
    }

    .table-card {
      padding: 0;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .employee-table {
      width: 100%;
    }

    .employee-cell {
      cursor: pointer;
    }

    .employee-info-lockup {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar-container {
      position: relative;
    }

    .emp-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--border-subtle);
    }

    .status-bullet {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid #ffffff;
    }

    .status-active { background: #10b981; }
    .status-onboarding { background: #3b82f6; }
    .status-probation { background: #f59e0b; }
    .status-on_leave { background: #8b5cf6; }
    .status-terminated { background: #ef4444; }

    .emp-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }

    .emp-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .code-tag {
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #475569;
      font-weight: 600;
    }

    .role-cell-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .emp-designation {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .dept-badge {
      font-size: 0.75rem;
      color: var(--primary-700);
      background: var(--primary-50);
      display: inline-block;
      width: fit-content;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;
    }

    .salary-cell {
      font-weight: 700;
      color: var(--text-primary);
    }

    .salary-frequency {
      font-size: 0.7rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .date-cell {
      color: #64748b;
      font-size: 0.8125rem;
    }

    .actions-header {
      text-align: right !important;
    }

    .actions-cell {
      text-align: right;
    }

    .action-btn {
      color: #64748b;
    }

    .interactive-row {
      transition: background-color var(--transition-fast);
      cursor: pointer;
    }

    .interactive-row:hover {
      background-color: #f8fafc;
    }

    .empty-state-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #94a3b8;
      margin-bottom: 12px;
    }

    .empty-state-wrap h3 {
      font-size: 1.125rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .empty-state-wrap p {
      color: #64748b;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }

    .text-emerald { color: #10b981; }
    .text-violet { color: #8b5cf6; }
    .text-amber { color: #f59e0b; }
    .text-danger { color: #ef4444; }

    .custom-paginator {
      background: transparent;
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['employee', 'department', 'status', 'salary', 'joiningDate', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  
  departments: Department[] = [];
  searchQuery = '';
  selectedDepartmentId?: number;
  selectedStatus: EmploymentStatus | '' = '';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'desc';
  pageIndex = 0;
  pageSize = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(d => this.departments = d);
  }

  loadEmployees(): void {
    const params: EmployeeFilterParams = {
      query: this.searchQuery,
      departmentId: this.selectedDepartmentId,
      status: this.selectedStatus,
      sortBy: this.sortBy,
      sortDir: this.sortDir,
      page: this.pageIndex,
      size: this.pageSize
    };

    this.employeeService.getEmployees(params).subscribe({
      next: (res) => {
        this.dataSource.data = res.content;
        this.totalElements = res.totalElements;
      },
      error: () => {
        this.notificationService.error('Failed to load employee directory');
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.loadEmployees();
  }

  setStatusFilter(status: EmploymentStatus | ''): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDepartmentId = undefined;
    this.selectedStatus = '';
    this.sortBy = 'id';
    this.sortDir = 'desc';
    this.pageIndex = 0;
    this.loadEmployees();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  onSortChange(sort: Sort): void {
    this.sortBy = sort.active || 'id';
    this.sortDir = (sort.direction as 'asc' | 'desc') || 'desc';
    this.loadEmployees();
  }

  openOnboarding(): void {
    const dialogRef = this.dialog.open(EmployeeOnboardingComponent, {
      width: '850px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      panelClass: 'modern-dialog-pane'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadEmployees();
      }
    });
  }

  viewProfile(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeProfileComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      data: { employee },
      panelClass: 'modern-dialog-pane'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadEmployees();
    });
  }

  updateStatus(employee: Employee, status: EmploymentStatus): void {
    if (!employee.id) return;
    this.employeeService.updateStatus(employee.id, status).subscribe({
      next: () => {
        this.notificationService.success(`${employee.fullName}'s status updated to ${status}`);
        this.loadEmployees();
      },
      error: () => this.notificationService.error('Failed to update status')
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id) return;
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to permanently delete ${employee.fullName || employee.firstName}?`,
        confirmText: 'Delete',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(confirmed => {
      if (confirmed && employee.id) {
        this.employeeService.deleteEmployee(employee.id).subscribe({
          next: () => {
            this.notificationService.success('Employee deleted successfully');
            this.loadEmployees();
          },
          error: () => this.notificationService.error('Failed to delete employee')
        });
      }
    });
  }
}
