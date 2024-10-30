import { NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Component for displaying the header with user initials, navigation options, and a dropdown menu.
 * Handles user logout and navigation to various sections.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header.media.scss']
})
export class HeaderComponent implements OnInit {
  /** User initials displayed in the header. */
  initials: string = '';
  
  /** Controls the visibility of the dropdown menu. */
  showMenu: boolean = false;
  
  /** Timeout ID for delaying menu closure on mouse leave. */
  private menuCloseTimeout: any;

  /**
   * Initializes the component with Router for navigation.
   * @param {Router} router - Router service for navigating between pages.
   */
  constructor(private router: Router) {}

  /**
   * Initializes the component by loading user initials from localStorage.
   * Sets default initials if none are found.
   */
  ngOnInit() {
    const storedInitials = localStorage.getItem('initials');
    this.initials = storedInitials ? storedInitials : 'NN';
  }

  /**
   * Navigates to the help page within the dashboard.
   */
  navigateToHelp() {
    this.router.navigate(['/help']);
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
   * Shows the dropdown menu and cancels any pending close timeout on mouse enter.
   */
  onMenuMouseEnter() {
    if (this.menuCloseTimeout) {
      clearTimeout(this.menuCloseTimeout);
    }
    this.showMenu = true;
  }

  /**
   * Sets a timeout to hide the dropdown menu on mouse leave.
   */
  onMenuMouseLeave() {
    this.menuCloseTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 700); 
  }

  /**
   * Shows the dropdown menu and cancels any pending close timeout when entering the menu container.
   */
  onMenuContainerMouseEnter() {
    if (this.menuCloseTimeout) {
      clearTimeout(this.menuCloseTimeout);
    }
    this.showMenu = true;
  }

  /**
   * Sets a timeout to hide the dropdown menu when leaving the menu container.
   */
  onMenuContainerMouseLeave() {
    this.menuCloseTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 700); 
  }

  /**
   * Logs the user out by clearing session storage, navigating to the home page, and hiding the menu.
   */
  logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);
    this.showMenu = false;
  }
}
