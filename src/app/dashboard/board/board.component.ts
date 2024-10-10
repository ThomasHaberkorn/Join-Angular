import { Component, ViewChild, ElementRef, HostListener, EventEmitter, Output, Input } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subtask, Task } from '../../../models/task.class';
import { User } from '../../../models/user.class';
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
  task: Task = new Task();
  tasks: Task[] = [];
  users: User[] = [];
  assignedUsers: User[] = [];
  dropdownOpen: boolean = false;
  isDragging: boolean = false;
  draggingOver: string = '';
  showAddTaskModal: boolean = false;
  showEditTaskModal: boolean = false;
  selectedTask: Task | null = null;
  hoverEditIcon: boolean = false;
  newSubtaskTitle: string = '';
  editTitle: string = '';
  editDueDate: Date | null = null;
  editPriority: string = '';
  editDescription: boolean = false;
  editDescriptionText: string = '';
 



  constructor(private fb: FormBuilder, private firestore: Firestore) {

   }

  async ngOnInit() {
    await this.loadTasksFromFirestore();
    await this.loadUsersFromFirestore();
    this.task.priority = 'Medium'; 
  }

  
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
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }
  
  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async updateTaskStatus(task: Task) {
    if (task.id) {
      const taskDocRef = doc(this.firestore, 'tasks', task.id);
      await updateDoc(taskDocRef, { status: task.status });
    }
  }


  onDragStart(event: DragEvent, taskId: string) {
    this.isDragging = true;
    event.dataTransfer?.setData('taskId', taskId);
  
    const taskCardElement = (event.target as HTMLElement).closest('.taskCard') as HTMLElement;
  
    if (taskCardElement && event.dataTransfer) {
      // Klone die taskCard
      const dragImageNode = taskCardElement.cloneNode(true);
      const dragImage = dragImageNode as HTMLElement; // Cast auf HTMLElement
      dragImage.style.position = 'absolute';
      dragImage.style.pointerEvents = 'none';
      dragImage.style.top = '-1000px'; // Verstecke es außerhalb des sichtbaren Bereichs
      dragImage.style.left = '-1000px';
      dragImage.style.width = `${taskCardElement.offsetWidth}px`;
  
      // Entferne die Klasse 'dragging' vom Drag-Image
      dragImage.classList.remove('dragging');
  
      // Füge das Drag-Image dem Body hinzu
      document.body.appendChild(dragImage);
  
      // Verwende den Klon als Drag-Image
      const rect = taskCardElement.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      event.dataTransfer.setDragImage(dragImage, offsetX, offsetY);
  
      // Blende die originale Karte aus
      taskCardElement.classList.add('dragging');
    }
  }
  
  


  onDragOver(event: DragEvent, zone: string) {
    event.preventDefault(); 
    this.draggingOver = zone; 
    event.dataTransfer!.dropEffect = 'move';
  }


  onTaskDrop(event: DragEvent, newStatus: string) {
    this.isDragging = false; // Dragging auf false setzen
    this.draggingOver = ''; // Reset der Dropzone
    const taskId = event.dataTransfer?.getData('taskId');
    const task = this.tasks.find(t => t.id === taskId);

    if (task) {
        // Task-Status nur ändern, wenn eine gültige neue Dropzone vorhanden ist
        task.status = newStatus;
        this.updateTaskStatus(task);
    } else {
        // Wenn keine gültige Dropzone erreicht wird, kehrt die Karte zurück
        this.resetTaskPosition();
    }
}

  
  onDragEnd() {
    this.isDragging = false;
    this.draggingOver = '';
  
    // Entferne das Drag-Image
    const dragImages = document.querySelectorAll('.taskCard');
    dragImages.forEach(img => {
      const element = img as HTMLElement; // Cast auf HTMLElement
      if (element.style.top === '-1000px') {
        element.remove();
      }
    });
  
    // Entferne die Klasse 'dragging' von der Originalkarte
    const taskCards = document.querySelectorAll('.taskCard.dragging');
    taskCards.forEach(card => {
      const element = card as HTMLElement; // Cast auf HTMLElement
      element.classList.remove('dragging');
    });
  }
  
  

resetTaskPosition() {
  const taskCard = document.querySelector('.taskCard.dragging') as HTMLElement;
  if (taskCard) {
      // Optional: Rücksetzanimation oder Stiländerungen entfernen
      taskCard.classList.remove('dragging');
  }
}

  
    getUserColor(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.color : '#000000'; // Standardfarbe Schwarz
  }

  getUserInitials(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.initials : '';
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }
  

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

  getTasksByStatus(status: string): Task[] {
    return this.tasks
      .filter(task => task.status === status)
      .slice() // Erstellt eine Kopie des Arrays, um das Original nicht zu verändern
      .sort((a, b) => {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime(); // Sortiert aufsteigend nach Datum
      });
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

  openAddTaskModal() {
    this.showAddTaskModal = true;
  }
  
  closeAddTaskModal() {
    this.showAddTaskModal = false;
  }

   openEditTaskModal(task: Task) {
    console.log('Received task for editing:', task);
    if (task) {
      this.selectedTask = new Task(task);
      this.editTitle = this.selectedTask.title;
      this.editDescriptionText = this.selectedTask.description; // Das ist jetzt ein String
      this.editDueDate = this.selectedTask.dueDate ? new Date(this.selectedTask.dueDate) : null;
      this.editPriority = this.selectedTask.priority;
      this.showEditTaskModal = true;
    }
  }
  
  

  closeEditTaskModal() {
    this.showEditTaskModal = false;
    this.selectedTask = null;
  }

  openTaskDetail(task: Task) {
    // Erstelle eine Kopie der Task, um Änderungen nicht direkt zu speichern
    console.log('Received task for detail view:', task);
    this.selectedTask = new Task({
      ...task,
      subtasks: task.subtasks.map((subtask) => new Subtask(subtask))
    });
  }
  

  closeCardDetail() {
    this.selectedTask = null;
  }


  addSubtask() {
    if (this.newSubtaskTitle.trim() !== '' && this.selectedTask) {
      const newSubtask = new Subtask({ title: this.newSubtaskTitle.trim() });
      this.selectedTask.subtasks.push(newSubtask);
      this.newSubtaskTitle = '';
    }
  }

  deleteSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks.splice(index, 1);
    }
  }
  
  toggleSubtaskDone(subtaskIndex: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (this.selectedTask) {
      this.selectedTask.subtasks[subtaskIndex].done = isChecked;
  
      // Aktualisiere den Task in der tasks-Liste
      const taskIndex = this.tasks.findIndex((t) => t.id === this.selectedTask!.id);
      if (taskIndex > -1) {
        this.tasks[taskIndex].subtasks[subtaskIndex].done = isChecked;
        // Task in Firestore aktualisieren
        this.updateTaskSubtasks(this.tasks[taskIndex]);
      }
  
      // Aktualisiere die Anzeige der TaskCard
      this.updateTaskProgress(this.tasks[taskIndex]);
    }
  }
  



  async updateTaskSubtasks(task: Task) {
    if (task.id) {
      const taskDocRef = doc(this.firestore, 'tasks', task.id);
      const updatedSubtasks = task.subtasks.map(subtask => subtask.toJSON());
      await updateDoc(taskDocRef, { subtasks: updatedSubtasks });
    }
  }


  updateTaskProgress(task: Task) {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((subtask) => subtask.done).length;
    task.progress = (completedSubtasks / totalSubtasks) * 100;
  }

  getCompletedSubtaskCount(task: Task): number {
    return task.subtasks.filter(subtask => subtask.done).length;
  }


  getSubtaskCompletionPercentage(task: Task): number {
    if (task.subtasks.length === 0) {
      return 0;
    }
    const completedCount = task.subtasks.filter(subtask => subtask.done).length;
    return (completedCount / task.subtasks.length) * 100;
  }

  async updateTask() {
    if (this.selectedTask && this.selectedTask.id) {
      try {
        const taskDocRef = doc(this.firestore, 'tasks', this.selectedTask.id);
        await updateDoc(taskDocRef, this.selectedTask.toJSON());
        console.log('Task updated:', this.selectedTask);
        this.closeEditTaskModal();
        await this.loadTasksFromFirestore();
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  }
  
  editSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = true;
    }
  }

  saveEditSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = false;
    }
  }
  
  cancelEditSubtask(index: number) {
    if (this.selectedTask) {
      this.selectedTask.subtasks[index].editing = false;
    }
  }

  async deleteTask(taskId?: string) {
    if (!taskId) {
      console.error('Task ID is not defined');
      return;
    }
  
    // if (confirm('Are you sure you want to delete this task?')) {
      try {
        // Lösche das Dokument aus Firestore
        const taskDocRef = doc(this.firestore, 'tasks', taskId);
        await deleteDoc(taskDocRef);
  
        // Lösche die Aufgabe aus der lokalen Liste
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        console.log(`Task ${taskId} successfully deleted`);
  
        // Schließe die Detailansicht
        this.closeCardDetail();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    // }
  }
  
    // Methode zum Umschalten des Bearbeitungsmodus für ein bestimmtes Feld
    toggleEdit(field: string) {
      if (field === 'description') {
        this.editDescription = true;
        this.editDescriptionText = this.selectedTask?.description || '';
      }
      // Weitere Felder hinzufügen, wenn nötig
    }


    saveEdit(field: string) {
      if (field === 'description') {
        if (this.selectedTask) {
          this.selectedTask.description = this.editDescriptionText;
        }
        this.editDescription = false;
    
        // Speichere die Änderungen in Firestore
        if (this.selectedTask?.id) {
          this.updateTaskField(this.selectedTask.id, 'description', this.selectedTask.description);
        }
      }
      // Weitere Felder hinzufügen, wenn nötig
    }
    
    
  // Methode zum Abbrechen des Bearbeitungsmodus
cancelEdit(field: string) {
  if (field === 'description') {
    this.editDescription = false;
    // Du kannst optional die Änderungen zurücksetzen, wenn sie noch nicht gespeichert wurden
    if (this.selectedTask) {
      this.editDescriptionText = this.selectedTask.description;
    }
  }
  // Weitere Felder hinzufügen, wenn nötig
}

handlePrioKeydown(event: KeyboardEvent, priority: string) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    this.editPriority = priority;
  }
}


   // Update-Methode für Firestore
   async updateTaskField(taskId: string, field: string, value: any) {
    try {
      const taskDocRef = doc(this.firestore, 'tasks', taskId);
      await updateDoc(taskDocRef, {
        [field]: value
      });
      console.log(`${field} successfully updated`);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  }

  // saveTask() {
  //   if (this.selectedTask) {
  //     this.selectedTask.title = this.editTitle;
  //     this.selectedTask.description = this.editDescription;
  //     this.selectedTask.dueDate = this.editDueDate;
  //     this.selectedTask.priority = this.editPriority;
  
  //     this.updateTask();
  //   }
  //   this.closeEditTaskModal();
  // }

  saveTask() {
    if (this.selectedTask) {
      this.selectedTask.title = this.editTitle;
      this.selectedTask.description = this.editDescriptionText; // Verwende editDescriptionText anstelle von editDescription
  
      // Sicherstellen, dass `editDueDate` nicht `null` ist
      if (this.editDueDate) {
        this.selectedTask.dueDate = this.editDueDate;
      }
  
      this.selectedTask.priority = this.editPriority;
  
      this.updateTask(); // Task aktualisieren
    }
    this.closeEditTaskModal(); // Bearbeitungsmodal schließen
  }
  
  

  cancelEditCard() {
    this.closeEditTaskModal();
  }
}



