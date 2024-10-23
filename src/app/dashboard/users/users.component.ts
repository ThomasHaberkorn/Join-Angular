import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { collection, Firestore, getDocs, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../models/task.class';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent{
  users: User[] = [];
  groupedUsers: { [key: string]: User[] } = {};
  selectedUser: User | null = null;
  editMode: boolean = false;
  addMode: boolean = false;
  newUser: User = new User();
  @ViewChild('contactCard') contactCard!: ElementRef;
  message: string = '';
  isSmallScreen: boolean = window.innerWidth < 1000;
  showContactList: boolean = true;

  constructor(private firestore: Firestore) { }

  // async ngOnInit() {
  //   await this.loadUsersFromFirestore();
  //   this.groupUsersByFirstLetter();
  // }

  async ngOnInit() {
    await this.loadUsersFromFirestore();
    this.groupUsersByFirstLetter();
    if (this.isSmallScreen) {
      this.showContactList = !this.selectedUser;
    } else {
      this.showContactList = true;
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

  groupUsersByFirstLetter() {
    this.groupedUsers = this.users.reduce((groups: { [key: string]: User[] }, user: User) => {
      const firstLetter = user.firstName[0].toUpperCase(); 
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(user);
      return groups;
    }, {});
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isSmallScreen = window.innerWidth < 1000;
    if (!this.isSmallScreen) {
      // Auf größeren Bildschirmen beides anzeigen
      this.showContactList = true;
    } else {
      // Auf kleineren Bildschirmen die Liste oder Karte basierend auf der Benutzerauswahl anzeigen
      this.showContactList = !this.selectedUser;
    }
  }
  

  // showContactCard(user: User) {
  //   if (this.selectedUser && this.selectedUser === user) {
  //     gsap.to(this.contactCard.nativeElement, {
  //       x: '100%', 
  //       opacity: 0, 
  //       duration: 0.5, 
  //       ease: 'power2.in', 
  //       onComplete: () => {
  //         this.selectedUser = null; 
  //       }
  //     });
  //   } else {
  //     if (this.selectedUser) {
  //       gsap.to(this.contactCard.nativeElement, {
  //         x: '100%', 
  //         opacity: 0, 
  //         duration: 0.5, 
  //         ease: 'power2.in', 
  //         onComplete: () => {
  //           this.selectedUser = user;
  //           setTimeout(() => {
  //             if (this.contactCard) {
  //               gsap.fromTo(this.contactCard.nativeElement, 
  //                 { x: '100%', opacity: 0 }, 
  //                 { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
  //               );
  //             }
  //           }, 300);
  //         }
  //       });
  //     } else {
  //       this.selectedUser = user;
  //       setTimeout(() => {
  //         if (this.contactCard) {
  //           gsap.fromTo(this.contactCard.nativeElement, 
  //             { x: '100%', opacity: 0 }, 
  //             { x: '0%', opacity: 1, duration: 0.5, ease: 'power2.out' }
  //           );
  //         }
  //       });
  //     }
  //   }
  // }

  showContactCard(user: User) {
    if (this.selectedUser && this.selectedUser === user) {
      gsap.to(this.contactCard.nativeElement, {
        x: '100%', 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.in', 
        onComplete: () => {
          this.selectedUser = null; 
        }
      });
    } else {
      if (this.selectedUser) {
        gsap.to(this.contactCard.nativeElement, {
          x: '100%', 
          opacity: 0, 
          duration: 0.5, 
          ease: 'power2.in', 
          onComplete: () => {
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
    if (this.isSmallScreen) {
      this.showContactList = false;
    }
  }


  hideContactCard() {
    gsap.to(this.contactCard.nativeElement, 
      { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
        this.selectedUser = null;
      } });
  }

  goBackToList() {
    if (this.isSmallScreen) {
      this.showContactList = true;
      this.selectedUser = null; // Optional: Setzen Sie den ausgewählten Benutzer zurück
    }
  }
  

  // ------------- Edit User ------------

  openEditContact() {
    if (this.selectedUser) {  
      this.editMode = true;
    }
  }

  async editContact() {
    if (this.selectedUser && this.selectedUser.id) {
      this.selectedUser.firstName = this.capitalizeName(this.selectedUser.firstName);
      this.selectedUser.lastName = this.capitalizeName(this.selectedUser.lastName);
      this.selectedUser.initials = this.getInitialsEdit(this.selectedUser.firstName, this.selectedUser.lastName);
      try {
        const userDocRef = doc(this.firestore, 'users', this.selectedUser.id); 
        await updateDoc(userDocRef, {
          firstName: this.selectedUser.firstName,
          lastName: this.selectedUser.lastName,
          email: this.selectedUser.email,
          initials: this.selectedUser.initials, 
          color: this.selectedUser.color,
          phone: this.selectedUser.phone,
          id: this.selectedUser.id
        });
  
        console.log('User updated:', this.selectedUser);
  
        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
  
        this.closeEditContact();
      } catch (error) {
        console.error('Error updating user in Firestore:', error);
      }
    }
  }
  
  getInitialsEdit(firstName: string, lastName: string): string {
    const firstInitial = firstName?.trim().charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.trim().charAt(0).toUpperCase() || '';
    
    return `${firstInitial}${lastInitial}`;
  }
  
  
  closeEditContact(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.editMode = false;
  } 

  

  // ------------- Ende Edit User ------------
  // ------------- Add User ------------

  openAddContact() {
    this.newUser = new User(); 
    this.addMode = true; 
  }
  
  closeAddContact(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.addMode = false;
  }
  

  
  async saveNewContact() {
    if (this.newUser.firstName && this.newUser.email) {
      this.newUser.firstName = this.capitalizeName(this.newUser.firstName);
      this.newUser.lastName = this.capitalizeName(this.newUser.lastName);
      this.newUser.initials = this.newUser.getInitials();
  
      try {
        const userCollection = collection(this.firestore, 'users');
        const newUserRef = await addDoc(userCollection, {}); // Leeres Dokument erstellen, um die ID zu erhalten
  
        this.newUser.id = newUserRef.id; // ID des erstellten Dokuments setzen
  
        // Benutzerdaten in Firestore aktualisieren
        await updateDoc(newUserRef, {
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          email: this.newUser.email,
          initials: this.newUser.initials,
          color: this.newUser.color,
          phone: this.newUser.phone,
          id: this.newUser.id,
          userType: 'user',
          password: '1',
        });
  
        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
  
        this.closeAddContact();
      } catch (error) {
        console.error('Error adding user to Firestore:', error);
      }
    }
  }
  


  capitalizeName(name: string): string {
    if (!name) return ''; 
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // ------------- Ende Add User -------------


   async deleteContact() {
    console.log('Delete user:', this.selectedUser);
    if (this.selectedUser && this.selectedUser.id) {
      const loggedInUserId = localStorage.getItem('userId');
      
      if (this.selectedUser.id === loggedInUserId) {
        this.message = 'Der angemeldete Benutzer kann nicht gelöscht werden.';
        
        setTimeout(() => {
          this.message = '';
        }, 2500); 
        
        return;
      }
  
      try {
        const userDocRef = doc(this.firestore, 'users', this.selectedUser.id);
        await deleteDoc(userDocRef);
        console.log('User deleted:', this.selectedUser);
  
        // Remove the deleted user from all tasks
        await this.removeDeletedUserFromTasks(this.selectedUser.id);
  
        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
  
        this.selectedUser = null;
  
        // Nach erfolgreicher Löschung die Nachricht löschen
        this.message = '';
      } catch (error) {
        console.error('Error deleting user from Firestore:', error);
        this.message = 'Ein Fehler ist aufgetreten. Der Benutzer konnte nicht gelöscht werden.';
      }
    }
  }
  

  async removeDeletedUserFromTasks(userId: string) {
    try {
      const taskCollection = collection(this.firestore, 'tasks');
      const querySnapshot = await getDocs(taskCollection);
  
      // Schleife über alle Aufgaben und entferne den gelöschten Benutzer aus den Zuweisungen
      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data() as Task;
  
        if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
          const updatedAssignedTo = taskData.assignedTo.filter(id => id !== userId);
          
          const taskDocRef = doc(this.firestore, 'tasks', taskDoc.id);
          await updateDoc(taskDocRef, { assignedTo: updatedAssignedTo });
          console.log(`User ${userId} removed from task ${taskDoc.id}`);
        }
      }
    } catch (error) {
      console.error('Error removing user from tasks:', error);
    }
  }
}

