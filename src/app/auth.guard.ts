// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };


// import { Injectable } from '@angular/core';
// import { CanActivate } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
  
//   canActivate(): boolean {
//     // Für die Entwicklungsphase immer Zugriff gewähren
//     return true;
//   }
// }

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = !!localStorage.getItem('user');  // Prüfe, ob ein Nutzer angemeldet ist
    if (!isAuthenticated) {
      this.router.navigate(['/login']);  // Umleitung zum Login, falls nicht angemeldet
      return false;
    }
    return true;
  }
}
