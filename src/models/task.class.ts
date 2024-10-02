export class Task {
    id?: string;
    title: string;
    description: string;
    assignedTo: string[];
    dueDate: Date;
    priority: string;
    category: string;
    subtasks: string[];
    userId: string;
  
    constructor(obj?: any) {
        this.id = this.getID();
        this.title = obj ? obj.title : '';
        this.description = obj ? obj.description : '';
        this.assignedTo = obj ? obj.assignedTo : '';
        this.dueDate = obj ? obj.dueDate : '';
        this.priority = obj ? obj.priority : '';
        this.category = obj ? obj.category : '';
        this.subtasks = obj && obj.subtasks ? obj.subtasks : [];
        this.userId = obj ? obj.userId : '';
    }

    getID(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 5; i++) {
          id += characters[Math.floor(Math.random() * characters.length)];
        }
        return id;
    }

 
    public toJSON() {
      const data: any = {
        id: this.id,
        title: this.title,
        description: this.description,
        assignedTo: this.assignedTo,
        dueDate: this.dueDate,
        priority: this.priority,
        category: this.category,
        subtasks: this.subtasks,
        userId: this.userId
      };
      return data;
    }

}