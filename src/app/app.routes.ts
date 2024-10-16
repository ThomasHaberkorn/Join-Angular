import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SummaryComponent } from './dashboard/summary/summary.component';
import { AddTaskComponent } from './dashboard/add-task/add-task.component';
import { BoardComponent } from './dashboard/board/board.component';
import { UsersComponent } from './dashboard/users/users.component';
import { AuthGuard } from './auth.guard';
import { HelpPageComponent } from './shared/help-page/help-page.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './shared/legal-notice/legal-notice.component';


export const routes: Routes = [
  { path: '', component: LoginComponent },
  
  {
    path: 'dashboard', 
    component: DashboardComponent, // Diese Komponente wird als Hauptcontainer verwendet
    //canActivate: [AuthGuard],  // Aktiviere den AuthGuard, wenn gewünscht
    children: [
      { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
      { path: 'add-task', component: AddTaskComponent, canActivate: [AuthGuard] },
      { path: 'board', component: BoardComponent, canActivate: [AuthGuard] },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'help', component: HelpPageComponent},
      { path: 'privacy', component: PrivacyPolicyComponent},
      { path: 'legal', component: LegalNoticeComponent},
      { path: '', redirectTo: 'summary', pathMatch: 'full' } // Standardroute im Dashboard
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  // Standardroute beim Laden der App
  { path: '**', redirectTo: 'login', pathMatch: 'full' }  // Fallback
];

