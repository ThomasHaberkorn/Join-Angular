import { Component, ElementRef, ViewChild } from '@angular/core';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent{
  users: User[] = [];
  groupedUsers: { [key: string]: User[] } = {};
  selectedUser: User | null = null;
  @ViewChild('contactCard') contactCard!: ElementRef;

  private isCardVisible = false;

  constructor(private firestore: Firestore) { }

  async ngOnInit() {
    await this.loadUsersFromFirestore();
    this.groupUsersByFirstLetter();
  }

  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map(doc => doc.data() as User);
      console.log('Users loaded:', this.users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  groupUsersByFirstLetter() {
    this.groupedUsers = this.users.reduce((groups: { [key: string]: User[] }, user: User) => {
      const firstLetter = user.firstName[0].toUpperCase(); // Nimmt den ersten Buchstaben des Vornamens
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(user);
      return groups;
    }, {});
  }

 

  // showContactCard(user: User) {
  //   this.selectedUser = user;
  //   this.isCardVisible = true;
  
  //   setTimeout(() => {
  //     if (this.contactCard) {
  //       // Setzt den Startwert der Karte auf außerhalb des Viewports (rechts) und unsichtbar
  //       gsap.fromTo(this.contactCard.nativeElement, 
  //         { x: '100%', opacity: 0 }, // Startposition und Unsichtbarkeit
  //         { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' } // Ziel: In den Viewport schieben und sichtbar machen
  //       );
  //     }
  //   });
  // }

  showContactCard(user: User) {
    if (this.selectedUser && this.selectedUser === user) {
      // Gleicher User wurde erneut geklickt, wir machen Slide-Out
      gsap.to(this.contactCard.nativeElement, {
        x: '100%', 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.in', 
        onComplete: () => {
          this.selectedUser = null; // Kein User mehr ausgewählt
        }
      });
    } else {
      // Ein anderer User wurde ausgewählt
      if (this.selectedUser) {
        // Wenn bereits eine Karte sichtbar ist, erst ausblenden
        gsap.to(this.contactCard.nativeElement, {
          x: '100%', 
          opacity: 0, 
          duration: 0.5, 
          ease: 'power2.in', 
          onComplete: () => {
            // Nach dem Ausblenden die neue Karte anzeigen
            this.selectedUser = user;
            setTimeout(() => {
              if (this.contactCard) {
                gsap.fromTo(this.contactCard.nativeElement, 
                  { x: '100%', opacity: 0 }, 
                  { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
                );
              }
            }, 300);
          }
        });
      } else {
        // Wenn keine Karte sichtbar ist, einfach die neue Karte anzeigen
        this.selectedUser = user;
        setTimeout(() => {
          if (this.contactCard) {
            gsap.fromTo(this.contactCard.nativeElement, 
              { x: '100%', opacity: 0 }, 
              { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
          }
        });
      }
    }
  }


  hideContactCard() {
    // Animation mit GSAP, die Karte wieder herausgleiten lässt
    gsap.to(this.contactCard.nativeElement, 
      { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
        this.selectedUser = null;
      } });
  }

  

  addContact() {
    console.log('Contact added');
  }
}
