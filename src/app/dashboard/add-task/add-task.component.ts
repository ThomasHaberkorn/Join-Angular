import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../../models/task.class';
import { User } from '../../../models/user.class';


@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})

export class AddTaskComponent {
  task: Task = new Task();
  tasks: Task[] = [];
  users: User[] = [];
  assignedUsers: User[] = [];
  dropdownOpen: boolean = false;
  newSubtask: string = '';
  // @ViewChild('subtaskInput') subtaskInput!: ElementRef;

  constructor(private fb: FormBuilder, private firestore: Firestore) { }

  async ngOnInit() {
    await this.loadTasksFromFirestore();
    await this.loadUsersFromFirestore();

    this.task.priority = 'Medium'; // Standard-Priorität setzen
  }

  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs.map(doc => doc.data() as Task);
      console.log('Tasks loaded:', this.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
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

   toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleAssignedTo(user: User) {
    const index = this.assignedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.assignedUsers.push(user); // Füge Benutzer hinzu, wenn er nicht ausgewählt war
    } else {
      this.assignedUsers.splice(index, 1); // Entferne Benutzer, wenn er bereits ausgewählt war
    }
  }

  setPriority(priority: string) {
    this.task.priority = priority;
  }

  // Handelt das Fokussieren und Auswählen per Tastatur
  handlePrioKeydown(event: KeyboardEvent, priority: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setPriority(priority);
    }
  }

  preventEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Verhindere das Hinzufügen einer neuen Zeile
    }
  }

  addSubtask(inputElement: HTMLElement) {
    const newSubtask = inputElement.innerText.trim();
    if (newSubtask !== '') {
      this.task.subtasks.push(newSubtask);
      inputElement.innerText = ''; // Input-Feld leeren, aber das Bild bleibt erhalten
    }
  }

  clearForm() {
    this.task = new Task(); // Setzt das Formular zurück
    this.task.priority = 'Medium';
  }

  createTask() {
    console.log('Task to be created:', this.task);
    // Hier kann die Logik hinzugefügt werden, um den Task in Firestore zu speichern
  }
}
