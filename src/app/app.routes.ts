import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SummaryComponent } from './dashboard/summary/summary.component';
import { AddTaskComponent } from './dashboard/add-task/add-task.component';
import { BoardComponent } from './dashboard/board/board.component';
import { UsersComponent } from './dashboard/users/users.component';
import { AuthGuard } from './auth.guard';
import { TestestComponent } from './testest/testest.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  
  {
    path: 'dashboard', 
    component: DashboardComponent, // Diese Komponente wird als Hauptcontainer verwendet
    //canActivate: [AuthGuard],  // Aktiviere den AuthGuard, wenn gewünscht
    children: [
      { path: 'summary', component: SummaryComponent },
      { path: 'add-task', component: AddTaskComponent },
      { path: 'board', component: BoardComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'summary', pathMatch: 'full' } // Standardroute im Dashboard
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Standardroute beim Laden der App
  { path: '**', redirectTo: 'login', pathMatch: 'full' }  // Fallback
];


// export const routes: Routes = [];

// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   { 
//     path: 'dashboard', 
//     component: DashboardComponent,
//     //canActivate: [AuthGuard],  // Schutz für eingeloggte Benutzer
//     children: [
//       { path: 'summary', component: SummaryComponent },
//       { path: 'add-task', component: AddTaskComponent },
//       { path: 'board', component: BoardComponent },
//       { path: 'users', component: UsersComponent },
//       { path: '', redirectTo: 'summary', pathMatch: 'full' } // Standardroute für Dashboard
//     ]
//   },
//   { path: '', redirectTo: 'login', pathMatch: 'full' },  // Standardroute beim Laden der App
//   { path: '**', redirectTo: 'login', pathMatch: 'full' }  // Fallback
// ];