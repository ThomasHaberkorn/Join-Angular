import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {

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
