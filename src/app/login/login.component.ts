import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { gsap } from 'gsap';
import { User } from '../../models/user.class';
import { Firestore, addDoc, collection, getDocs, query, setDoc, where } from '@angular/fire/firestore';
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
  emailAlreadyExists: boolean = false;

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
    return false; 
  }
  return this.user.firstName.trim() !== '' &&
         this.user.lastName.trim() !== '' &&
         this.user.email.trim() !== '' &&
         this.user.password.trim() !== '' &&
         this.user.passwordConfirm.trim() !== '' &&
         this.passwordsMatch && 
         this.checkboxAccepted === true;
}


validatePasswords(): void {
  if (this.user) {
    this.passwordsMatch = this.user.password === this.user.passwordConfirm;
    this.passwordsTouched = true;
  }
}

  
toggleCheckbox(): void {
  this.checkboxAccepted = !this.checkboxAccepted;

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
  this.emailAlreadyExists = false;
}



async ngOnInit() {
  this.playIntroAnimation();
  await this.loadUsersFromFirestore();
  const savedEmail = localStorage.getItem('userEmail');
  const savedPassword = localStorage.getItem('userPassword');
  const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
  const userType = sessionStorage.setItem('userType', '');
 
  if (savedEmail && savedPassword && rememberMeChecked) {
    this.user.email = savedEmail;
    this.user.password = savedPassword;
    this.checkboxAccepted = true;
  }
}

async loadUsersFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(this.firestore, 'users'));
    this.users = querySnapshot.docs.map(doc => {
      const user = doc.data() as User;
      user.id = doc.id; 
      return user;
    });
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

  playIntroAnimation() {
    const logo = document.getElementById('introLogo');
    const mainContent = document.querySelector('.mainContent');
    const logoContainer = document.querySelector('.logoContainer');

    gsap.timeline({
      onComplete: () => {
        gsap.set(logoContainer, { display: 'none' });
        gsap.set(mainContent, { display: 'flex' });
        gsap.fromTo(mainContent, { autoAlpha: 0 }, { duration: 1, autoAlpha: 1 });
      }
    })
    .to(logo, { scale: 2.7, duration: 0.3, yoyo: true, repeat: 2, ease: 'power0.inOut', delay: 0.3 }) // 2 pulses
    .to(logo, { duration: 1, scale: 0, rotation: 360, ease: 'power2.inOut' }); // Shrink and rotate out
  }


  onSubmitLogin() {
    const email = this.user.email;
    const password = this.user.password;
   
  
    const user = this.users.find(u => u.email === email && u.password === password);
   const init = user?.initials;
   const userType = user?.userType;
    if (user) {
      if (this.checkboxAccepted) {
        localStorage.setItem('userEmail', this.user.email);
        localStorage.setItem('userPassword', this.user.password);
        localStorage.setItem('initials', init!);
        localStorage.setItem('userId', user.id!);
        localStorage.setItem('firstName', user.firstName!);
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPassword');
        localStorage.removeItem('initials');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
      }
      sessionStorage.setItem('userType', userType!);
      this.router.navigate(['/summary']);
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
    this.validateEmail();
    if (!this.emailValid) {
      return;
    }
  
    try {
      const userCollection = collection(this.firestore, 'users');
      const q = query(userCollection, where('email', '==', this.user.email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        this.emailValid = false;
        this.emailTouched = true;
        this.emailAlreadyExists = true;
        return;
      }
  
      this.user.initials = this.user.getInitials();
      const userDocRef = await addDoc(userCollection, {});
      this.user.id = userDocRef.id;
      await setDoc(userDocRef, {
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        email: this.user.email,
        initials: this.user.initials,
        color: this.user.color,
        id: this.user.id,
        phone: this.user.phone,
        password: this.user.password,
        passwordConfirm: this.user.passwordConfirm,
        userType: 'user',
      });
  
      localStorage.setItem('userEmail', this.user.email);
      localStorage.setItem('userPassword', this.user.password);
      this.signupSuccess = true;
      this.showRegister = false;
      await this.loadUsersFromFirestore();
      this.flipToLogIn();
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }
  


togglePasswordImg(imgId: string, isFocused: boolean): void {
  const img = document.getElementById(imgId) as HTMLImageElement;
  if (img) {
    img.src = isFocused ? './../../assets/img/password-hide.png' : './../../assets/img/lock.png';
  }
}

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
  this.user.email = '';
  this.user.password = '';
  this.user.passwordConfirm = '';
  this.checkboxAccepted = false;
  if (loginContainer && signupContainer && signUpElement && vectorBtn) {
    gsap.to(loginContainer, {
      duration: 0.6,
      rotationX: 180,
      onComplete: () => {
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'block';
        gsap.fromTo(signupContainer, { rotationX: -180 }, { duration: 0.6, rotationX: 0 });
      }
    });

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

    gsap.to(vectorBtn, {
      duration: 0.3,
      scale: 1.5,
      yoyo: true,
      repeat: 2,
      delay: 1,
      ease: "power1.inOut", 
      onComplete: () => {
        gsap.to(vectorBtn, {
          duration: 0.2,
          scale: 1 
        });
      }
    });
    
  }
}


flipToLogIn(): void {
  const loginContainer = document.getElementById('loginContainer');
  const signupContainer = document.getElementById('signupContainer');
  const signUpElement = document.querySelector('.signUp') as HTMLElement;
  const savedEmail = localStorage.getItem('userEmail');
  const savedPassword = localStorage.getItem('userPassword');
  const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
  if (savedEmail && savedPassword && rememberMeChecked) {
    this.user.email = savedEmail;
    this.user.password = savedPassword;
    this.checkboxAccepted = true;
  }
  if (signupContainer && loginContainer && signUpElement) {
    gsap.to(signupContainer, {
      duration: 0.6,
      rotationX: 180,
      onComplete: () => {
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'flex';

        gsap.fromTo(loginContainer, { rotationX: -180 }, { duration: 0.6, rotationX: 0 });

        signUpElement.style.display = 'flex';
        gsap.fromTo(signUpElement, { scale: 0.9 }, {
          duration: 0.4,
          scale: 1.1,
          repeat: 2,
          yoyo: true,
          ease: "power1.inOut",
          onComplete: () => {
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
    localStorage.setItem('initials', 'G');
    sessionStorage.setItem('userType', 'guest');
    this.router.navigate(['/summary']);
  }

  navigateToPrivacyPolicy() {
    this.router.navigate(['/privacy']);
  }

  navigateToLegalNotice() {
    this.router.navigate(['/legal']);
  }

  login() {
    this.onSubmitLogin();
   
  }
  signUp() {
    this.onSubmitRegister();
  }
  
}
