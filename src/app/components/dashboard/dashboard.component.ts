import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.model';
import { Employee } from '../../models/employee.model';
import { EmployeeOnboardingComponent } from '../employee-onboarding/employee-onboarding.component';
import { EmployeeProfileComponent } from '../employee-profile/employee-profile.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Hero Banner -->
      <div class="hero-banner">
        <div class="hero-text">
          <h1 class="hero-title">Employee Management & Operations Dashboard</h1>
          <p class="hero-subtitle">Real-time workforce intelligence, onboarding lifecycle pipeline, and department analytics</p>
        </div>
        <div class="hero-actions">
          <button mat-flat-button color="primary" class="hero-btn" (click)="openOnboarding()">
            <mat-icon>person_add</mat-icon>
            <span>+ Onboard New Hire</span>
          </button>
        </div>
      </div>

      <!-- KPI Metric Cards Grid -->
      <div class="kpi-grid">
        
        <!-- Card 1: Total Employees -->
        <div class="kpi-card card-blue">
          <div class="kpi-header">
            <span class="kpi-title">TOTAL WORKFORCE</span>
            <div class="kpi-icon-wrap">
              <mat-icon>people_alt</mat-icon>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-main-val">{{ stats.totalEmployees }}</span>
            <span class="kpi-badge badge-green">+12% vs LY</span>
          </div>
          <p class="kpi-subtext"><strong>{{ stats.activeEmployees }}</strong> active full-time staff members</p>
        </div>

        <!-- Card 2: Onboarding Pipeline -->
        <div class="kpi-card card-indigo">
          <div class="kpi-header">
            <span class="kpi-title">ONBOARDING PIPELINE</span>
            <div class="kpi-icon-wrap">
              <mat-icon>how_to_reg</mat-icon>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-main-val">{{ stats.onboardingEmployees }}</span>
            <span class="kpi-badge badge-blue">{{ stats.probationEmployees }} in probation</span>
          </div>
          <p class="kpi-subtext">New recruits in onboarding phase</p>
        </div>

        <!-- Card 3: Total Departments -->
        <div class="kpi-card card-emerald">
          <div class="kpi-header">
            <span class="kpi-title">ACTIVE DEPARTMENTS</span>
            <div class="kpi-icon-wrap">
              <mat-icon>corporate_fare</mat-icon>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-main-val">{{ stats.totalDepartments }}</span>
            <span class="kpi-badge badge-purple">100% Operational</span>
          </div>
          <p class="kpi-subtext">Cross-functional business units</p>
        </div>

        <!-- Card 4: Total Payroll -->
        <div class="kpi-card card-amber">
          <div class="kpi-header">
            <span class="kpi-title">ANNUAL PAYROLL</span>
            <div class="kpi-icon-wrap">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
          </div>
          <div class="kpi-value-row">
            <span class="kpi-main-val">\${{ stats.totalPayroll | number:'1.0-0' }}</span>
            <span class="kpi-badge badge-amber">Avg \${{ stats.averageSalary | number:'1.0-0' }}</span>
          </div>
          <p class="kpi-subtext">Total active workforce compensation</p>
        </div>

      </div>

      <!-- Two-Column Visual Analytics Section -->
      <div class="analytics-grid">
        
        <!-- Left: Department Headcount Breakdown -->
        <div class="analytics-card wp-card">
          <div class="card-title-row">
            <div class="title-with-icon">
              <mat-icon class="title-icon text-indigo">bar_chart</mat-icon>
              <div>
                <h3 class="section-heading">Department Distribution & Headcount</h3>
                <p class="section-caption">Employee concentration across business functions</p>
              </div>
            </div>
            <button mat-button color="primary" routerLink="/departments">View Teams</button>
          </div>

          <div class="dept-bars-list">
            <div class="dept-bar-item" *ngFor="let d of stats.departmentBreakdown">
              <div class="bar-labels">
                <span class="dept-bar-name">
                  <span class="code-pill-sm">{{ d.departmentCode }}</span>
                  {{ d.departmentName }}
                </span>
                <span class="bar-stats-text">
                  <strong>{{ d.employeeCount }}</strong> staff ({{ getDeptPercentage(d.employeeCount) }}%)
                </span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="getDeptPercentage(d.employeeCount)"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Status Lifecycle & Quick Actions -->
        <div class="analytics-card wp-card">
          <div class="card-title-row">
            <div class="title-with-icon">
              <mat-icon class="title-icon text-emerald">donut_large</mat-icon>
              <div>
                <h3 class="section-heading">Employment Status Overview</h3>
                <p class="section-caption">Current active employee status distribution</p>
              </div>
            </div>
            <button mat-button color="primary" routerLink="/employees">Directory</button>
          </div>

          <div class="status-pills-container">
            <div class="status-summary-box status-box-active">
              <div class="box-count">{{ stats.activeEmployees }}</div>
              <div class="box-label">Active Staff</div>
              <mat-icon class="box-icon">verified</mat-icon>
            </div>

            <div class="status-summary-box status-box-onboard">
              <div class="box-count">{{ stats.onboardingEmployees }}</div>
              <div class="box-label">Onboarding</div>
              <mat-icon class="box-icon">schedule</mat-icon>
            </div>

            <div class="status-summary-box status-box-probation">
              <div class="box-count">{{ stats.probationEmployees }}</div>
              <div class="box-label">Probation</div>
              <mat-icon class="box-icon">timelapse</mat-icon>
            </div>

            <div class="status-summary-box status-box-leave">
              <div class="box-count">{{ stats.onLeaveEmployees }}</div>
              <div class="box-label">On Leave</div>
              <mat-icon class="box-icon">flight_takeoff</mat-icon>
            </div>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="quick-nav-boxes">
            <div class="nav-box" (click)="openOnboarding()">
              <mat-icon class="nav-box-icon">person_add_alt_1</mat-icon>
              <div>
                <div class="nav-box-title">Start Onboarding</div>
                <div class="nav-box-sub">Register new hires with automated employee code</div>
              </div>
            </div>

            <div class="nav-box" routerLink="/departments">
              <mat-icon class="nav-box-icon">domain_add</mat-icon>
              <div>
                <div class="nav-box-title">Search & Manage Departments</div>
                <div class="nav-box-sub">Browse team rosters, managers, and allocations</div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- Recent Onboardings Table Section -->
      <div class="recent-table-card wp-card" *ngIf="stats.recentJoiners.length">
        <div class="card-title-row">
          <div class="title-with-icon">
            <mat-icon class="title-icon text-indigo">recent_actors</mat-icon>
            <div>
              <h3 class="section-heading">Recent Onboarding Activities</h3>
              <p class="section-caption">Latest staff additions and profile registrations</p>
            </div>
          </div>
          <button mat-flat-button color="primary" routerLink="/employees">View Full Directory</button>
        </div>

        <div class="recent-list">
          <div class="recent-item" *ngFor="let emp of stats.recentJoiners" (click)="viewProfile(emp)">
            <img [src]="emp.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=' + emp.firstName" [alt]="emp.fullName" class="recent-avatar" />
            
            <div class="recent-info">
              <div class="recent-name-line">
                <span class="emp-name">{{ emp.fullName || (emp.firstName + ' ' + emp.lastName) }}</span>
                <span class="badge" [ngClass]="'badge-' + emp.status.toLowerCase()">{{ emp.status }}</span>
              </div>
              <div class="recent-role">{{ emp.designation }} • {{ emp.departmentName || 'Technology' }}</div>
            </div>

            <div class="recent-date">
              <mat-icon class="calendar-icon">calendar_today</mat-icon>
              <span>Joined {{ emp.joiningDate | date:'mediumDate' }}</span>
            </div>

            <button mat-icon-button (click)="viewProfile(emp); $event.stopPropagation()" title="View Profile">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .hero-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%);
      color: white;
      border-radius: var(--radius-lg);
      padding: 28px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.4);
    }

    .hero-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font-size: 0.9375rem;
      color: #cbd5e1;
      margin: 6px 0 0 0;
    }

    .hero-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%) !important;
      color: white !important;
      font-weight: 700 !important;
      height: 46px !important;
      padding: 0 22px !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
    }

    .kpi-card {
      background: #ffffff;
      border-radius: var(--radius-lg);
      padding: 22px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
      position: relative;
      overflow: hidden;
    }

    .kpi-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }

    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .kpi-title {
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .kpi-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-blue .kpi-icon-wrap { background: #e0f2fe; color: #0284c7; }
    .card-indigo .kpi-icon-wrap { background: #e0e7ff; color: #4338ca; }
    .card-emerald .kpi-icon-wrap { background: #d1fae5; color: #059669; }
    .card-amber .kpi-icon-wrap { background: #fef3c7; color: #d97706; }

    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      margin-bottom: 8px;
    }

    .kpi-main-val {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }

    .kpi-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
    }

    .badge-green { background: #ecfdf5; color: #065f46; }
    .badge-blue { background: #eff6ff; color: #1e40af; }
    .badge-purple { background: #faf5ff; color: #6b21a8; }
    .badge-amber { background: #fffbeb; color: #92400e; }

    .kpi-subtext {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
    }

    .text-indigo { color: #4f46e5; }
    .text-emerald { color: #10b981; }

    .section-heading {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .section-caption {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 2px 0 0 0;
    }

    .dept-bars-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .dept-bar-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bar-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
    }

    .dept-bar-name {
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .code-pill-sm {
      font-size: 0.6875rem;
      font-weight: 700;
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 4px;
      color: #475569;
    }

    .bar-stats-text {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .progress-track {
      height: 8px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-500) 0%, #a855f7 100%);
      border-radius: 9999px;
      transition: width 0.8s ease-in-out;
    }

    .status-pills-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }

    .status-summary-box {
      padding: 14px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .status-box-active { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
    .status-box-onboard { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .status-box-probation { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .status-box-leave { background: #faf5ff; color: #6b21a8; border: 1px solid #e9d5ff; }

    .box-count {
      font-size: 1.75rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }

    .box-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .box-icon {
      position: absolute;
      right: 12px;
      top: 14px;
      opacity: 0.25;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .quick-nav-boxes {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nav-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .nav-box:hover {
      background: #ffffff;
      border-color: var(--primary-400);
      box-shadow: var(--shadow-sm);
    }

    .nav-box-icon {
      color: var(--primary-600);
    }

    .nav-box-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .nav-box-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .recent-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .recent-item:hover {
      background: #ffffff;
      border-color: var(--primary-300);
      box-shadow: var(--shadow-sm);
    }

    .recent-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      object-fit: cover;
    }

    .recent-info {
      flex: 1;
    }

    .recent-name-line {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .emp-name {
      font-weight: 700;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }

    .recent-role {
      font-size: 0.8125rem;
      color: #64748b;
    }

    .recent-date {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78125rem;
      color: #64748b;
    }

    .calendar-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #94a3b8;
    }

    @media (max-width: 900px) {
      .analytics-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  stats: DashboardStats = {
    totalEmployees: 6,
    activeEmployees: 4,
    onboardingEmployees: 1,
    probationEmployees: 1,
    onLeaveEmployees: 0,
    totalDepartments: 5,
    totalPayroll: 691000,
    averageSalary: 115166,
    statusDistribution: {
      ACTIVE: 4,
      ONBOARDING: 1,
      PROBATION: 1,
      ON_LEAVE: 0,
      TERMINATED: 0
    },
    departmentBreakdown: [
      { departmentId: 1, departmentName: 'Engineering & Technology', departmentCode: 'ENG', employeeCount: 3, totalSalary: 353000 },
      { departmentId: 2, departmentName: 'Human Resources', departmentCode: 'HR', employeeCount: 2, totalSalary: 213000 },
      { departmentId: 3, departmentName: 'Product & UI/UX Design', departmentCode: 'DES', employeeCount: 1, totalSalary: 125000 }
    ],
    recentJoiners: [
      {
        id: 3,
        employeeCode: 'EMP-ENG-1003',
        firstName: 'Aarav',
        lastName: 'Patel',
        fullName: 'Aarav Patel',
        email: 'aarav.patel@example.com',
        designation: 'Cloud Platform Engineer',
        departmentId: 1,
        departmentName: 'Engineering & Technology',
        departmentCode: 'ENG',
        status: 'ONBOARDING',
        salary: 98000,
        joiningDate: '2025-09-10',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        skills: ['AWS', 'Jenkins', 'Docker']
      },
      {
        id: 5,
        employeeCode: 'EMP-HR-2002',
        firstName: 'Michael',
        lastName: 'Chang',
        fullName: 'Michael Chang',
        email: 'michael.chang@example.com',
        designation: 'HR Operations Specialist',
        departmentId: 2,
        departmentName: 'Human Resources',
        departmentCode: 'HR',
        status: 'PROBATION',
        salary: 68000,
        joiningDate: '2025-08-01',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        skills: ['Workday', 'HRIS']
      }
    ]
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        if (data) {
          this.stats = data;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  getDeptPercentage(count: number): number {
    if (!this.stats || !this.stats.totalEmployees || this.stats.totalEmployees === 0) return 0;
    return Math.round((count / this.stats.totalEmployees) * 100);
  }

  openOnboarding(): void {
    const dialogRef = this.dialog.open(EmployeeOnboardingComponent, {
      width: '850px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      panelClass: 'modern-dialog-pane'
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.loadStats();
      }
    });
  }

  viewProfile(emp: Employee): void {
    const dialogRef = this.dialog.open(EmployeeProfileComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      data: { employee: emp },
      panelClass: 'modern-dialog-pane'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadStats();
    });
  }
}
