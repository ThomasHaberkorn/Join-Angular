import { NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  initials: string = '';
  showMenu: boolean = false;
  private menuCloseTimeout: any;

  constructor(private router: Router) {
    // Ihr bestehender Code
  }

  ngOnInit() {
    const storedInitials = localStorage.getItem('initials');
    if (storedInitials) {
      this.initials = storedInitials;
    } else {
      this.initials = 'NN'; // Standardinitialen
    }
  }

  onMenuMouseEnter() {
    if (this.menuCloseTimeout) {
      clearTimeout(this.menuCloseTimeout);
    }
    this.showMenu = true;
  }

  onMenuMouseLeave() {
    this.menuCloseTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 700); // Verzögerung von 500 Millisekunden
  }

  onMenuContainerMouseEnter() {
    if (this.menuCloseTimeout) {
      clearTimeout(this.menuCloseTimeout);
    }
    this.showMenu = true;
  }

  onMenuContainerMouseLeave() {
    this.menuCloseTimeout = setTimeout(() => {
      this.showMenu = false;
    }, 700); // Verzögerung von 500 Millisekunden
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/']);
  
    this.showMenu = false;
  }
  
}
