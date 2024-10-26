import { Component } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component for displaying the privacy policy page and handling navigation based on user type.
 */
@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  /**
   * Initializes the component with the router for navigation.
   * @param {Router} router - Router service for navigating between pages.
   */
  constructor(private router: Router) {}

  /**
   * Navigates the user based on their session user type.
   * If no user type is found, navigates to the help page; otherwise, navigates to the dashboard summary.
   */
  navigateTo() {
    const userType = sessionStorage.getItem('userType');
  
    if (!userType || userType === '') {
      this.router.navigate(['/dashboard/help']);
    } else {
      this.router.navigate(['/dashboard/summary']);
    }
  }
}
