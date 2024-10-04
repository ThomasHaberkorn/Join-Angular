import { Component } from '@angular/core';
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { User } from '../../../models/user.class';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {
  users: User[] = [];

  constructor(private firestore: Firestore) { }

  async ngOnInit() {
    await this.loadUsersFromFirestore();
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

  addContact() {
    console.log('Contact added');
  }
}
