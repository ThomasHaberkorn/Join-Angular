


export class Task {
    id?: string;
    title: string;
    description: string;
    assignedTo: string[];
    dueDate: Date;
    priority: string;
    category: string;
    subtasks: Subtask[];
    status: string;
    progress: number;
  
    constructor(obj?: any) {
        // this.id = this.getID();
        this.id = obj ? obj.id : '';
        this.title = obj ? obj.title : '';
        this.description = obj ? obj.description : '';
        this.assignedTo = obj ? obj.assignedTo : [];
        this.dueDate = obj ? obj.dueDate : '';
        this.priority = obj ? obj.priority : '';
        this.category = obj ? obj.category : '';
        this.subtasks = obj?.subtasks?.map((st: any) => new Subtask(st)) || [];
        this.status = obj ? obj.status : '';
        this.progress = obj && obj.progress !== undefined ? obj.progress : 0;
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
        subtasks: this.subtasks.map(subtask => subtask.toJSON()),
        status: this.status,
        progress: this.progress,
      };
      return data;
    }

}

export class Subtask {
  title: string;
  done: boolean;
  editing: boolean;  
  
  constructor(obj?: any) {
    this.title = obj?.title || '';
    this.done = obj?.done ?? false;
    this.editing = false;
  }

  public toJSON() {
    return {
      title: this.title,
      done: this.done
    };
  }
}



