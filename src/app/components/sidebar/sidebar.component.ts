import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <aside class="app-sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-content">
        <div class="nav-section-title" *ngIf="!collapsed">MAIN NAVIGATION</div>

        <nav class="nav-links">
          <a *ngFor="let item of navItems" 
             [routerLink]="item.route" 
             routerLinkActive="active" 
             [routerLinkActiveOptions]="{ exact: true }"
             class="nav-item" 
             [title]="collapsed ? item.label : ''"
             (click)="onNavigate()">
            <div class="nav-icon-wrap">
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="!collapsed && item.badge">{{ item.badge }}</span>
          </a>
        </nav>

        <div class="sidebar-divider" *ngIf="!collapsed"></div>

        <div class="nav-section-title" *ngIf="!collapsed">RESOURCES & SYSTEM</div>

        <nav class="nav-links" *ngIf="!collapsed">
          <a href="http://localhost:8080/swagger-ui.html" target="_blank" class="nav-item external-link">
            <div class="nav-icon-wrap">
              <mat-icon>api</mat-icon>
            </div>
            <span class="nav-label">Swagger REST Docs</span>
            <mat-icon class="external-icon">open_in_new</mat-icon>
          </a>
          <a href="http://localhost:8080/actuator/health" target="_blank" class="nav-item external-link">
            <div class="nav-icon-wrap">
              <mat-icon>monitor_heart</mat-icon>
            </div>
            <span class="nav-label">Health & Actuator</span>
            <span class="status-dot"></span>
          </a>
        </nav>
      </div>

      <div class="sidebar-footer" *ngIf="!collapsed">
        <div class="system-status-card">
          <div class="status-header">
            <span class="status-indicator live"></span>
            <span class="status-title">Spring Boot + MySQL</span>
          </div>
          <p class="status-desc">Backend & DB connected on port 8080 & 3306</p>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .app-sidebar {
      width: 260px;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: calc(100vh - 70px);
      position: sticky;
      top: 70px;
      transition: width var(--transition-normal);
      z-index: 900;
      border-right: 1px solid #1e293b;
    }

    .app-sidebar.collapsed {
      width: 80px;
    }

    .sidebar-content {
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 8px 12px 4px 12px;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 10px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all var(--transition-fast);
      position: relative;
      cursor: pointer;
    }

    .nav-item:hover {
      background: #1e293b;
      color: #ffffff;
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }

    .nav-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-icon-wrap mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .nav-label {
      flex: 1;
      white-space: nowrap;
    }

    .nav-badge {
      padding: 2px 8px;
      background: #4f46e5;
      color: #ffffff;
      font-size: 0.6875rem;
      font-weight: 700;
      border-radius: 9999px;
    }

    .sidebar-divider {
      height: 1px;
      background: #1e293b;
      margin: 12px 0;
    }

    .external-link {
      color: #64748b;
    }

    .external-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #475569;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #1e293b;
    }

    .system-status-card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 10px;
      padding: 12px;
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.live {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }

    .status-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .status-desc {
      font-size: 0.6875rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() navigate = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Overview Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Employee Directory', route: '/employees', icon: 'people' },
    { label: 'Onboard New Employee', route: '/onboard', icon: 'person_add' },
    { label: 'Departments & Teams', route: '/departments', icon: 'apartment' }
  ];

  onNavigate(): void {
    if (window.innerWidth < 900) {
      this.navigate.emit();
    }
  }
}
