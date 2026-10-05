import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { EmployeeOnboardingComponent } from './components/employee-onboarding/employee-onboarding.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'WorkPulse - Analytics Dashboard'
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    title: 'WorkPulse - Employee Directory'
  },
  {
    path: 'onboard',
    component: EmployeeOnboardingComponent,
    title: 'WorkPulse - Employee Onboarding'
  },
  {
    path: 'departments',
    component: DepartmentListComponent,
    title: 'WorkPulse - Department Management'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
