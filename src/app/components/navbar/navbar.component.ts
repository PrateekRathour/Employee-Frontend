import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EmployeeOnboardingComponent } from '../employee-onboarding/employee-onboarding.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ],
  template: `
    <header class="app-navbar">
      <div class="navbar-left">
        <button mat-icon-button (click)="toggleSidebar.emit()" class="menu-toggle-btn" aria-label="Toggle Navigation">
          <mat-icon>menu</mat-icon>
        </button>

        <div class="brand-logo" routerLink="/dashboard">
          <div class="logo-icon">
            <mat-icon>hub</mat-icon>
          </div>
          <div class="brand-text">
            <span class="brand-title">WorkPulse</span>
            <span class="brand-badge">EMS 2025</span>
          </div>
        </div>
      </div>

      <div class="navbar-center">
        <div class="search-bar" (click)="navigateToEmployees()">
          <mat-icon class="search-icon">search</mat-icon>
          <span class="search-placeholder">Quick search employee by name, ID, or skill (Press /)...</span>
          <kbd class="search-kbd">⌘K</kbd>
        </div>
      </div>

      <div class="navbar-right">
        <button mat-flat-button color="primary" class="quick-onboard-btn" (click)="openOnboardingDialog()">
          <mat-icon>person_add</mat-icon>
          <span>Onboard New Hire</span>
        </button>

        <button mat-icon-button class="icon-action-btn" matBadge="3" matBadgeColor="warn" aria-label="Notifications">
          <mat-icon>notifications_none</mat-icon>
        </button>

        <div class="user-profile-menu" [matMenuTriggerFor]="profileMenu">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Admin Avatar" class="user-avatar" />
          <div class="user-info">
            <span class="user-name">Prateek S.</span>
            <span class="user-role">HR Administrator</span>
          </div>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </div>

        <mat-menu #profileMenu="matMenu" class="modern-menu">
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Overview Dashboard</span>
          </button>
          <button mat-menu-item routerLink="/employees">
            <mat-icon>badge</mat-icon>
            <span>Employee Directory</span>
          </button>
          <button mat-menu-item routerLink="/departments">
            <mat-icon>apartment</mat-icon>
            <span>Departments</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="openOnboardingDialog()">
            <mat-icon>add_circle_outline</mat-icon>
            <span>Quick Onboard</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .app-navbar {
      height: 70px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-toggle-btn {
      color: var(--text-secondary);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }

    .logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary-600) 0%, #8b5cf6 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.35);
    }

    .brand-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.03em;
    }

    .brand-badge {
      margin-left: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      background: #e0e7ff;
      color: var(--primary-700);
      border-radius: 4px;
      text-transform: uppercase;
    }

    .navbar-center {
      flex: 1;
      max-width: 520px;
      margin: 0 32px;
    }

    .search-bar {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 8px 16px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .search-bar:hover {
      background: #ffffff;
      border-color: var(--primary-400);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-icon {
      color: #94a3b8;
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 10px;
    }

    .search-placeholder {
      font-size: 0.875rem;
      color: #64748b;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .search-kbd {
      font-size: 0.7rem;
      font-family: inherit;
      background: #e2e8f0;
      color: #475569;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .quick-onboard-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%) !important;
      color: white !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      padding: 0 16px !important;
      height: 40px !important;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);
    }

    .icon-action-btn {
      color: #475569;
    }

    .user-profile-menu {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px;
      border-radius: 24px;
      cursor: pointer;
      transition: background var(--transition-fast);
    }

    .user-profile-menu:hover {
      background: #f1f5f9;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary-200);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .user-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .dropdown-icon {
      color: #94a3b8;
      font-size: 18px;
    }

    @media (max-width: 900px) {
      .navbar-center {
        display: none;
      }
      .user-info {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private router = inject(Router);
  private dialog = inject(MatDialog);

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  openOnboardingDialog(): void {
    this.dialog.open(EmployeeOnboardingComponent, {
      width: '850px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: false,
      panelClass: 'modern-dialog-pane'
    });
  }
}
