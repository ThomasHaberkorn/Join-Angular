import { Component, ElementRef, ViewChild } from '@angular/core';
import { collection, Firestore, getDocs, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { FormsModule } from '@angular/forms';

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


  constructor(private firestore: Firestore) { }

  async ngOnInit() {
    await this.loadUsersFromFirestore();
    this.groupUsersByFirstLetter();
  }

  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map(doc => {
        const user = doc.data() as User;
        user.id = doc.id; 
        return user;
      });
      console.log('Users loaded:', this.users);
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
  }


  hideContactCard() {
    gsap.to(this.contactCard.nativeElement, 
      { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
        this.selectedUser = null;
      } });
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
        const newUserRef = await addDoc(userCollection, {
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          email: this.newUser.email,
          initials: this.newUser.initials,
          color: this.newUser.color,
          phone: this.newUser.phone,
          id: this.newUser.id
        });
  
        this.newUser.id = newUserRef.id;  
  
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
      try {
       const userDocRef = doc(this.firestore, 'users', this.selectedUser.id);
       await deleteDoc(userDocRef);
        
       console.log('User deleted:', this.selectedUser);

        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
        
        this.selectedUser = null;
      }
      catch (error) {
        console.error('Error deleting user from Firestore:', error);
      }
    }
  }

}
