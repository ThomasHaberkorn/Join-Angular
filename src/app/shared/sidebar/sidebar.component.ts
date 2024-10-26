import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component for displaying a sidebar with navigation options.
 * Manages visibility and active states of navigation items based on the user type and current route.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  /** Stores the user type retrieved from session storage. */
  userType: string = '';

  /**
   * Initializes the component with Router for navigation.
   * @param {Router} router - Router service for navigating between pages.
   */
  constructor(private router: Router) {}

  /**
   * Retrieves and sets the user type from session storage on initialization.
   */
  ngOnInit() {
    const storedUserType = sessionStorage.getItem('userType');
    if (storedUserType) {
      this.userType = storedUserType;
    }
  }

  /**
   * Determines if the navigation should be hidden based on the user type.
   * @returns {boolean} - True if the navigation should be hidden, otherwise false.
   */
  shouldHideNavigation(): boolean {
    return this.userType !== 'user' && this.userType !== 'guest';
  }

  /**
   * Returns the CSS classes for a navigation item based on the current route and user type.
   * @param {string} route - The route to check.
   * @returns {string[]} - Array of CSS classes for the navigation item.
   */
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

  /**
   * Navigates to the summary page within the dashboard.
   */
  navigateToSummary() {
    this.router.navigate(['/summary']);
  }

  /**
   * Navigates to the add-task page within the dashboard.
   */
  navigateToAddTask() {
    this.router.navigate(['/add-task']);
  }

  /**
   * Navigates to the board page within the dashboard.
   */
  navigateToBoard() {
    this.router.navigate(['/board']);
  }

  /**
   * Navigates to the users page within the dashboard.
   */
  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  /**
   * Navigates to the privacy policy page within the dashboard.
   */
  navigateToPrivacyPolicy() {
    this.router.navigate(['/privacy']);
  }

  /**
   * Navigates to the legal notice page within the dashboard.
   */
  navigateToLegalNotice() {
    this.router.navigate(['/legal']);
  }

  /**
   * Checks if the provided route is the active route.
   * @param {string} route - The route to check.
   * @returns {boolean} - True if the route is active, otherwise false.
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}
