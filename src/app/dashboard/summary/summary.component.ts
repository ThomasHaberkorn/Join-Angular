
import { Component } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Task } from '../../../models/task.class';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  tasks: Task[] = [];
  userType: string = 'guest';
  firstName: string = '';

  todoCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  nextUrgentDeadline: Date | null = null;
  tasksInBoardCount: number = 0;
  inProgressCount: number = 0;
  awaitingFeedbackCount: number = 0;
  greeting: string = '';

  constructor(private firestore: Firestore, private router: Router) {}

  async ngOnInit() {
    this.userType = sessionStorage.getItem('userType') || 'guest';
    this.firstName = localStorage.getItem('firstName') || '';
    this.updateGreeting();
    await this.loadTasksFromFirestore();
    this.countTasks();
  }

  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs
        .map(doc => doc.data() as Task)
        .filter(task => task['userType'] === this.userType);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  countTasks() {
    this.todoCount = this.tasks.filter(task => task.status === 'todo').length;
    this.doneCount = this.tasks.filter(task => task.status === 'done').length;
    this.urgentCount = this.tasks.filter(task => task.priority === 'Urgent').length;
    this.tasksInBoardCount = this.tasks.length;
    this.inProgressCount = this.tasks.filter(task => task.status === 'inProgress').length;
    this.awaitingFeedbackCount = this.tasks.filter(task => task.status === 'awaitFeedback').length;

    const urgentTasks = this.tasks.filter(task => task.priority === 'Urgent' && task.dueDate);
    if (urgentTasks.length > 0) {
      const sortedUrgentTasks = urgentTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      this.nextUrgentDeadline = new Date(sortedUrgentTasks[0].dueDate);
    }
  }

  updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6) {
      this.greeting = `Good night,`;
    } else if (hour < 12) {
      this.greeting = `Good morning,`;
    } else if (hour < 18) {
      this.greeting = `Good day,`;
    } else if (hour < 21) {
      this.greeting = `Good afternoon,`;
    } else {
      this.greeting = `Good evening,`;
    }
  }

  navigateToBoard() {
    this.router.navigate(['/dashboard/board']);
  }
}
