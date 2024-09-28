import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginError = false;
  signupSuccess = false;
  showRegister = false;
  passwordMismatch = false;
  user = {
    eMail: '',
    password: '',
  };
  loading = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      acceptPolicy: [false, Validators.requiredTrue],
    });
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      // Hier kommt die Login-Logik hin
      console.log('Login submitted', this.loginForm.value);
      this.loginError = false; // Set this to true if login fails
    }
  }

  onSubmitRegister() {
    if (this.registerForm.valid) {
      if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
        this.passwordMismatch = true;
      } else {
        this.passwordMismatch = false;
        console.log('Register submitted', this.registerForm.value);
        this.signupSuccess = true; // Erfolgsmeldung anzeigen
        this.showRegister = false; // Zeige Login-Box nach erfolgreicher Registrierung an
      }
    }
  }

  showSignUpBox() {
    this.showRegister = true;
  }

  showLoginBox() {
    this.showRegister = false;
  }

  guestLogin() {
    // Hier die Logik für den Gast-Login hinzufügen
    console.log('Guest login');
  }
}
