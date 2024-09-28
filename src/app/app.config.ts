import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({"projectId":"join-angular-49446","appId":"1:974554135147:web:bdb5bb53988411b9ae8f2e","storageBucket":"join-angular-49446.appspot.com","apiKey":"AIzaSyC7brHaEVsV886TeBedW1CUsiGuUxjBuN0","authDomain":"join-angular-49446.firebaseapp.com","messagingSenderId":"974554135147"}))), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
