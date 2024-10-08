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
      this.id = obj ? obj.id : '';
      this.firstName = obj ? obj.firstName : '';
      this.lastName = obj ? obj.lastName : '';
      this.email = obj ? obj.eMail : '';
      this.phone = obj ? obj.phone : '';
      this.password = obj ? obj.password : '';
      this.passwordConfirm = obj ? obj.passwordConfirm : '';
      // this.color = this.getColor();
      this.color = obj && obj.color ? obj.color : this.getColor();
      this.initials = this.getInitials();
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
  
      Object.keys(data).forEach(key => {
        if (data[key] === undefined || data[key] === null) {
          data[key] = "";
        }
      });
  
      return data;
    }
  }
  
 