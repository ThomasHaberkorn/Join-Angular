import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = false;  // Status, ob der Benutzer eingeloggt ist

  constructor() {}

  // Methode, um den Login-Status zu prüfen
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Methode zum Einloggen (setzt den Status auf eingeloggt)
  login() {
    this.loggedIn = true;
  }

  // Methode zum Ausloggen (setzt den Status auf nicht eingeloggt)
  logout() {
    this.loggedIn = false;
  }
}
