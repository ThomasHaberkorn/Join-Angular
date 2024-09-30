import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SummaryComponent } from './dashboard/summary/summary.component';
import { AddTaskComponent } from './dashboard/add-task/add-task.component';
import { BoardComponent } from './dashboard/board/board.component';
import { UsersComponent } from './dashboard/users/users.component';
import { AuthGuard } from './auth.guard';

// export const routes: Routes = [];

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
      path: 'dashboard', 
      component: DashboardComponent,
      canActivate: [AuthGuard],  // Schutz für eingeloggte Benutzer
      children: [
        { path: 'summary', component: SummaryComponent },
        { path: 'add-task', component: AddTaskComponent },
        { path: 'board', component: BoardComponent },
        { path: 'users', component: UsersComponent },
        { path: '', redirectTo: 'overview', pathMatch: 'full' }
      ]
    },
    { path: '**', redirectTo: '/dashboard/summary' }  // Fallback
  ];