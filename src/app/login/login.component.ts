import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { User } from '../../models/user.class';
import { Firestore, addDoc, collection, getDocs } from '@angular/fire/firestore';
import { Router } from '@angular/router';


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
  user: User = new User();
  loading = false;
  users: User[] = [];
  isHovered: boolean = false;
  isChecked: boolean = false;
  checkboxAccepted = false;
  emailValid: boolean = true;
emailTouched: boolean = false;
passwordsMatch: boolean = true;
passwordsTouched: boolean = false;

constructor(private fb: FormBuilder, private firestore: Firestore, private router: Router) {
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

isFormValid(): boolean {
  if (!this.user) {
    return false; // Falls der Benutzer nicht initialisiert ist
  }
  return this.user.firstName.trim() !== '' &&
         this.user.lastName.trim() !== '' &&
         this.user.email.trim() !== '' &&
         this.user.password.trim() !== '' &&
         this.user.passwordConfirm.trim() !== '' &&
         this.passwordsMatch && // Hier wird überprüft, ob die Passwörter übereinstimmen
         this.checkboxAccepted === true;
}


validatePasswords(): void {
  if (this.user) {
    // Prüft, ob das Passwort und die Passwort-Bestätigung übereinstimmen
    this.passwordsMatch = this.user.password === this.user.passwordConfirm;
    this.passwordsTouched = true;
  }
}

  
toggleCheckbox(): void {
  this.checkboxAccepted = !this.checkboxAccepted;

  // Überprüfen, ob "Remember Me" aktiviert wurde
  if (this.checkboxAccepted) {
    localStorage.setItem('rememberMe', 'true');
  } else {
    localStorage.removeItem('rememberMe');
  }
}
  
getCheckboxImage(): string {
  return this.checkboxAccepted ? 'assets/img/checkbox_checked.png' : 'assets/img/checkbox.png';
}

validateEmail(): void {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  this.emailValid = emailRegex.test(this.user.email);
  this.emailTouched = true;
}




// Firestore-Daten abrufen, wenn die Komponente geladen wird
async ngOnInit() {
  this.playIntroAnimation();
  await this.loadUsersFromFirestore();
 
  // Daten aus localStorage wiederherstellen
  const savedEmail = localStorage.getItem('userEmail');
  const savedPassword = localStorage.getItem('userPassword');
  const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
 
  if (savedEmail && savedPassword && rememberMeChecked) {
    this.user.email = savedEmail;
    this.user.password = savedPassword;
    this.checkboxAccepted = true;
  }
}

async loadUsersFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(this.firestore, 'users'));
    this.users = querySnapshot.docs.map(doc => doc.data() as User); // Benutzerdaten ins Array speichern
    console.log('Users loaded:', this.users);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

  playIntroAnimation() {
    const logo = document.getElementById('introLogo');
    const mainContent = document.querySelector('.mainContent');
    const logoContainer = document.querySelector('.logoContainer');

    // Pulsing animation followed by rotation and scale down
    gsap.timeline({
      onComplete: () => {
        // After the animation, hide logoContainer and show mainContent
        gsap.set(logoContainer, { display: 'none' });
        gsap.set(mainContent, { display: 'flex' });

        // Optional: Fade in main content
        gsap.fromTo(mainContent, { autoAlpha: 0 }, { duration: 1, autoAlpha: 1 });
      }
    })
    .to(logo, { scale: 2.7, duration: 0.3, yoyo: true, repeat: 2, ease: 'power0.inOut', delay: 0.3 }) // 2 pulses
    .to(logo, { duration: 1, scale: 0, rotation: 360, ease: 'power2.inOut' }); // Shrink and rotate out
  }


  onSubmitLogin() {
    const email = this.user.email;
    const password = this.user.password;
  
    // Suche den Benutzer in Firestore-Daten
    const user = this.users.find(u => u.email === email && u.password === password);
  
    if (user) {
      console.log('Login successful:', user, this.users);
  
      // Überprüfen, ob die "Remember Me"-Checkbox aktiviert ist
      if (this.checkboxAccepted) {
        localStorage.setItem('userEmail', this.user.email);
        localStorage.setItem('userPassword', this.user.password);
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
      }
  
      this.router.navigate(['/dashboard/summary']);
    } else {
      this.showLoginError();
    }
  }


showLoginError() {
  const logInErrorDiv = document.getElementById('logInError');
  if (logInErrorDiv) {
    logInErrorDiv.style.display = 'block'; 
    setTimeout(() => {
        logInErrorDiv.style.display = 'none'; 
    }, 6000); 
  }
}

  async onSubmitRegister() {
    // Initialen setzen basierend auf den aktuellen Benutzerdaten
    this.user.initials = this.user.getInitials();

    try {
      // Benutzer-Daten an Firestore senden
      const userCollection = collection(this.firestore, 'users'); // 'users' ist der Name der Sammlung
      await addDoc(userCollection, {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        initials: this.user.initials,
        color: this.user.color,
        id: this.user.id,
        phone: this.user.phone,
        password: this.user.password,
        passwordConfirm: this.user.passwordConfirm,
        
      });
      console.log('User successfully added to Firestore', this.user);
      this.signupSuccess = true;
      this.showRegister = false;
      this.flipToLogIn()
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
    }
   
  }
    
  

  

  // Function to toggle image on focus and blur
togglePasswordImg(imgId: string, isFocused: boolean): void {
  const img = document.getElementById(imgId) as HTMLImageElement;
  if (img) {
    img.src = isFocused ? './../../assets/img/password-hide.png' : './../../assets/img/lock.png';
  }
}

// Function to toggle password visibility and image
togglePasswordVisibility(inputId: string, imgId: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const img = document.getElementById(imgId) as HTMLImageElement;
  if (input && img) {
    if (input.type === 'password') {
      input.type = 'text';
      img.src = './../../assets/img/password-show.png';
    } else {
      input.type = 'password';
      img.src = './../../assets/img/password-hide.png';
    }
  }
}

flipToSignUp(): void {
  const loginContainer = document.getElementById('loginContainer');
  const signupContainer = document.getElementById('signupContainer');
  const signUpElement = document.querySelector('.signUp') as HTMLElement;
  const vectorBtn = document.getElementById('vectorBtn');

  if (loginContainer && signupContainer && signUpElement && vectorBtn) {
    // Animation für das Umdrehen des Login-Containers
    gsap.to(loginContainer, {
      duration: 0.6,
      rotationX: 180,
      onComplete: () => {
        // Nach der Drehung Login-Container verstecken und Signup-Container anzeigen
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';

        // Setze den Signup-Container zurück (Start mit 180 Grad)
        gsap.fromTo(signupContainer, { rotationX: -180 }, { duration: 0.6, rotationX: 0 });
      }
    });

    // Animation für das signUp-Element (Impulse und Ausblenden)
    gsap.to(signUpElement, {
      duration: 0.3,
      scale: 1.2,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        gsap.to(signUpElement, {
          duration: 0.4,
          scale: 0,
          onComplete: () => {
            signUpElement.style.display = 'none';
          }
        });
      }
    });

    // Impuls-Animation für den vectorBtn
    gsap.to(vectorBtn, {
      duration: 0.3,
      scale: 1.5,
      yoyo: true,
      repeat: 2, // Nur eine Wiederholung, sodass es zu 1 zurückkehrt
      delay: 1,
      ease: "power1.inOut", // Weicher Übergang
      onComplete: () => {
        gsap.to(vectorBtn, {
          duration: 0.2,
          scale: 1 // Zurück zu scale 1
        });
      }
    });
    
  }
}



flipToLogIn(): void {
  const loginContainer = document.getElementById('loginContainer');
  const signupContainer = document.getElementById('signupContainer');
  const signUpElement = document.querySelector('.signUp') as HTMLElement;

  if (signupContainer && loginContainer && signUpElement) {
    // Animation für das Umdrehen des Signup-Containers
    gsap.to(signupContainer, {
      duration: 0.6,
      rotationX: 180,
      onComplete: () => {
        // Nach der Drehung Signup-Container verstecken und Login-Container anzeigen
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';

        // Setze den Login-Container zurück (Start mit -180 Grad)
        gsap.fromTo(loginContainer, { rotationX: -180 }, { duration: 0.6, rotationX: 0 });

        // Zeige das signUp-Element und führe die Skalierungsanimation durch
        signUpElement.style.display = 'flex';
        gsap.fromTo(signUpElement, { scale: 0.9 }, {
          duration: 0.4,
          scale: 1.1,
          repeat: 2,
          yoyo: true,
          ease: "power1.inOut",
          onComplete: () => {
            // Nach den Impulsen das Element auf scale 1 zurücksetzen
            gsap.to(signUpElement, { duration: 0.4, scale: 1 });
          }
        });
      }
    });
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

  login() {
    this.onSubmitLogin();
   
  }
  signUp() {
    this.onSubmitRegister();
  }
  
}
