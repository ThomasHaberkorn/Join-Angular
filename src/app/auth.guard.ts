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
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userType = sessionStorage.getItem('userType');

    // Prüfen, ob der Nutzer angemeldet ist
    if (userType === 'user' || userType === 'guest') {
      return true; // Der Nutzer ist berechtigt, die Route zu betreten
    }

    // Wenn der Nutzer nicht angemeldet ist, leite zur Help-Seite um
    this.router.navigate(['/dashboard/help']);
    return false;
  }
}
