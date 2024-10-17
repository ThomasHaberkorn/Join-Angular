

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  userType: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const storedUserType = sessionStorage.getItem('userType');
    if (storedUserType) {
      this.userType = storedUserType;
    }
    console.log('User type: ', this.userType);
  }

  shouldHideNavigation(): boolean {
    return this.userType !== 'user' && this.userType !== 'guest';
  }

  getNavClass(route: string): string[] {
    const classes = ['navContent'];
    if (this.isRouteActive(route)) {
      classes.push('active-nav');
    }
    if (this.shouldHideNavigation()) {
      classes.push('dnone');
    }
    return classes;
  }

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

  navigateToPrivacyPolicy() {
    this.router.navigate(['/dashboard/privacy']);
  }

  navigateToLegalNotice() {
    this.router.navigate(['/dashboard/legal']);
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
