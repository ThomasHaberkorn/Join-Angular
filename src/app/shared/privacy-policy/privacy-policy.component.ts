import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  constructor(private router: Router) {  }


  navigateTo() {
    const userType = sessionStorage.getItem('userType');
  
    if (!userType || userType === '') {
      this.router.navigate(['/dashboard/help']);
    } else {
      this.router.navigate(['/dashboard/summary']);
    }
  }
}
