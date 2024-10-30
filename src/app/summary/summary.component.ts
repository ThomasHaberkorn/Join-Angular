
import { Component } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Task } from '../../models/task.class';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


/**
 * Component for displaying a summary view of tasks, task counts, and a greeting for the user.
 * Loads tasks from Firestore based on the user type and provides task statistics.
 */
@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss', './summary.media.scss']
})
export class SummaryComponent {
  /** Array of tasks loaded from Firestore. */
  tasks: Task[] = [];
  
  /** Type of the logged-in user ('guest' by default). */
  userType: string = 'guest';
  
  /** First name of the logged-in user. */
  firstName: string = '';
  
  /** Counts of tasks in various statuses. */
  todoCount: number = 0;
  doneCount: number = 0;
  urgentCount: number = 0;
  nextUrgentDeadline: Date | null = null;
  tasksInBoardCount: number = 0;
  inProgressCount: number = 0;
  awaitingFeedbackCount: number = 0;
  
  /** Greeting message for the user based on the time of day. */
  greeting: string = '';

 
    /**
   * Initializes component with Firestore and Router services.
   * @param {Firestore} firestore - Firestore service for loading tasks.
   * @param {Router} router - Router service for navigation.
   */
  constructor(private firestore: Firestore, private router: Router) {}


    /**
   * Initializes the component by setting user details, updating greeting,
   * loading tasks, and counting task statuses.
   */
  async ngOnInit() {
    this.userType = sessionStorage.getItem('userType') || 'guest';
    this.firstName = localStorage.getItem('firstName') || '';
    this.updateGreeting();
    await this.loadTasksFromFirestore();
    this.countTasks();
  }


  /**
   * Loads tasks from Firestore for the current user type and filters based on the user type.
   */
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


    /**
   * Counts tasks by their status and priority and calculates the next urgent deadline.
   */
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


   /**
   * Updates the greeting message based on the current time of day.
   */
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


   /**
   * Navigates to the board view.
   */
  navigateToBoard() {
    this.router.navigate(['/board']);
  }
}
