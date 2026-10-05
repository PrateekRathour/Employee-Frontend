import { Component, Inject, OnInit, Optional, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Employee, EmploymentStatus } from '../../models/employee.model';
import { Department } from '../../models/department.model';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="profile-modal-container" *ngIf="employee">
      <!-- Profile Header Banner -->
      <div class="profile-header-banner">
        <div class="banner-gradient"></div>
        <div class="profile-header-content">
          <div class="avatar-wrap">
            <img [src]="employee.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + employee.firstName" 
                 [alt]="employee.fullName" class="profile-avatar" />
            <span class="status-indicator-dot" [ngClass]="'status-' + employee.status.toLowerCase()"></span>
          </div>

          <div class="profile-identity">
            <div class="name-row">
              <h1 class="employee-name">{{ employee.fullName || (employee.firstName + ' ' + employee.lastName) }}</h1>
              <span class="emp-code-badge">{{ employee.employeeCode || 'EMP-2025' }}</span>
            </div>
            <p class="employee-title">{{ employee.designation }} • <strong>{{ employee.departmentName || 'Engineering' }}</strong></p>
          </div>

          <div class="profile-header-actions">
            <mat-form-field appearance="outline" class="status-select-field">
              <mat-label>Status</mat-label>
              <mat-select [value]="employee.status" (selectionChange)="onStatusChange($event.value)">
                <mat-option value="ACTIVE">ACTIVE</mat-option>
                <mat-option value="ONBOARDING">ONBOARDING</mat-option>
                <mat-option value="PROBATION">PROBATION</mat-option>
                <mat-option value="ON_LEAVE">ON LEAVE</mat-option>
                <mat-option value="TERMINATED">TERMINATED</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-icon-button (click)="toggleEditMode()" [color]="editMode ? 'primary' : 'default'" class="edit-toggle-btn" title="Toggle Edit Mode">
              <mat-icon>{{ editMode ? 'visibility' : 'edit' }}</mat-icon>
            </button>
            <button mat-icon-button (click)="closeDialog()" class="close-btn" title="Close">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Stats Strip -->
      <div class="stats-strip">
        <div class="stat-pill">
          <mat-icon>payments</mat-icon>
          <div>
            <div class="stat-label">Annual Salary</div>
            <div class="stat-value">\${{ employee.salary | number:'1.2-2' }}</div>
          </div>
        </div>

        <div class="stat-pill">
          <mat-icon>event</mat-icon>
          <div>
            <div class="stat-label">Joining Date</div>
            <div class="stat-value">{{ employee.joiningDate | date:'mediumDate' }}</div>
          </div>
        </div>

        <div class="stat-pill">
          <mat-icon>apartment</mat-icon>
          <div>
            <div class="stat-label">Department Code</div>
            <div class="stat-value">{{ employee.departmentCode || 'ENG' }}</div>
          </div>
        </div>
      </div>

      <!-- Main Profile Body -->
      <div class="profile-content-body" *ngIf="!editMode">
        <mat-tab-group class="modern-tabs">
          
          <!-- Tab 1: Overview & Contact -->
          <mat-tab label="Overview & Contact">
            <div class="tab-pane">
              <div class="details-grid">
                
                <div class="info-group">
                  <span class="info-label">Email Address</span>
                  <div class="info-value">
                    <mat-icon class="inline-icon">email</mat-icon>
                    <a [href]="'mailto:' + employee.email">{{ employee.email }}</a>
                  </div>
                </div>

                <div class="info-group">
                  <span class="info-label">Phone Number</span>
                  <div class="info-value">
                    <mat-icon class="inline-icon">phone</mat-icon>
                    <span>{{ employee.phone || 'Not provided' }}</span>
                  </div>
                </div>

                <div class="info-group">
                  <span class="info-label">Date of Birth</span>
                  <div class="info-value">
                    <mat-icon class="inline-icon">cake</mat-icon>
                    <span>{{ (employee.dateOfBirth | date:'mediumDate') || 'Not provided' }}</span>
                  </div>
                </div>

                <div class="info-group">
                  <span class="info-label">Emergency Contact</span>
                  <div class="info-value">
                    <mat-icon class="inline-icon">contact_emergency</mat-icon>
                    <span>{{ employee.emergencyContact || 'Not provided' }}</span>
                  </div>
                </div>

                <div class="info-group full-width">
                  <span class="info-label">Address</span>
                  <div class="info-value">
                    <mat-icon class="inline-icon">place</mat-icon>
                    <span>{{ employee.address || 'Not provided' }}</span>
                  </div>
                </div>

              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Skills & Competencies -->
          <mat-tab label="Skills & Expertise">
            <div class="tab-pane">
              <h3 class="pane-title">Verified Core Competencies</h3>
              <div class="skills-cloud">
                <span class="skill-tag" *ngFor="let s of employee.skills">
                  <mat-icon>check_circle</mat-icon>
                  {{ s }}
                </span>
                <span *ngIf="!employee.skills || employee.skills.length === 0" class="no-data-text">
                  No skills listed for this employee yet.
                </span>
              </div>
            </div>
          </mat-tab>

        </mat-tab-group>
      </div>

      <!-- Edit Mode Form -->
      <div class="profile-content-body" *ngIf="editMode">
        <form [formGroup]="editForm" (ngSubmit)="saveProfile()" class="edit-form">
          <div class="edit-grid">
            <mat-form-field appearance="outline">
              <mat-label>First Name</mat-label>
              <input matInput formControlName="firstName" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Designation</mat-label>
              <input matInput formControlName="designation" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <mat-select formControlName="departmentId" required>
                <mat-option *ngFor="let dept of departments" [value]="dept.id">
                  {{ dept.name }}
                </mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Salary ($)</mat-label>
              <input matInput type="number" formControlName="salary" required />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Emergency Contact</mat-label>
              <input matInput formControlName="emergencyContact" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" />
          </mat-form-field>

          <div class="edit-actions">
            <button mat-button type="button" (click)="toggleEditMode()">Cancel</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="editForm.invalid">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <!-- Footer with Delete / Archive Action -->
      <div class="profile-footer">
        <button mat-button color="warn" (click)="deleteEmployee()" class="delete-btn">
          <mat-icon>delete_outline</mat-icon>
          <span>Remove Employee</span>
        </button>
        <button mat-flat-button color="primary" (click)="closeDialog()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    .profile-modal-container {
      background: #ffffff;
      border-radius: var(--radius-xl);
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .profile-header-banner {
      position: relative;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      color: white;
      padding: 30px 24px 20px 24px;
    }

    .profile-header-content {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    .avatar-wrap {
      position: relative;
    }

    .profile-avatar {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .status-indicator-dot {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #ffffff;
    }

    .status-active { background: #10b981; }
    .status-onboarding { background: #3b82f6; }
    .status-probation { background: #f59e0b; }
    .status-on_leave { background: #8b5cf6; }
    .status-terminated { background: #ef4444; }

    .profile-identity {
      flex: 1;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .employee-name {
      font-size: 1.5rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      line-height: 1.2;
    }

    .emp-code-badge {
      font-size: 0.75rem;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      padding: 3px 8px;
      border-radius: 6px;
      color: #e0e7ff;
    }

    .employee-title {
      font-size: 0.9375rem;
      color: #c7d2fe;
      margin: 4px 0 0 0;
    }

    .profile-header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-select-field {
      width: 140px;
    }

    .status-select-field ::ng-deep .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.15) !important;
      border-radius: 8px;
    }

    .status-select-field ::ng-deep .mat-mdc-select-value {
      color: #ffffff !important;
      font-weight: 700;
    }

    .edit-toggle-btn, .close-btn {
      color: #ffffff;
    }

    .stats-strip {
      display: flex;
      background: #f8fafc;
      border-bottom: 1px solid var(--border-subtle);
      padding: 12px 24px;
      gap: 24px;
    }

    .stat-pill {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stat-pill mat-icon {
      color: var(--primary-600);
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .stat-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }

    .stat-value {
      font-size: 0.9375rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .profile-content-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .tab-pane {
      padding: 20px 0;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .info-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-group.full-width {
      grid-column: span 2;
    }

    .info-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-value {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .info-value a {
      color: var(--primary-600);
      text-decoration: none;
    }

    .inline-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #94a3b8;
    }

    .skills-cloud {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 12px;
    }

    .skill-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #e0e7ff;
      color: var(--primary-800);
      font-weight: 700;
      font-size: 0.8125rem;
      padding: 6px 14px;
      border-radius: 20px;
    }

    .skill-tag mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary-600);
    }

    .edit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .edit-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .profile-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-top: 1px solid var(--border-subtle);
      background: #f8fafc;
    }

    .delete-btn {
      font-weight: 600;
    }
  `]
})
export class EmployeeProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  public dialogRef = inject(MatDialogRef<EmployeeProfileComponent>, { optional: true });
  public data = inject<{ employee: Employee }>(MAT_DIALOG_DATA, { optional: true });

  employee?: Employee;
  editMode = false;
  departments: Department[] = [];
  editForm!: FormGroup;

  ngOnInit(): void {
    if (this.data?.employee) {
      this.employee = this.data.employee;
      this.initEditForm();
    }
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe(d => this.departments = d);
  }

  initEditForm(): void {
    if (!this.employee) return;
    this.editForm = this.fb.group({
      firstName: [this.employee.firstName, [Validators.required]],
      lastName: [this.employee.lastName, [Validators.required]],
      email: [this.employee.email, [Validators.required, Validators.email]],
      phone: [this.employee.phone || ''],
      designation: [this.employee.designation, [Validators.required]],
      departmentId: [this.employee.departmentId, [Validators.required]],
      salary: [this.employee.salary, [Validators.required, Validators.min(1000)]],
      address: [this.employee.address || ''],
      emergencyContact: [this.employee.emergencyContact || '']
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.initEditForm();
    }
  }

  onStatusChange(newStatus: EmploymentStatus): void {
    if (!this.employee?.id) return;
    this.employeeService.updateStatus(this.employee.id, newStatus).subscribe({
      next: (updated) => {
        this.employee = updated;
        this.notificationService.success(`Status updated to ${newStatus}`);
      },
      error: () => this.notificationService.error('Failed to update status')
    });
  }

  saveProfile(): void {
    if (this.editForm.invalid || !this.employee?.id) return;
    const formVal = this.editForm.value;
    const payload = {
      ...this.employee,
      ...formVal
    };

    this.employeeService.updateEmployee(this.employee.id, payload).subscribe({
      next: (updated) => {
        this.employee = updated;
        this.editMode = false;
        this.notificationService.success('Employee profile updated successfully!');
      },
      error: (err) => this.notificationService.error(err.error?.message || 'Update failed')
    });
  }

  deleteEmployee(): void {
    if (!this.employee?.id) return;
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Employee Record',
        message: `Are you sure you want to delete ${this.employee.fullName}? This action is irreversible.`,
        confirmText: 'Delete Record',
        isDestructive: true
      }
    });

    confirmRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.employee?.id) {
        this.employeeService.deleteEmployee(this.employee.id).subscribe({
          next: () => {
            this.notificationService.success('Employee record deleted');
            if (this.dialogRef) {
              this.dialogRef.close({ deleted: true, id: this.employee?.id });
            }
          },
          error: () => this.notificationService.error('Failed to delete employee')
        });
      }
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close(this.employee);
    }
  }
}
