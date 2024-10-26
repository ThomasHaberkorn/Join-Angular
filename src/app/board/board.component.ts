import { Component } from '@angular/core';
import { collection, deleteDoc, doc, Firestore, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subtask, Task } from '../../models/task.class';
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { AddTaskComponent } from '../add-task/add-task.component';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, AddTaskComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {

  /** Task object for adding a new task. */
  task: Task = new Task();

  /** Title of a new subtask to add to the selected task */
  newSubtaskTitle: string = '';

  /** Search term for filtering tasks by title or description. */
  searchTerm: string = '';

  /** Currently selected task for viewing or editing. */
  selectedTask: Task | null = null;
  
  /** Array of tasks loaded from Firestore. */
  tasks: Task[] = [];
  
  /** Array of users loaded from Firestore. */
  users: User[] = [];
  
  /** Boolean indicating if Add Task modal is visible. */
  showAddTaskModal: boolean = false;
  
  /** Boolean indicating if Edit Task modal is visible. */
  showEditTaskModal: boolean = false;
  
  /** Boolean indicating if the user is dragging a task. */
  isDragging: boolean = false;
  
  /** Currently hovered task status column during drag-and-drop. */
  draggingOver: string = '';

  /** Form control variables for task editing. */
  editTitle: string = '';
  editDueDate: Date | null = null;
  editPriority: string = '';
  editDescription: boolean = false;
  editDescriptionText: string = '';

  /** Indicates the logged-in user's type ('guest' by default). */
  loggedInUserType: string = 'guest';

  /** Shows or hides the user assignment dropdown. */
  dropdownOpen: boolean = false;



   /**
   * Initializes the component with FormBuilder and Firestore.
   * @param {FormBuilder} fb - Angular form builder for reactive forms.
   * @param {Firestore} firestore - Angular Firestore service for Firebase data operations.
   */
  constructor(private fb: FormBuilder, private firestore: Firestore) {}

  
 /**
   * Initializes component by loading tasks and users from Firestore
   * and sets default task priority.
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
   * Loads all tasks from Firestore and maps them to Task objects.
   */
  async loadTasksFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'tasks'));
      this.tasks = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const task = new Task({
          ...data,
          subtasks: data['subtasks'] ? data['subtasks'].map((st: any) => new Subtask(st)) : [],
        });
        task.id = doc.id;
        return task;
      }
    );}
    catch (error) {
      console.error('Error loading tasks:', error);
    }
  }
    
  
  /**
   * Removes a deleted user from assigned tasks.
   * @param {string} userId - ID of the user to remove from tasks.
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

  
  /**
  * Updates the assigned users for a specific task in Firestore.
  * @param {Task} task - The task to update with assigned users.
  */
  async updateTaskAssignedUsers(task: Task) {
    if (task.id) {
      const taskDocRef = doc(this.firestore, 'tasks', task.id);
      await updateDoc(taskDocRef, { assignedTo: task.assignedTo });
    }
  }


  /**
   * Loads all users from Firestore and maps them to User objects.
   */
  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  
  /**
   * Updates the task status in Firestore and reloads tasks.
   * @param {Task} task - The task to update.
   */
  async updateTaskStatus(task: Task) {
    if (task.id) {
      try {
        const taskDocRef = doc(this.firestore, 'tasks', task.id);
        await updateDoc(taskDocRef, { status: task.status });
        await this.loadTasksFromFirestore();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
    this.closeCardDetail()
  }
  

// ----------------- Drag & Drop ----------------- //


 /**
   * Handles drag start event for a task card, setting up drag image and data transfer.
   * @param {DragEvent} event - The drag event.
   * @param {string} taskId - ID of the task being dragged.
   */
  onDragStart(event: DragEvent, taskId: string) {
    this.isDragging = true;
    event.dataTransfer?.setData('taskId', taskId);
    const taskCardElement = (event.target as HTMLElement).closest('.taskCard') as HTMLElement;
    if (taskCardElement && event.dataTransfer) {
      const dragImageNode = taskCardElement.cloneNode(true);
      const dragImage = dragImageNode as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.pointerEvents = 'none';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.width = `${taskCardElement.offsetWidth}px`;
      dragImage.classList.remove('dragging');
      document.body.appendChild(dragImage);
      const rect = taskCardElement.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
  
      taskCardElement.classList.add('dragging');
    }
  }
 

    /**
   * Handles the drag-over event for tasks to allow drop.
   * @param {Event} event - The drag event.
   * @param {string} zone - The zone the task is being dragged over.
   */
  onDragOver(event: Event, zone: string) {
    if (event instanceof DragEvent) {
      event.preventDefault();
      event.dataTransfer!.dropEffect = 'move';
    }
    this.draggingOver = zone;
  }
  

  /**
   * Handles the drop event for a task to update its status in Firestore.
   * @param {Event} event - The drop event.
   * @param {string} newStatus - The new status to assign to the task.
   */
  onTaskDrop(event: Event, newStatus: string) {
    this.isDragging = false;
    this.draggingOver = '';
    let taskId: string | undefined;
    if (event instanceof DragEvent) {
      event.preventDefault();
      taskId = event.dataTransfer?.getData('taskId');
    }
    if (taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        this.updateTaskStatus(task);
        const taskCardElement = document.querySelector('.taskCard.dragging') as HTMLElement;
        if (taskCardElement) {
          taskCardElement.style.transform = '';
          taskCardElement.style.position = '';
          taskCardElement.style.zIndex = '';
        }
      }
    }
  }


   /**
   * Ends the drag event, cleans up drag images, and resets dragging status.
   */
  onDragEnd() {
    this.isDragging = false;
    this.draggingOver = '';
    const dragImages = document.querySelectorAll('.taskCard');
    dragImages.forEach(img => {
      const element = img as HTMLElement;
      if (element.style.top === '-1000px') {
        element.remove();
      }
    });
    const taskCards = document.querySelectorAll('.taskCard.dragging');
    taskCards.forEach(card => {
      const element = card as HTMLElement;
      element.classList.remove('dragging');
    });
  }

  
// ----------------- Drag & Drop End ----------------- //

  
  /**
   * Retrieves a user's color by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {string} - The color assigned to the user.
   */
  getUserColor(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.color : '#000000'; 
  }


    /**
   * Retrieves a user's initials by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {string} - The initials of the user.
   */
  getUserInitials(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.initials : '';
  }


   /**
   * Retrieves the full name of a user by their ID.
   * @param {string} userId - The ID of the user.
   * @returns {string} - The full name of the user or 'Unknown User' if not found.
   */
  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
  

   /**
   * Returns a CSS class for the category type of a task.
   * @param {string} categoryName - The name of the category.
   * @returns {string} - The CSS class for the category.
   */
  getCategoryClass(categoryName: string): string {
    switch (categoryName) {
      case 'User Story':
        return 'userStory';
      case 'Technical Task':
        return 'techTask';
      default:
        return 'defaultCategory'; 
    }
  }


   /**
   * Filters tasks by status, user type, search term, and sorts by due date.
   * @param {string} status - The status to filter tasks by.
   * @returns {Task[]} - Array of tasks matching the criteria.
   */
  getTasksByStatus(status: string): Task[] {
    return this.tasks
      .filter(task => task.status === status)
      .filter(task => task.userType === this.loggedInUserType)
      .filter(task => {
        const term = this.searchTerm.toLowerCase();
        return (
          !term ||
          task.title.toLowerCase().includes(term) ||
          task.description.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
  }
  

  /**
   * Returns the path to the image representing the task priority.
   * @param {string} priority - The priority of the task.
   * @returns {string} - The path to the priority image.
   */
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


   /**
   * Checks if there are no tasks with a specified status.
   * @param {string} status - The status to check for tasks.
   * @returns {boolean} - True if there are no tasks with the given status, false otherwise.
   */
  hasNoTasks(status: string): boolean {
    return this.tasks.filter(task => task.status === status).length === 0;
  }


    /**
   * Toggles the display of the Add Task modal and initializes a new task.
   * @param {string} [status='todo'] - Initial status for the new task.
   */
  openAddTaskModal(status: string = 'todo') {
    this.showAddTaskModal = true;
    this.task = new Task(status); 
    this.task.status = status; 
  }
  

  /**
   * Closes the Add Task modal and reloads tasks from Firestore.
   */
  closeAddTaskModal() {
    this.showAddTaskModal = false;
    this.loadTasksFromFirestore();
  }

/**
   * Toggles the Edit modal for the specified task, preloading editable fields.
   * @param {Task} task - Task to be edited.
   */
   openEditTaskModal(task: Task) {
    if (task) {
      this.selectedTask = new Task(task);
      this.editTitle = this.selectedTask.title;
      this.editDescriptionText = this.selectedTask.description; 
      this.editDueDate = this.selectedTask.dueDate;
      this.editPriority = this.selectedTask.priority;
      this.showEditTaskModal = true;
    }
  }
  
  /**
   * Closes the Edit Task modal without saving changes.
   */
  closeEditTaskModal() {
    this.showEditTaskModal = false;
    this.selectedTask = null;
  }

 
  /**
   * Opens the task detail view for a specific task.
   * @param {Task} task - The task to view in detail.
   */
  openTaskDetail(task: Task) {
    this.selectedTask = new Task({
      ...task,
      subtasks: task.subtasks.map((subtask) => new Subtask(subtask))
    });
  }
  

    /**
   * Closes the task detail view.
   */
  closeCardDetail() {
    this.selectedTask = null;
  }


  /**
   * Adds a new subtask to the currently selected task.
   */
  addSubtask() {
    if (this.newSubtaskTitle.trim() !== '' && this.selectedTask) {
      const newSubtask = new Subtask({ title: this.newSubtaskTitle.trim() });
      this.selectedTask.subtasks.push(newSubtask);
      this.newSubtaskTitle = '';
    }
  }


   /**
   * Deletes a subtask from the currently selected task.
   * @param {number} index - The index of the subtask to delete.
   */
  deleteSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks.splice(index, 1);
    }
  }

  
  /**
   * Toggles the completion status of a subtask and updates progress.
   * @param {number} subtaskIndex - Index of the subtask.
   * @param {Event} event - Checkbox change event.
   */
  toggleSubtaskDone(subtaskIndex: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (this.selectedTask) {
      this.selectedTask.subtasks[subtaskIndex].done = isChecked;
      const taskIndex = this.tasks.findIndex((t) => t.id === this.selectedTask!.id);
      if (taskIndex > -1) {
        this.tasks[taskIndex].subtasks[subtaskIndex].done = isChecked;
        this.updateTaskSubtasks(this.tasks[taskIndex]);
      }
      this.updateTaskProgress(this.tasks[taskIndex]);
    }
  }
  

    /**
   * Updates the subtasks of a task in Firestore.
   * @param {Task} task - The task to update subtasks for.
   */
  async updateTaskSubtasks(task: Task) {
    if (task.id) {
      const taskDocRef = doc(this.firestore, 'tasks', task.id);
      const updatedSubtasks = task.subtasks.map(subtask => subtask.toJSON());
      await updateDoc(taskDocRef, { subtasks: updatedSubtasks });
    }
  }


   /**
   * Updates the progress of a task based on completed subtasks.
   * @param {Task} task - The task to update.
   */
  updateTaskProgress(task: Task) {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.done).length;
    task.progress = (completedSubtasks / totalSubtasks) * 100;
  }


    /**
   * Retrieves the count of completed subtasks for a task.
   * @param {Task} task - The task to count completed subtasks for.
   * @returns {number} - The number of completed subtasks.
   */
  getCompletedSubtaskCount(task: Task): number {
    return task.subtasks.filter(subtask => subtask.done).length;
  }


    /**
   * Calculates the percentage of completed subtasks for a task.
   * @param {Task} task - The task to calculate completion for.
   * @returns {number} - The completion percentage.
   */
  getSubtaskCompletionPercentage(task: Task): number {
    if (task.subtasks.length === 0) {
      return 0;
    }
    const completedCount = task.subtasks.filter(subtask => subtask.done).length;
    return (completedCount / task.subtasks.length) * 100;
  }


    /**
   * Updates the selected task in Firestore.
   */
  async updateTask() {
    if (this.selectedTask && this.selectedTask.id) {
      try {
        const taskDocRef = doc(this.firestore, 'tasks', this.selectedTask.id);
        await updateDoc(taskDocRef, this.selectedTask.toJSON());
        this.closeEditTaskModal();
        await this.loadTasksFromFirestore();
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  }


   /**
   * Toggles the dropdown display for assigned users.
   */
  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  
    /**
   * Checks if a user is assigned to the selected task.
   * @param {string} userId - The ID of the user.
   * @returns {boolean} - True if the user is assigned, false otherwise.
   */
  isUserAssigned(userId: string | undefined): boolean {
    return this.selectedTask?.assignedTo.includes(userId!) || false;
  }


    /**
   * Toggles a user's assignment to the selected task.
   * @param {string} userId - The ID of the user to toggle.
   * @param {Event} event - The checkbox event.
   */
  toggleUserAssignment(userId: string | undefined, event: Event) {
    if (!userId || !this.selectedTask) {
      return;
    }
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.selectedTask.assignedTo.includes(userId)) {
        this.selectedTask.assignedTo.push(userId);
      }
    } else {
      this.selectedTask.assignedTo = this.selectedTask.assignedTo.filter(id => id !== userId);
    }
    this.updateTaskAssignedUsers(this.selectedTask);
  }


  /**
   * Closes the user assignment dropdown when clicking outside of it.
   * @param {Event} event - The click event.
   */
  onDocumentClick(event: Event) {
    const dropdownButton = document.querySelector('.editAssignedToField');
    const dropdownElement = document.querySelector('.dropdown');
    if (
      this.dropdownOpen &&
      dropdownElement &&
      !dropdownElement.contains(event.target as Node) &&
      dropdownButton &&
      !dropdownButton.contains(event.target as Node)
    ) {
      this.toggleDropdown();
    }
  }


  /**
   * Toggles the user assignment checkbox for a specific user.
   * @param {string} userId - The ID of the user.
   */
  toggleCheckbox(userId: string) {
    if (!this.selectedTask) {
      return;
    }
    const isAssigned = this.isUserAssigned(userId);
    if (isAssigned) {
      this.selectedTask.assignedTo = this.selectedTask.assignedTo.filter(id => id !== userId);
    } else {
      this.selectedTask.assignedTo.push(userId);
    }
    this.updateTaskAssignedUsers(this.selectedTask);
  }

  
   /**
   * Enables edit mode for a specific subtask.
   * @param {number} index - The index of the subtask to edit.
   */
  editSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = true;
    }
  }


  /**
   * Saves edits made to a specific subtask and exits edit mode.
   * @param {number} index - The index of the subtask to save.
   */
  saveEditSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = false;
    }
  }
  

  /**
   * Cancels edits for a specific subtask and exits edit mode.
   * @param {number} index - The index of the subtask to cancel.
   */
  cancelEditSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = false;
    }
  }


   /**
   * Deletes a task by ID from Firestore and updates the task list.
   * @param {string} taskId - ID of the task to delete.
   */
  async deleteTask(taskId?: string) {
    if (!taskId) {
      console.error('Task ID is not defined');
      return;
    }
      try {
        const taskDocRef = doc(this.firestore, 'tasks', taskId);
        await deleteDoc(taskDocRef);
  
        this.tasks = this.tasks.filter(task => task.id !== taskId);
  
        this.closeCardDetail();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
  }
  

    /**
   * Toggles edit mode for a specified field, setting up the current value.
   * @param {string} field - The field to enable edit mode for (e.g., 'description').
   */
  toggleEdit(field: string) {
    if (field === 'description') {
      this.editDescription = true;
      this.editDescriptionText = this.selectedTask?.description || '';
    }
  }


   /**
   * Saves edits to a specified field and updates it in Firestore.
   * @param {string} field - The field to save (e.g., 'description').
   */
  saveEdit(field: string) {
    if (field === 'description') {
      if (this.selectedTask) {
        this.selectedTask.description = this.editDescriptionText;
      }
      this.editDescription = false;
      if (this.selectedTask?.id) {
        this.updateTaskField(this.selectedTask.id, 'description', this.selectedTask.description);
      }
    }
  }
    
   
   /**
   * Cancels edit mode for a specified field without saving changes.
   * @param {string} field - The field to cancel edit mode for (e.g., 'description').
   */
cancelEdit(field: string) {
  if (field === 'description') {
    this.editDescription = false;
    if (this.selectedTask) {
      this.editDescriptionText = this.selectedTask.description;
    }
  }
}


  /**
   * Handles keyboard events for changing task priority via keyboard input.
   * @param {KeyboardEvent} event - The keyboard event.
   * @param {string} priority - The priority to set if triggered.
   */
handlePrioKeydown(event: KeyboardEvent, priority: string) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    this.editPriority = priority;
  }
}


  /**
   * Updates a specific field of a task in Firestore.
   * @param {string} taskId - The ID of the task to update.
   * @param {string} field - The field to update (e.g., 'description').
   * @param {any} value - The new value to set for the field.
   */
   async updateTaskField(taskId: string, field: string, value: any) {
    try {
      const taskDocRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        [field]: value
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  }


   /**
   * Saves the current task edits and updates assigned users, due date, and priority.
   */
  saveTask() {
    if (this.selectedTask) {
      this.selectedTask.title = this.editTitle;
      this.selectedTask.description = this.editDescriptionText;
      if (this.editDueDate) {
        this.selectedTask.dueDate = this.editDueDate;
      }
      this.selectedTask.priority = this.editPriority;
      this.updateTaskAssignedUsers(this.selectedTask);
      this.updateTask(); 
    }
    this.closeEditTaskModal(); 
  }
  

   /**
   * Closes the Edit Task modal without saving changes.
   */
  cancelEditCard() {
    this.closeEditTaskModal();
  }
}



