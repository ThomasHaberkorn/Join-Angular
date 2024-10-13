import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, EventEmitter, Output, Input, Renderer2 } from '@angular/core';
import { addDoc, collection, Firestore, getDocs } from '@angular/fire/firestore';
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
  dropdownOpen = false;
  newSubtask: string = '';
  @Input() isModal: boolean = false;
  @Input() status: string = 'todo';
  loggedInUserType: string = 'guest';
  @ViewChild('dropdownContent') dropdownContent!: ElementRef;
  @Output() close = new EventEmitter<void>();
  constructor(private fb: FormBuilder, private firestore: Firestore, private renderer: Renderer2, private elRef: ElementRef) { }


  async ngOnInit() {
    const storedUserType = sessionStorage.getItem('userType');
    if (storedUserType) {
      this.loggedInUserType = storedUserType;
    }
    await this.loadTasksFromFirestore();
    await this.loadUsersFromFirestore();
    this.task.priority = 'Medium'; 
  }
  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs.map(doc => doc.data() as Task);
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

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation(); 
    this.dropdownOpen = !this.dropdownOpen;
  }

 
  closeDropdownIfOpen() {
    if (this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }

  toggleAssignedTo(user: User) {
    const index = this.assignedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.assignedUsers.push(user); 
    } else {
      this.assignedUsers.splice(index, 1); 
    }
  }

  setPriority(priority: string) {
    this.task.priority = priority;
  }

  handlePrioKeydown(event: KeyboardEvent, priority: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setPriority(priority);
    }
  }

  preventEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault(); 
    }
  }


  addSubtask(inputElement: HTMLElement) {
    const newSubtaskText = inputElement.innerText.trim();
    if (newSubtaskText !== '') {
      const newSubtask = new Subtask({ title: newSubtaskText });
      this.task.subtasks.push(newSubtask); 
      inputElement.innerText = ''; 
    }
  }
  

  deleteSubtask(index: number) {
    this.task.subtasks.splice(index, 1); 
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
      const newTaskRef = await addDoc(taskCollection, {
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
      this.task.id = newTaskRef.id;
      this.clearForm();
    } catch (error) {
      console.error('Error adding task to Firestore:', error);
    }
    this.closeModal();
  }


  getUserColor(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.color : '#000000'; 
  }

  getUserInitials(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.initials : '';
  }
  

  closeModal() {
    this.close.emit();
  }

  cancel() {
    this.closeModal();
  }

  
}
