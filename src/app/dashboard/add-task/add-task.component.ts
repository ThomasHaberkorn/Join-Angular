import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, EventEmitter, Output, Input, Renderer2 } from '@angular/core';
import { addDoc, collection, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  /** Task object to hold current task data */
  task: Task = new Task();
  /** Array to hold all task data */
  tasks: Task[] = [];
  /** Array of users to select from in dropdown */
  users: User[] = [];
  /** List of assigned users for the current task */
  assignedUsers: User[] = [];
  /** Dropdown open state for assigned user selection */
  dropdownOpen = false;
  /** Placeholder for new subtask text */
  newSubtask: string = '';
  /** Holds the currently selected task for editing */
  selectedTask: Task | null = null;
  /** Indicates if component is displayed as modal */
  @Input() isModal: boolean = false;
  /** Default status for new tasks */
  @Input() status: string = 'todo';
  /** User type of the logged-in user */
  loggedInUserType: string = 'guest';
  /** Reference to the dropdown content element */
  @ViewChild('dropdownContent') dropdownContent!: ElementRef;
  /** Event emitted when modal is closed */
  @Output() close = new EventEmitter<void>();
  /** Overlay visibility state for validation errors */
  showValidationOverlay = false;
  /** State to show individual validation errors */
  showValidationErrors = false;
  /** Object to track validation errors for form fields */
  validationErrors: { [key: string]: boolean } = {};

  /**
   * Constructor with dependencies injected
   * @param {FormBuilder} fb - Angular FormBuilder for reactive forms
   * @param {Firestore} firestore - Firestore service for data handling
   * @param {Renderer2} renderer - Renderer2 for direct DOM manipulation
   * @param {ElementRef} elRef - ElementRef for referencing DOM elements
   */
  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private renderer: Renderer2,
    private elRef: ElementRef
  ) {}

  /**
   * Lifecycle hook - Initializes component, loads users and tasks, and sets priority
   */
  async ngOnInit() {
    const storedUserType = sessionStorage.getItem('userType');
    if (storedUserType) {
      this.loggedInUserType = storedUserType;
    }
    await this.loadTasksFromFirestore();
    await this.loadUsersFromFirestore();
    this.task.priority = 'Medium';
  }

  /**
   * Loads tasks from Firestore and populates the tasks array
   */
  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  /**
   * Loads users from Firestore and populates the users array
   */
  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  /**
   * Toggles the dropdown visibility for user selection
   * @param {MouseEvent} event - Event to stop propagation and toggle dropdown state
   */
  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  /**
   * Closes dropdown if it is open
   */
  closeDropdownIfOpen() {
    if (this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }

  /**
   * Adds or removes a user from the assignedUsers array
   * @param {User} user - User to toggle assignment
   */
  toggleAssignedTo(user: User) {
    const index = this.assignedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.assignedUsers.push(user);
    } else {
      this.assignedUsers.splice(index, 1);
    }
  }

  /**
   * Sets the priority of the task
   * @param {string} priority - Priority level to set ('Low', 'Medium', 'Urgent')
   */
  setPriority(priority: string) {
    this.task.priority = priority;
  }

  /**
   * Handles keydown events on priority buttons
   * @param {KeyboardEvent} event - Keydown event to prevent default on Enter or Space
   * @param {string} priority - Priority level to set
   */
  handlePrioKeydown(event: KeyboardEvent, priority: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.setPriority(priority);
    }
  }

  /**
   * Prevents form submission when Enter is pressed within text areas
   * @param {KeyboardEvent} event - Keydown event to prevent submission
   */
  preventEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  /**
   * Adds a new subtask to the task's subtask list
   * @param {HTMLElement} inputElement - HTML element holding subtask text
   */
  addSubtask(inputElement: HTMLElement) {
    const newSubtaskText = inputElement.innerText.trim();
    if (newSubtaskText !== '') {
      const newSubtask = new Subtask({ title: newSubtaskText });
      this.task.subtasks.push(newSubtask);
      inputElement.innerText = '';
    }
  }

  /**
   * Enables edit mode for a specific subtask
   * @param {number} index - Index of the subtask to edit
   */
  editSubtask(index: number) {
    if (this.task) {
      const subtask = this.task.subtasks[index];
      subtask.originalTitle = subtask.title;
      subtask.editing = true;
    }
  }

  /**
   * Saves changes made to a specific subtask
   * @param {number} index - Index of the subtask being saved
   */
  saveEditSubtask(index: number) {
    if (this.task) {
      const subtask = this.task.subtasks[index];
      subtask.editing = false;
      delete subtask.originalTitle;
    }
  }

  /**
   * Cancels editing for a specific subtask, restoring the original title
   * @param {number} index - Index of the subtask being canceled
   */
  cancelEditSubtask(index: number) {
    if (this.task) {
      const subtask = this.task.subtasks[index];
      subtask.title = subtask.originalTitle || subtask.title;
      subtask.editing = false;
      delete subtask.originalTitle;
    }
  }

  /**
   * Deletes a specific subtask from the task's subtask list
   * @param {number} index - Index of the subtask to delete
   */
  deleteSubtask(index: number) {
    this.task.subtasks.splice(index, 1);
  }

  /**
   * Clears the form and resets the task object
   */
  clearForm() {
    this.task = new Task();
    this.task.priority = 'Medium';
    this.assignedUsers = []; 
    this.closeModal();
  }

  /**
   * Creates a new task in Firestore if form validation passes
   * @param {string} status - Default status for the new task (default: 'todo')
   */
  async createTask(status: string = 'todo') {
    this.validationErrors = {
      title: !this.task.title,
      dueDate: !this.task.dueDate,
      category: !this.task.category,
    };
    if (!this.task.title || !this.task.dueDate || !this.task.category) {
      this.showValidation();
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

  /**
   * Shows the validation overlay for missing required fields
   */
  showValidation() {
    this.showValidationOverlay = true;
    this.showValidationErrors = true;
  }

  /**
   * Closes the validation overlay
   */
  closeValidationOverlay() {
    this.showValidationOverlay = false;
  }

  /**
   * Closes the modal and emits a close event
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * Cancels the operation and closes the modal
   */
  cancel() {
    this.closeModal();
  }

  /**
   * Retrieves the background color for a user's initials
   * @param {string} userId - ID of the user
   * @returns {string} - Background color or default color if user is not found
   */
  getUserColor(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.color : '#000000';
  }

  /**
   * Retrieves the initials of a user based on their ID
   * @param {string} userId - ID of the user
   * @returns {string} - User initials or empty string if user is not found
   */
  getUserInitials(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.initials : '';
  }
}

