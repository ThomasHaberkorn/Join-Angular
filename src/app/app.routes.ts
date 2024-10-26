import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LandingpageComponent } from './landing-page/landing-page.component';
import { SummaryComponent } from './summary/summary.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { BoardComponent } from './board/board.component';
import { UsersComponent } from './users/users.component';
import { AuthGuard } from './auth.guard';
import { HelpPageComponent } from './help-page/help-page.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { LegalNoticeComponent } from './legal-notice/legal-notice.component';



export const routes: Routes = [
  { path: '', component: LoginComponent },
  
  {
    path: '', 
    component: LandingpageComponent, 
    canActivate: [AuthGuard],  
    children: [
      { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
      { path: 'add-task', component: AddTaskComponent, canActivate: [AuthGuard] },
      { path: 'board', component: BoardComponent, canActivate: [AuthGuard] },
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
      { path: 'help', component: HelpPageComponent},
      { path: 'privacy', component: PrivacyPolicyComponent},
      { path: 'legal', component: LegalNoticeComponent},
      { path: '', redirectTo: 'summary', pathMatch: 'full' } 
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },  
  { path: '**', redirectTo: 'login', pathMatch: 'full' } 
];

