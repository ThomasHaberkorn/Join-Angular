export class User {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    initials: string;
    phone: string;
    password: string;
    passwordConfirm: string;
    color: string;
  
    constructor(obj?: any) {
        this.id = this.getID();
        this.firstName = obj ? obj.firstName : '';
        this.lastName = obj ? obj.lastName : '';
        this.email = obj ? obj.eMail : '';
        this.phone = obj ? obj.phone : '';
        this.password = obj ? obj.password : '';
        this.passwordConfirm = obj ? obj.passwordConfirm : '';
        this.color = this.getColor();
        this.initials =  obj ? obj.initials : '';
    }

    getID(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 5; i++) {
          id += characters[Math.floor(Math.random() * characters.length)];
        }
        return id;
    }

    getInitials(): string {
        if (this.firstName && this.lastName) {
          return this.firstName.charAt(0).toUpperCase() + this.lastName.charAt(0).toUpperCase();
        }
        return ''; 
    }

    getColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    
      
  
    public toJSON() {
      const data: any = {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        eMail: this.email,
        
        phone: this.phone,
        password: this.password,
        passwordConfirm: this.passwordConfirm,
        color: this.color,
        initials: this.initials ,
      };
  
      // Konvertieren Sie `undefined` oder `null` in leere Strings
      Object.keys(data).forEach(key => {
        if (data[key] === undefined || data[key] === null) {
          data[key] = "";
        }
      });
  
      return data;
    }
  }
  
 