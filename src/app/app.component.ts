import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from './auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'join-angular';

  constructor(private authService: AuthService) {}
    
    // Methode, die den Login-Status aus dem AuthService abruft
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();  // Hier den tatsächlichen Login-Status abfragen
  }
  
}

