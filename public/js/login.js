 const myform = document.getElementById('myform')
    const password = document.getElementById('password')
    const email = document.getElementById('email')

	myform.addEventListener('submit',async (e)=>{
		e.preventDefault()
		try{
		const user1=await axios.post('http://18.118.166.28:3000/check',{
                email:email.value,
                password:password.value
        })
		alert(user1.data.message)
		const token = user1.data.token
		localStorage.setItem('token',token);
		if(user1.status===200){
			window.location.href = "http://18.118.166.28:3000/home"
		}
	}
	
	catch(error){
		console.log(error);
		
	}
	})
	
