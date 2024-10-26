import { Component } from '@angular/core';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';

import { RouterModule } from '@angular/router';
import { SummaryComponent } from '../summary/summary.component';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, RouterModule, HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingpageComponent {

}
