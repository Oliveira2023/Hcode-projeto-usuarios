class UserController{

    constructor(formId, formIdUpdate, tableId){
       
        this.formEl = document.getElementById(formId)

        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)

        this.onSubmit()
        this.onEdit()
        this.elements = [...this.formEl.elements]
        this.updateElements = [...this.formUpdateEl.elements]
        this.selectAll()
        
    }
    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate()
            
        })
        this.formUpdateEl.addEventListener('submit', event=>{
            
            event.preventDefault()
            let btn = this.formUpdateEl.querySelector("[type=submit]")
            // define o botão para disabilitar
            btn.Disabled = true
            //desabilita o botão
            let values = this.getValues(this.updateElements)
            //nesse momento se não atualizou a foto values nao tem foto
            //pega os valores dos campos do formulario de edição
            let index = this.formUpdateEl.dataset.trIndex
            //pega o indice de qual tr estamos editando pra sobreescrever na tr correta
            let tr = this.tableEl.rows[index]
            //linha que estamos editando através do indice anterior
            let userOld = JSON.parse(tr.dataset.user)
            //pega os dados antigos da linha
            let result = Object.assign({}, userOld, values)
            //result neste momento não tem foto
            //console.log("Result",result)
            //tr.dataset.user = JSON.stringify(values)
            this.getPhoto(this.updateElements).then((content)=>{
                if (!values._photo){
                    
                    result._photo = userOld._photo
                }else{
                    
                    result._photo = content
                }
                let user = new User()
                user.loadFromJSON(result)
                user.save()
                this.getTr(user, tr)

                this.addEventsTR(tr)

                this.updateCount()

                this.formUpdateEl.reset()

                btn.Disabled = false

                this.showPanelCreate()

            }, (e)=>{
                console.error(e)
                })
        })
    }
    onSubmit(){
        
        this.formEl.addEventListener("submit", event=>{
            
            event.preventDefault()

            let btn = this.formEl.querySelector("[type=submit]")
            btn.Disabled = true
            let values = this.getValues(this.elements)
            if (!values) return false
            this.getPhoto(this.elements).then((content)=>{
                
                values._photo = content 
                values.save()
                this.addLine(values)
                this.formEl.reset()
                btn.Disabled = false
            }, (e)=>{
                console.error(e)
                })
            
        })
    }
    getPhoto(formEl){
        
        return new Promise((resolve, reject)=>{
            let fileReader = new FileReader()

            let elemento = formEl.filter(item=>{
                if (item.name === 'photo'){
                    return item
                }
            })
            let file = elemento[0].files[0]
    
            fileReader.onload = ()=>{
            
                resolve(fileReader.result)
            }
            fileReader.onerror = (e)=>{
                reject(e)
            }
            if(file){
                fileReader.readAsDataURL(file)
            }else{
                let values = this.getValues(formEl)

                if (values.gender == "M"){
                    resolve("dist/img/avatar5.png")
                }else if (values.gender == "F"){
                    resolve("dist/img/avatar2.png")
                }else {
                    console.log('Gender defined not find')
                }
            
            }
        })
        
    }

    getValues(elements){

        let user = {}
        let isValid = true
        
        elements.forEach(function(field){
            if (["name"].indexOf(field.name)> -1 && !field.value){
                field.parentElement.classList.add('has-error')
                isValid =  false
            }
            if(field.name == 'gender'){
                if (field.checked) {
                    user[field.name] = field.value
                }
        
            }else if(field.name == "admin"){
                user[field.name] = field.checked
                
            }else {
                user[field.name] = field.value
            }
            
        })
        if(!isValid) return false
        return new User(
            user.name, 
            user.gender, 
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        )
     }

    selectAll(){
        
        let users = User.getUsersStorage()
        //console.log(users)
        users.forEach(dataUser=>{
            let user = new User()
            user.loadFromJSON(dataUser)
            this.addLine(user)
        })
    }
     insert(data){
        let users = this.getUsersStorage()
        users.push(data)
        //sessionStorage.setItem('users', JSON.stringify(users))
        localStorage.setItem('users', JSON.stringify(users))
    }

    addLine(dataUser){
        let tr = this.getTr(dataUser)
  
        this.tableEl.appendChild(tr)//nativo do js
        //vai adicionar uma linha abaixo com os dados 
        this.updateCount()
    }
    getTr(dataUser, tr = null ){
        if (tr===null) tr = document.createElement("tr")
        tr.dataset.user = JSON.stringify(dataUser)
        tr.innerHTML = `
            <td><img src="${dataUser._photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${dataUser.name}</td>
                    <td>${dataUser.email}</td>
                    <td>${dataUser.admin}</td>
                    <td>${dataUser.gender}</td>
                    <td>${dataUser.register}</td>
                    <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-delete btn-danger btn-xs btn-flat">Excluir</button>
                    </td>
        `
        this.addEventsTR(tr)
        
        return tr
    }
    addEventsTR(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e=>{
            if (confirm("Deseja realmente excluir")){
                let user = new User()
                user.loadFromJSON(JSON.parse(tr.dataset.user))
                user.remove()
                tr.remove()
                this.updateCount()
            }
        })
        tr.querySelector(".btn-edit").addEventListener("click", e=>{
            
            let json = JSON.parse(tr.dataset.user)

            
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex
  
            for (let name in json){
                let field =  this.formUpdateEl.querySelector('[name=' + name.replace('_', '') + "]")
                
                if(field){
                    
                    switch (field.type){
                        case "file":
                            continue
                        
                        case "radio":
                            field = this.formUpdateEl.querySelector('[name=' + name.replace('_', '') + "][value=" + json[name] + ']')
                            field.checked = true
                            break

                        case 'checkbox':
                            //field.checked ? field.value = "Sim" : field.value ="Não"
                            field.checked = json[name]
                            
                            break

                        default:
                            field.value = json[name]
                    }
                }
            }
            this.formUpdateEl.querySelector('.photo').src =json._photo
            // aqui foi só pra aparecer a foto anterior no formulario de edição, não no insert mas na div.
            this.showPanelUpdate()
        })
    }
    showPanelCreate(){
        document.querySelector('#box-user-create').style.display = 'block'
        document.querySelector('#box-user-update').style.display = 'none'
    }
    showPanelUpdate(){
        document.querySelector('#box-user-create').style.display = 'none'
        document.querySelector('#box-user-update').style.display = 'block'
    }

    updateCount(){
        
        let numberUsers = 0
        let numberAdmin = 0

        let tableCount = [...this.tableEl.children]
        tableCount.forEach(tr=>{

            numberUsers++
            let user = JSON.parse(tr.dataset.user)
            if (user._admin){
                numberAdmin ++
            }
        })
        document.getElementById("number-users").innerHTML = numberUsers
        document.getElementById("number-users-admin").innerHTML = numberAdmin
    }
}