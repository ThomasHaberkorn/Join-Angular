import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component for displaying the help page and handling navigation based on user type.
 */
@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {

  /**
   * Initializes the component with the router for navigation.
   * @param {Router} router - Router service for navigating between pages.
   */
  constructor(private router: Router) {}

  /**
   * Navigates the user based on their session user type.
   * If no user type is found, navigates to the root page; otherwise, navigates to the dashboard summary.
   */
  navigateTo() {
    const userType = sessionStorage.getItem('userType');
    if (!userType || userType === '') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
