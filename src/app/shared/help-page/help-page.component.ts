import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss'
})
export class HelpPageComponent {


  constructor(private router: Router) {
    // Ihr bestehender Code
  }


  navigateTo() {
    const userType = sessionStorage.getItem('userType');
  
    if (!userType || userType === '') {
      // Wenn der userType nicht gesetzt oder leer ist, zur Login-Seite navigieren
      this.router.navigate(['/']);
    } else {
      // Andernfalls zur Summary-Seite navigieren
      this.router.navigate(['/dashboard/summary']);
    }
  }
  

}
