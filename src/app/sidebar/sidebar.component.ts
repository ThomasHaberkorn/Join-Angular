import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  constructor(private router: Router) {}


  navigateToSummary() {
    this.router.navigate(['/dashboard/summary']);
  }

  navigateToAddTask() {
    this.router.navigate(['/dashboard/add-task']);
  }

  navigateToBoard() {
    this.router.navigate(['/dashboard/board']);
  }

  navigateToUsers() {
    this.router.navigate(['/dashboard/users']);
  }

  

};
