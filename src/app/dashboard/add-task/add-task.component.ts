import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { addDoc, collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
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

  deleteSubtask(index: number) {
    this.task.subtasks.splice(index, 1); // Entfernt den Subtask an der angegebenen Stelle
  }
  

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropdownButton = document.querySelector('.dropdown-button');

    if (dropdownContent && dropdownButton && !dropdownContent.contains(target) && !dropdownButton.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  clearForm() {
    this.task = new Task(); // Setzt das Formular zurück
    this.task.priority = 'Medium';
  }

  async createTask() {
    if (!this.task.title || !this.task.dueDate || !this.task.category) {
      console.error('Some required fields are missing');
      return;
    }
  
    try {
      const taskCollection = collection(this.firestore, 'tasks'); // 'tasks' ist der Name der Firestore-Sammlung
      await addDoc(taskCollection, {
        id: this.task.id,
        title: this.task.title,
        description: this.task.description,
        assignedTo: this.assignedUsers.map(user => user.id), // IDs der zugewiesenen Benutzer
        dueDate: this.task.dueDate,
        priority: this.task.priority,
        category: this.task.category,
        subtasks: this.task.subtasks,
        status: 'todo'
      });
  
      console.log('Task successfully added to Firestore', this.task);
      // Optional: Formular zurücksetzen oder auf eine andere Seite navigieren
      this.clearForm();
    } catch (error) {
      console.error('Error adding task to Firestore:', error);
    }
  }
}
