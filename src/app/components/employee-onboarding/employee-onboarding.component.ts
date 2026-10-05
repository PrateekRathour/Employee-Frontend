import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
import { Department } from '../../models/department.model';
import { EmploymentStatus } from '../../models/employee.model';

@Component({
  selector: 'app-employee-onboarding',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],

  template: `
    <div [class.page-wrapper]="!isDialog" [class.onboarding-modal-container]="isDialog">
      <div class="onboard-card-container wp-card" [class.no-card-shadow]="isDialog">
        
        <!-- Header -->
        <div class="modal-header">
          <div class="header-badge">
            <mat-icon>person_add</mat-icon>
          </div>
          <div class="header-titles">
            <h2 [attr.mat-dialog-title]="isDialog ? '' : null" class="dialog-main-title">
              Employee Onboarding
            </h2>
            <p class="dialog-subtitle">
              Enter employee details to automatically register staff, assign department, and generate employee ID code
            </p>
          </div>
          <button mat-icon-button type="button" *ngIf="isDialog" (click)="closeDialog()" class="close-btn" aria-label="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="onboardForm" (ngSubmit)="onSubmit()" class="onboarding-form">
          <div class="form-sections-grid" [class.dialog-scroll]="isDialog">
            
            <!-- Section 1: Basic Identity & Contact -->
            <div class="form-card">
              <div class="section-badge-header">
                <mat-icon class="section-icon">badge</mat-icon>
                <span>1. Personal & Contact Information</span>
              </div>

              <div class="form-row-2">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName" placeholder="e.g. Alex" required />
                  <mat-error *ngIf="onboardForm.get('firstName')?.hasError('required')">
                    First name is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName" placeholder="e.g. Morgan" required />
                  <mat-error *ngIf="onboardForm.get('lastName')?.hasError('required')">
                    Last name is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row-2">
                <mat-form-field appearance="outline">
                  <mat-label>Corporate Email</mat-label>
                  <input matInput type="email" formControlName="email" placeholder="alex.morgan@company.com" required />
                  <mat-icon matPrefix class="field-icon">email</mat-icon>
                  <mat-error *ngIf="onboardForm.get('email')?.hasError('required')">
                    Email is required
                  </mat-error>
                  <mat-error *ngIf="onboardForm.get('email')?.hasError('email')">
                    Enter a valid email address
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phone" placeholder="+1 555-0199" />
                  <mat-icon matPrefix class="field-icon">phone</mat-icon>
                </mat-form-field>
              </div>

              <div class="form-row-2">
                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput [matDatepicker]="dobPicker" formControlName="dateOfBirth" placeholder="MM/DD/YYYY" />
                  <mat-datepicker-toggle matIconSuffix [for]="dobPicker"></mat-datepicker-toggle>
                  <mat-datepicker #dobPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Emergency Contact</mat-label>
                  <input matInput formControlName="emergencyContact" placeholder="Contact Name & Number" />
                  <mat-icon matPrefix class="field-icon">contact_phone</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Residential Address</mat-label>
                <input matInput formControlName="address" placeholder="Street Address, City, State, ZIP" />
                <mat-icon matPrefix class="field-icon">home</mat-icon>
              </mat-form-field>
            </div>

            <!-- Section 2: Department & Role Assignment -->
            <div class="form-card">
              <div class="section-badge-header">
                <mat-icon class="section-icon">apartment</mat-icon>
                <span>2. Department & Employment Terms</span>
              </div>

              <div class="form-row-2">
                <mat-form-field appearance="outline">
                  <mat-label>Assigned Department</mat-label>
                  <mat-select formControlName="departmentId" required>
                    <mat-option *ngFor="let dept of departments" [value]="dept.id">
                      {{ dept.name }} ({{ dept.code }})
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="onboardForm.get('departmentId')?.hasError('required')">
                    Please select a department
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Designation / Job Title</mat-label>
                  <input matInput formControlName="designation" placeholder="e.g. Senior Software Engineer" required />
                  <mat-icon matPrefix class="field-icon">work_outline</mat-icon>
                  <mat-error *ngIf="onboardForm.get('designation')?.hasError('required')">
                    Designation is required
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row-3">
                <mat-form-field appearance="outline">
                  <mat-label>Employment Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="ONBOARDING">ONBOARDING</mat-option>
                    <mat-option value="ACTIVE">ACTIVE</mat-option>
                    <mat-option value="PROBATION">PROBATION</mat-option>
                    <mat-option value="ON_LEAVE">ON LEAVE</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Annual Salary ($)</mat-label>
                  <input matInput type="number" formControlName="salary" placeholder="85000" min="1000" step="500" required />
                  <span matPrefix class="currency-prefix">$</span>
                  <mat-error *ngIf="onboardForm.get('salary')?.hasError('required')">
                    Salary is required
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Joining Date</mat-label>
                  <input matInput [matDatepicker]="joinPicker" formControlName="joiningDate" required placeholder="MM/DD/YYYY" />
                  <mat-datepicker-toggle matIconSuffix [for]="joinPicker"></mat-datepicker-toggle>
                  <mat-datepicker #joinPicker></mat-datepicker>
                  <mat-error *ngIf="onboardForm.get('joiningDate')?.hasError('required')">
                    Joining date is required
                  </mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Avatar Image URL (Optional)</mat-label>
                <input matInput formControlName="avatarUrl" placeholder="https://..." />
                <mat-icon matPrefix class="field-icon">image</mat-icon>
              </mat-form-field>

              <!-- Skills Group -->
              <div class="skills-input-group">
                <label class="skills-label">Employee Skills & Technologies (Press Enter or Comma to add)</label>
                <mat-form-field appearance="outline" class="skills-field">
                  <mat-chip-grid #chipGrid aria-label="Skills">
                    <mat-chip-row *ngFor="let skill of skills" (removed)="removeSkill(skill)" class="custom-chip">
                      {{ skill }}
                      <button matChipRemove [attr.aria-label]="'remove ' + skill">
                        <mat-icon>cancel</mat-icon>
                      </button>
                    </mat-chip-row>
                    <input placeholder="Add skill (e.g. Java, Angular, AWS, Docker)..."
                           [matChipInputFor]="chipGrid"
                           [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                           (matChipInputTokenEnd)="addSkill($event)"/>
                  </mat-chip-grid>
                </mat-form-field>
              </div>

            </div>

          </div>

          <!-- Form Actions -->
          <div class="form-actions-footer">
            <button mat-button type="button" (click)="onCancel()" class="btn-cancel" [disabled]="submitting">
              Cancel
            </button>
            <button mat-flat-button color="primary" type="submit" class="btn-submit" [disabled]="onboardForm.invalid || submitting">
              <mat-icon *ngIf="!submitting">check_circle</mat-icon>
              <span *ngIf="!submitting">Complete Onboarding</span>
              <span *ngIf="submitting">Processing Registration...</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `,
  styles: [`
    .page-wrapper {
      padding: 24px;
      max-width: 1100px;
      margin: 0 auto;
    }

    .onboarding-modal-container {
      padding: 12px;
      background: #ffffff;
      border-radius: var(--radius-xl);
    }

    .onboard-card-container {
      background: #ffffff;
      border-radius: var(--radius-xl);
      padding: 28px;
    }

    .no-card-shadow {
      box-shadow: none !important;
      border: none !important;
      padding: 12px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
      position: relative;
    }

    .header-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary-600) 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .header-titles {
      flex: 1;
    }

    .dialog-main-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.2;
    }

    .dialog-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 4px 0 0 0;
    }

    .close-btn {
      color: var(--text-muted);
    }

    .form-sections-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .dialog-scroll {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 6px;
    }

    .form-card {
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px 22px;
    }

    .section-badge-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--primary-700);
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .section-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    .field-icon {
      color: #94a3b8;
      margin-right: 8px;
    }

    .currency-prefix {
      color: #64748b;
      font-weight: 600;
      margin-right: 4px;
    }

    .skills-input-group {
      margin-top: 4px;
    }

    .skills-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }

    .custom-chip {
      background: var(--primary-100) !important;
      color: var(--primary-800) !important;
      font-weight: 600;
    }

    .form-actions-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      padding-top: 20px;
      margin-top: 16px;
      border-top: 1px solid var(--border-subtle);
    }

    .btn-cancel {
      font-weight: 600;
      color: #64748b;
    }

    .btn-submit {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%) !important;
      color: white !important;
      font-weight: 700 !important;
      padding: 0 24px !important;
      height: 44px !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }

    @media (max-width: 768px) {
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EmployeeOnboardingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public dialogRef = inject(MatDialogRef<EmployeeOnboardingComponent>, { optional: true });

  isDialog = false;
  submitting = false;
  departments: Department[] = [
    { id: 1, name: 'Engineering & Technology', code: 'ENG' },
    { id: 2, name: 'Human Resources', code: 'HR' },
    { id: 3, name: 'Product & UI/UX Design', code: 'DES' },
    { id: 4, name: 'Global Marketing & Growth', code: 'MKT' },
    { id: 5, name: 'Finance & Operations', code: 'FIN' }
  ];
  skills: string[] = ['Java', 'Spring Boot', 'Angular', 'Docker'];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  onboardForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    dateOfBirth: [null],
    emergencyContact: [''],
    address: [''],
    departmentId: [1, [Validators.required]],
    designation: ['', [Validators.required]],
    status: ['ONBOARDING', [Validators.required]],
    salary: [85000, [Validators.required, Validators.min(1000)]],
    joiningDate: [new Date(), [Validators.required]],
    avatarUrl: ['']
  });

  ngOnInit(): void {
    this.isDialog = !!this.dialogRef;
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.departments = data;
          if (!this.onboardForm.get('departmentId')?.value) {
            this.onboardForm.patchValue({ departmentId: this.departments[0].id });
          }
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }


  addSkill(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.skills.includes(value)) {
      this.skills.push(value);
    }
    event.chipInput!.clear();
  }

  removeSkill(skill: string): void {
    const index = this.skills.indexOf(skill);
    if (index >= 0) {
      this.skills.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.onboardForm.invalid) {
      this.onboardForm.markAllAsTouched();
      this.notificationService.error('Please fix the validation errors in the form.');
      return;
    }

    this.submitting = true;
    const formVal = this.onboardForm.value;

    const payload = {
      ...formVal,
      joiningDate: formVal.joiningDate instanceof Date ? formVal.joiningDate.toISOString().split('T')[0] : formVal.joiningDate,
      dateOfBirth: formVal.dateOfBirth instanceof Date ? formVal.dateOfBirth.toISOString().split('T')[0] : formVal.dateOfBirth,
      skills: this.skills
    };

    this.employeeService.onboardEmployee(payload).subscribe({
      next: (created) => {
        this.submitting = false;
        this.notificationService.success(`Employee ${created.fullName} onboarded with Code: ${created.employeeCode || 'Registered'}!`);
        if (this.dialogRef) {
          this.dialogRef.close(created);
        } else {
          this.router.navigate(['/employees']);
        }
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.message || 'Failed to onboard employee. Please try again.';
        this.notificationService.error(msg);
      }
    });
  }

  onCancel(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/employees']);
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
