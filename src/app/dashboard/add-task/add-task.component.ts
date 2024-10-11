import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { addDoc, collection, Firestore, getDoc, getDocs } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subtask, Task } from '../../../models/task.class';
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
  @Input() isModal: boolean = false;
  @Input() status: string = 'todo';
  loggedInUserType: string = 'guest';
  // @ViewChild('subtaskInput') subtaskInput!: ElementRef;

  @Output() close = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private firestore: Firestore) { }

  async ngOnInit() {

    const storedUserType = sessionStorage.getItem('userType');
    if (storedUserType) {
      this.loggedInUserType = storedUserType;
    }
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
    const newSubtaskText = inputElement.innerText.trim();
    if (newSubtaskText !== '') {
      // Erstelle ein neues Subtask-Objekt
      const newSubtask = new Subtask({ title: newSubtaskText });
      this.task.subtasks.push(newSubtask); // Füge die neue Subtask-Instanz hinzu
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
    this.task = new Task(); 
    this.task.priority = 'Medium';
  }

  async createTask(status: string = 'todo') {
    
    if (!this.task.title || !this.task.dueDate || !this.task.category) {
      console.error('Some required fields are missing');
      return;
    }
    const dueDate = typeof this.task.dueDate === 'string' ? this.task.dueDate : this.task.dueDate.toISOString();
    try {
      const taskCollection = collection(this.firestore, 'tasks'); 
      await addDoc(taskCollection, {
        id: this.task.id || '', 
        title: this.task.title,
        description: this.task.description || '', 
        assignedTo: this.assignedUsers.map(user => user.id) || [], 
        dueDate: dueDate,
        priority: this.task.priority || 'Medium', 
        category: this.task.category,
        subtasks: this.task.subtasks.map(subtask => subtask.toJSON()) || [], 
        status: this.status,
        progress: this.task.progress || 0,
        userType: this.loggedInUserType, 
      });
      console.log('Task successfully added to Firestore', this.task);
      this.clearForm();
    } catch (error) {
      console.error('Error adding task to Firestore:', error);
    }
    this.closeModal();
  }
  

  closeModal() {
    this.close.emit();
  }

  cancel() {
    this.closeModal();
  }

  
}
