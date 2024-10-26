import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { collection, Firestore, getDocs, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.class';


/**
 * Component for managing users in the application.
 * Provides CRUD operations for users and groups users alphabetically.
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent{
   /** Array of users loaded from Firestore. */
   users: User[] = [];
  
   /** Users grouped alphabetically by the first letter of their first name. */
   groupedUsers: { [key: string]: User[] } = {};
   
   /** Currently selected user for viewing or editing. */
   selectedUser: User | null = null;
   
   /** Flag indicating if edit mode is active. */
   editMode: boolean = false;
   
   /** Flag indicating if add mode is active. */
   addMode: boolean = false;
   
   /** New user instance for adding a contact. */
   newUser: User = new User();
   
   /** Reference to the contact card element for animations. */
   @ViewChild('contactCard') contactCard!: ElementRef;
   
   /** Message to display feedback to the user. */
   message: string = '';
   
   /** Flag indicating if the screen width is considered small. */
   isSmallScreen: boolean = window.innerWidth < 1000;
   
   /** Flag to toggle the display of the contact list on small screens. */
   showContactList: boolean = true;


     /**
   * Initializes the component with Firestore.
   * @param {Firestore} firestore - Firestore service for accessing the database.
   */
  constructor(private firestore: Firestore) { }

 
    /**
   * Initializes the component by loading users, grouping them,
   * and setting the display of the contact list based on screen size.
   */
  async ngOnInit() {
    await this.loadUsersFromFirestore();
    this.groupUsersByFirstLetter();
    if (this.isSmallScreen) {
      this.showContactList = !this.selectedUser;
    } else {
      this.showContactList = true;
    }
  }
  

  /**
   * Loads users from Firestore and assigns unique IDs from Firestore.
   */
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


   /**
   * Groups users alphabetically by the first letter of their first name.
   */
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


  /**
   * Updates the screen size properties and toggles the contact list display on resize.
   * @param {Event} event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isSmallScreen = window.innerWidth < 1000;
    if (!this.isSmallScreen) {
      this.showContactList = true;
    } else {
      this.showContactList = !this.selectedUser;
    }
  }
  

   /**
   * Animates the display of the contact card for the selected user.
   * @param {User} user - The user to display in the contact card.
   */
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


   /**
   * Hides the contact card with an animation and resets the selected user.
   */
  hideContactCard() {
    gsap.to(this.contactCard.nativeElement, 
      { x: '100%', opacity: 0, duration: 0.5, ease: 'power2.in', onComplete: () => {
        this.selectedUser = null;
      } });
  }


    /**
   * Returns to the contact list view on small screens.
   */
  goBackToList() {
    if (this.isSmallScreen) {
      this.showContactList = true;
      this.selectedUser = null; 
    }
  }
  

  // ------------- Edit User ------------


   /**
   * Activates edit mode for the selected user.
   */
  openEditContact() {
    if (this.selectedUser) {  
      this.editMode = true;
    }
  }


  /**
   * Saves changes to the selected user's details in Firestore.
   */
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
        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
        this.closeEditContact();
      } catch (error) {
        console.error('Error updating user in Firestore:', error);
      }
    }
  }
  

  /**
   * Generates initials for a user based on their first and last name.
   * @param {string} firstName - The user's first name.
   * @param {string} lastName - The user's last name.
   * @returns {string} - The initials of the user.
   */
  getInitialsEdit(firstName: string, lastName: string): string {
    const firstInitial = firstName?.trim().charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.trim().charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }
  
  
  /**
   * Exits edit mode for the selected user.
   * @param {MouseEvent} [event] - The mouse event triggering this action.
   */
  closeEditContact(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.editMode = false;
  } 
  

  // ------------- Ende Edit User ------------
  // ------------- Add User ------------


  /**
   * Prepares a new user instance and activates add mode.
   */
  openAddContact() {
    this.newUser = new User(); 
    this.addMode = true; 
  }
  

  /**
   * Exits add mode without saving the new user.
   * @param {MouseEvent} [event] - The mouse event triggering this action.
   */
  closeAddContact(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.addMode = false;
  }
  

  /**
   * Saves the new user to Firestore and updates the user list.
   */
  async saveNewContact() {
    if (this.newUser.firstName && this.newUser.email) {
      this.newUser.firstName = this.capitalizeName(this.newUser.firstName);
      this.newUser.lastName = this.capitalizeName(this.newUser.lastName);
      this.newUser.initials = this.newUser.getInitials();
      try {
        const userCollection = collection(this.firestore, 'users');
        const newUserRef = await addDoc(userCollection, {}); 
        this.newUser.id = newUserRef.id; 
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
  

  /**
   * Capitalizes the first letter of a name.
   * @param {string} name - The name to capitalize.
   * @returns {string} - The capitalized name.
   */
  capitalizeName(name: string): string {
    if (!name) return ''; 
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // ------------- Ende Add User -------------
  // ------------- Delete User ------------

  /**
   * Deletes the selected user from Firestore and removes their assignments from tasks.
   */
   async deleteContact() {
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
        await this.removeDeletedUserFromTasks(this.selectedUser.id);
        await this.loadUsersFromFirestore();
        this.groupUsersByFirstLetter();
        this.selectedUser = null;
        this.message = '';
      } catch (error) {
        console.error('Error deleting user from Firestore:', error);
        this.message = 'Ein Fehler ist aufgetreten. Der Benutzer konnte nicht gelöscht werden.';
      }
    }
  }
  

  /**
   * Removes a deleted user from all tasks they were assigned to in Firestore.
   * @param {string} userId - The ID of the user to remove.
   */
  async removeDeletedUserFromTasks(userId: string) {
    try {
      const taskCollection = collection(this.firestore, 'tasks');
      const querySnapshot = await getDocs(taskCollection);
      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data() as Task;
        if (taskData.assignedTo && taskData.assignedTo.includes(userId)) {
          const updatedAssignedTo = taskData.assignedTo.filter(id => id !== userId);
          const taskDocRef = doc(this.firestore, 'tasks', taskDoc.id);
          await updateDoc(taskDocRef, { assignedTo: updatedAssignedTo });
        }
      }
    } catch (error) {
      console.error('Error removing user from tasks:', error);
    }
  }
}

