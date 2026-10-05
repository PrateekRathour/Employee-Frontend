import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';
import { App } from './app';
import { routes } from './app.routes';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';

describe('Employee Management System - Frontend App & Routing', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        App,
        DashboardComponent,
        EmployeeListComponent,
        EmployeeOnboardingComponent,
        DepartmentListComponent,
        SidebarComponent,
        NavbarComponent
      ],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        provideNativeDateAdapter()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the root App component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should navigate to /onboard and instantiate EmployeeOnboardingComponent', async () => {
    await router.navigate(['/onboard']);
    const fixture = TestBed.createComponent(EmployeeOnboardingComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.onboardForm).toBeDefined();
    expect(component.onboardForm.get('firstName')).toBeDefined();
    expect(component.onboardForm.get('departmentId')).toBeDefined();
    expect(component.departments.length).toBeGreaterThan(0);
    expect(component.isDialog).toBe(false);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Employee Onboarding');
  });

  it('should navigate to /departments and instantiate DepartmentListComponent', async () => {
    await router.navigate(['/departments']);
    const fixture = TestBed.createComponent(DepartmentListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.departments.length).toBeGreaterThan(0);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Departments & Teams');
    expect(compiled.textContent).toContain('Engineering & Technology');
  });

  it('should navigate to /dashboard and instantiate DashboardComponent', async () => {
    await router.navigate(['/dashboard']);
    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.stats.totalDepartments).toBe(5);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Employee Management & Operations Dashboard');
  });

  it('should navigate to /employees and instantiate EmployeeListComponent', async () => {
    await router.navigate(['/employees']);
    const fixture = TestBed.createComponent(EmployeeListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.displayedColumns).toContain('employee');
    expect(component.displayedColumns).toContain('department');
  });

  it('should have all 4 primary navigation items in SidebarComponent', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    const sidebar = fixture.componentInstance;
    fixture.detectChanges();

    expect(sidebar.navItems.length).toBe(4);
    const routes = sidebar.navItems.map(item => item.route);
    expect(routes).toContain('/dashboard');
    expect(routes).toContain('/employees');
    expect(routes).toContain('/onboard');
    expect(routes).toContain('/departments');
  });
});
