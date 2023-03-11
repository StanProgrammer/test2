const myForm=document.getElementById('myform')
const name=document.getElementById('name')
const email=document.getElementById('email')
const phone=document.getElementById('phone')
const password=document.getElementById('password')
const loginbtn=document.getElementById('loginbtn')

myForm.addEventListener('submit',async (e)=>{
    e.preventDefault()
    const name=document.getElementById('name')
    const email=document.getElementById('email')
    const phone=document.getElementById('phone')
    const password=document.getElementById('password')
    e.preventDefault()
    try{
        const user1=await axios.post('http://localhost:3000/login',{
            name:name.value,
            email:email.value,
            phone:phone.value,
            password:password.value
        })
        
        alert(user1.data.message)
        window.location.href = "http://localhost:3000/loginPage";
    }catch(error){

          if(confirm('User already exists')){
            window.location.reload()
          }
          
    } 

})
loginbtn.addEventListener('click',async()=>{
  try{
    window.location.href = "http://localhost:3000/loginPage";
  }
  catch(err){
    console.log(err);
  }
})

