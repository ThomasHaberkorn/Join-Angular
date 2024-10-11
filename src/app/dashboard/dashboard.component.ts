import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

import { RouterModule } from '@angular/router';
import { SummaryComponent } from './summary/summary.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, RouterModule, HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

}
