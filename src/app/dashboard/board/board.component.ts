import { Component } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../../models/task.class';
import { User } from '../../../models/user.class';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  task: Task = new Task();
  tasks: Task[] = [];
  users: User[] = [];
  assignedUsers: User[] = [];
  dropdownOpen: boolean = false;
  isDragging: boolean = false;
  draggingOver: string = '';

  constructor(private fb: FormBuilder, private firestore: Firestore) { }

  async ngOnInit() {
    await this.loadTasksFromFirestore();
    await this.loadUsersFromFirestore();

    this.task.priority = 'Medium'; 
  }

  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs.map((doc) => {
        const task = doc.data() as Task;
        
        task.id = doc.id; 
        return task;
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    console.log('Tasks loaded:', this.tasks);
  }

 
  async updateTaskStatus(task: Task) {
    if (task.id) {
      const taskDocRef = doc(this.firestore, 'tasks', task.id);
      await updateDoc(taskDocRef, { status: task.status });
    }
  }

  onDragStart(event: DragEvent, taskId: string) {
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', taskId);
    event.dataTransfer!.effectAllowed = 'move';
  }
 

  onDragOver(event: DragEvent, zone: string) {
    event.preventDefault(); 
    this.draggingOver = zone; 
    event.dataTransfer!.dropEffect = 'move';
  }


  onTaskDrop(event: DragEvent, newStatus: string) {
    console.log('task dropped in zone:', newStatus);
    this.isDragging = false;
    this.draggingOver = '';
    const taskId = event.dataTransfer?.getData('text/plain');
    console.log('taskId from dataTransfer:', taskId);
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      this.updateTaskStatus(task);
    }
  }

  onDragEnd() {
    this.isDragging = false;
    this.draggingOver = ''; 
  }

  
  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  getUserInitials(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.initials : '';
  }
  
  getPriorityImage(priority: string): string {
    switch (priority) {
      case 'Low':
        return './../../../assets/img/lowSymbol.png';
      case 'Medium':
        return './../../../assets/img/mediumSymbol.png';
      case 'Urgent':
        return './../../../assets/img/urgentSymbol.png';
      default:
        return './../../../assets/img/help.png';
    }
  }

  hasNoTasks(status: string): boolean {
    return this.tasks.filter(task => task.status === status).length === 0;
  }
  

  addTask() {
    console.log('add task');
  }
}
