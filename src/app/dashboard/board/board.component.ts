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

  
  async loadUsersFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'users'));
      this.users = querySnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error loading users:', error);
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
  

  addTask() {
    console.log('add task');
  }
}
