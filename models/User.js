class User {

    constructor(name, gender, birth, country, email, password, photo, admin){
        this._id
        this._name = name;
        this._gender = gender
        this._birth = birth
        this._country = country
        this._email = email
        this._password = password
        this._photo = photo
        this._admin = admin
        this._register = new Date()
    }
    //os get são pra ter acesso sem o "_"
    get id(){
        return this._id
    }
    get register(){
        return Utils.dateFormat(this._register)
    }

    get name(){
        return this._name
    }
    get gender(){
        return this._gender
    }
    get birth(){
        return this._birth
    }
    get country(){
        return this._country
    }
    get email(){
        return this._email
    }
    get admin(){
        if(this._admin == true){
            return "Sim"}
        else{
            return "Não"
        }
        
    }
    loadFromJSON(json){

        for (let name in json){
            switch(name){
                case "_register":
                    this[name] = new Date(json[name])
                break
                default:
                    this[name] = json[name]
            }
            
        }
    }
    static getUsersStorage(){//statico não pode usar this dentro
        
        let users = []
        if (localStorage.getItem('users')){
            
            users = JSON.parse(localStorage.getItem('users'))
        }
        return users
    }
    getNewId(){
        let usersID = parseInt(localStorage.getItem("usersID"))
        if (!usersID>0) usersID = 0
        usersID++
        localStorage.setItem("usersID", usersID)
        return usersID
    }
    save(){

        let users = User.getUsersStorage()// pega todos os usuarios do LocalStorage(ou do banco de dados)

        if (this._id>0){// quando edita os dados entra aqui
            
            users.map(u=>{
                if(u._id == this.id){
                    Object.assign(u, this)
                }
                return u;    
            })
        }else{// se não tem id, entra aqui. quando salva dados novos

            this._id = this.getNewId()
            users.push(this)//adiciona mais 1 usuario, que é o novo cadastro
            
            
        }
        localStorage.setItem('users', JSON.stringify(users))
        
    }
    remove(){
        let users  = User.getUsersStorage()//transforma de string para array de objetos
        
        users.forEach((userData, index) => {
            if (this._id == userData._id){
                users.splice(index, 1)
            }
        });
        localStorage.setItem('users', JSON.stringify(users))
    }

}