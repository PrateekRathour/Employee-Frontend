import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
import { Department, DepartmentSearchParams } from '../../models/department.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-department-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dept-dialog-container">
      <div class="dialog-header">
        <div class="icon-circle">
          <mat-icon>apartment</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data?.department ? 'Edit Department' : 'Create New Department' }}</h2>
          <p class="dialog-sub">Organize workforce by corporate department and location</p>
        </div>
      </div>

      <form [formGroup]="deptForm" (ngSubmit)="save()" class="dept-form">
        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Department Name</mat-label>
            <input matInput formControlName="name" placeholder="e.g. Artificial Intelligence" required />
            <mat-error *ngIf="deptForm.get('name')?.hasError('required')">Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Department Code</mat-label>
            <input matInput formControlName="code" placeholder="e.g. AI" style="text-transform: uppercase" required />
            <mat-error *ngIf="deptForm.get('code')?.hasError('required')">Code is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row-2">
          <mat-form-field appearance="outline">
            <mat-label>Head of Department</mat-label>
            <input matInput formControlName="headOfDepartment" placeholder="Director / VP Name" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Office Location</mat-label>
            <input matInput formControlName="location" placeholder="e.g. Building A - Floor 4" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Department Description</mat-label>
          <textarea matInput rows="3" formControlName="description" placeholder="Brief mandate and responsibilities..."></textarea>
        </mat-form-field>

        <div class="dialog-actions">
          <button mat-button type="button" (click)="cancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="deptForm.invalid || loading">
            {{ loading ? 'Saving...' : 'Save Department' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dept-dialog-container { padding: 12px; }
    .dialog-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
    .icon-circle {
      width: 44px; height: 44px; border-radius: 12px;
      background: #e0e7ff; color: #4338ca;
      display: flex; align-items: center; justify-content: center;
    }
    h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }
    .dialog-sub { margin: 2px 0 0 0; font-size: 0.8125rem; color: #64748b; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .dialog-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
  `]
})
export class AddDepartmentDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<AddDepartmentDialogComponent>);
  public data = inject<{ department?: Department }>(MAT_DIALOG_DATA, { optional: true });

  loading = false;
  deptForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
    headOfDepartment: [''],
    location: [''],
    description: ['']
  });

  ngOnInit(): void {
    if (this.data?.department) {
      this.deptForm.patchValue(this.data.department);
    }
  }

  save(): void {
    if (this.deptForm.invalid) return;
    this.dialogRef.close(this.deptForm.value);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Departments & Teams</h1>
          <p class="page-subtitle">Manage organizational units, head of departments, and team allocations</p>
        </div>
        <button mat-flat-button color="primary" class="add-btn" (click)="openAddDepartment()">
          <mat-icon>add_business</mat-icon>
          <span>Add Department</span>
        </button>
      </div>

      <!-- Search Bar -->
      <div class="search-card wp-card">
        <div class="search-flex">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search departments by name or code</mat-label>
            <input matInput [(ngModel)]="searchQuery" (keyup.enter)="loadDepartments()" placeholder="e.g. Engineering, HR, FIN..." />
            <mat-icon matPrefix>search</mat-icon>
            <button *ngIf="searchQuery" matSuffix mat-icon-button (click)="searchQuery=''; loadDepartments()">
              <mat-icon>close</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="location-field">
            <mat-label>Filter Location</mat-label>
            <input matInput [(ngModel)]="locationQuery" (keyup.enter)="loadDepartments()" placeholder="Building / Floor..." />
            <mat-icon matPrefix>place</mat-icon>
          </mat-form-field>

          <button mat-flat-button color="primary" class="search-btn" (click)="loadDepartments()">
            <mat-icon>filter_list</mat-icon>
            <span>Search</span>
          </button>
        </div>
      </div>

      <!-- Departments Grid -->
      <div class="departments-grid">
        <div class="dept-card wp-card" *ngFor="let dept of departments">
          
          <div class="dept-card-header">
            <div class="dept-icon-box">
              <mat-icon>apartment</mat-icon>
            </div>
            <div class="dept-header-text">
              <div class="code-pill">{{ dept.code }}</div>
              <h2 class="dept-name">{{ dept.name }}</h2>
            </div>
          </div>

          <p class="dept-desc">{{ dept.description || 'Core organizational business division and team.' }}</p>

          <div class="dept-meta-grid">
            <div class="meta-item">
              <span class="meta-label">HEAD OF DEPARTMENT</span>
              <span class="meta-val">
                <mat-icon class="meta-icon">person</mat-icon>
                {{ dept.headOfDepartment || 'Unassigned' }}
              </span>
            </div>

            <div class="meta-item">
              <span class="meta-label">LOCATION</span>
              <span class="meta-val">
                <mat-icon class="meta-icon">location_on</mat-icon>
                {{ dept.location || 'HQ Main Campus' }}
              </span>
            </div>
          </div>

          <div class="dept-stats-row">
            <div class="stat-cell">
              <span class="stat-number">{{ dept.employeeCount || 0 }}</span>
              <span class="stat-tag">Employees</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-cell">
              <span class="stat-number">\${{ (dept.averageSalary || 0) | number:'1.0-0' }}</span>
              <span class="stat-tag">Avg Salary</span>
            </div>
          </div>

          <div class="dept-card-footer">
            <button mat-stroked-button class="view-members-btn" (click)="viewMembers(dept)">
              <mat-icon>people</mat-icon>
              <span>View Roster</span>
            </button>

            <div class="actions-right">
              <button mat-icon-button (click)="openEditDepartment(dept)" title="Edit Department">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteDepartment(dept)" title="Delete Department">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
          </div>

        </div>
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
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 4px 0 0 0;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700 !important;
      height: 44px !important;
      border-radius: var(--radius-md) !important;
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%) !important;
      color: white !important;
    }

    .search-card {
      padding: 16px 20px;
    }

    .search-flex {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 2;
      min-width: 250px;
    }

    .location-field {
      flex: 1;
      min-width: 180px;
    }

    .search-btn {
      height: 52px;
      margin-bottom: 22px;
      border-radius: 8px;
      font-weight: 600;
    }

    .departments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }

    .dept-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-top: 4px solid var(--primary-500);
      background: #ffffff;
      padding: 24px;
      border-radius: var(--radius-lg);
    }

    .dept-card-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 12px;
    }

    .dept-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .code-pill {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      background: #e0e7ff;
      color: var(--primary-800);
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    .dept-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .dept-desc {
      font-size: 0.84375rem;
      color: #64748b;
      line-height: 1.5;
      min-height: 40px;
      margin-bottom: 16px;
    }

    .dept-meta-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .meta-label {
      font-size: 0.65rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .meta-val {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .meta-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #64748b;
    }

    .dept-stats-row {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 12px 0;
      border-top: 1px solid var(--border-subtle);
      border-bottom: 1px solid var(--border-subtle);
      margin-bottom: 16px;
    }

    .stat-cell {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .stat-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .stat-divider {
      width: 1px;
      height: 32px;
      background: var(--border-subtle);
    }

    .dept-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .view-members-btn {
      font-weight: 600;
      border-radius: 8px;
    }

    .actions-right {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  departments: Department[] = [
    { id: 1, name: 'Engineering & Technology', code: 'ENG', description: 'Core software engineering, cloud architecture, devops, and infrastructure', location: 'Building A - Floor 4', headOfDepartment: 'Dr. Alexander Wright', employeeCount: 3, averageSalary: 117666 },
    { id: 2, name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee lifecycle, workplace culture, and compliance', location: 'Building B - Floor 2', headOfDepartment: 'Elena Vance', employeeCount: 2, averageSalary: 106500 },
    { id: 3, name: 'Product & UI/UX Design', code: 'DES', description: 'User research, interface design, design systems, and product strategy', location: 'Building A - Floor 3', headOfDepartment: 'Marcus Chen', employeeCount: 1, averageSalary: 125000 },
    { id: 4, name: 'Global Marketing & Growth', code: 'MKT', description: 'Brand positioning, digital marketing, demand generation, and PR', location: 'Building C - Floor 1', headOfDepartment: 'Sophia Martinez', employeeCount: 0, averageSalary: 0 },
    { id: 5, name: 'Finance & Operations', code: 'FIN', description: 'Corporate finance, auditing, payroll management, and forecasting', location: 'Building B - Floor 5', headOfDepartment: 'David Sterling', employeeCount: 0, averageSalary: 0 }
  ];
  searchQuery = '';
  locationQuery = '';

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    const params: DepartmentSearchParams = {
      query: this.searchQuery,
      location: this.locationQuery
    };

    this.departmentService.getDepartments(params).subscribe({
      next: (data) => {
        if (data) {
          this.departments = data;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  openAddDepartment(): void {
    const ref = this.dialog.open(AddDepartmentDialogComponent, {
      width: '550px'
    });

    ref.afterClosed().subscribe(val => {
      if (val) {
        this.departmentService.createDepartment(val).subscribe({
          next: (created) => {
            this.notificationService.success(`Department ${created.name} created!`);
            this.loadDepartments();
          },
          error: (err) => this.notificationService.error(err.error?.message || 'Creation failed')
        });
      }
    });
  }

  openEditDepartment(dept: Department): void {
    const ref = this.dialog.open(AddDepartmentDialogComponent, {
      width: '550px',
      data: { department: dept }
    });

    ref.afterClosed().subscribe(val => {
      if (val && dept.id) {
        this.departmentService.updateDepartment(dept.id, val).subscribe({
          next: () => {
            this.notificationService.success('Department updated successfully');
            this.loadDepartments();
          },
          error: (err) => this.notificationService.error(err.error?.message || 'Update failed')
        });
      }
    });
  }

  deleteDepartment(dept: Department): void {
    if (!dept.id) return;
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete ${dept.name} (${dept.code})?`,
        confirmText: 'Delete',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(confirmed => {
      if (confirmed && dept.id) {
        this.departmentService.deleteDepartment(dept.id).subscribe({
          next: () => {
            this.notificationService.success('Department deleted');
            this.loadDepartments();
          },
          error: (err) => this.notificationService.error(err.error?.message || 'Delete failed')
        });
      }
    });
  }

  viewMembers(dept: Department): void {
    this.router.navigate(['/employees'], { queryParams: { departmentId: dept.id } });
  }
}
