
let editingExpenseId = 0;
const token = localStorage.getItem('token');
const expense = document.getElementById('expense');
const dynamicPage = document.getElementById('dynamic-pagination');
expense.addEventListener('submit', onSubmit);

function onSubmit(e){
    e.preventDefault();

    let expenseObj = {
        amount: document.getElementById('amount').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value
    }
    

    if(editingExpenseId === 0){
        axios.post('http://localhost:3000/home/expense', expenseObj, { headers: {'Authorization': token} })
        .then((response) => {
            addNewLineElement(response.data)
        }).catch((err) => {
            document.body.innerHTML+= '<h6> Submit failed try again</h6>'
            console.log(err);      
        }
        );
    } else {
        axios.post(`/home/edit-expense/${editingExpenseId}`,expenseObj, { headers: {'Authorization': token} })
        .then((response) => {
            window.location.reload()
            addNewLineElement(parRes);
        }).catch((err) => {
            document.body.innerHTML+= '<h6> Submit failed try again</h6>'
            console.log(err);      
        });
        editingExpenseId = 0;
    }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function enablePremium(){
    document.getElementById('premium').setAttribute('hidden','hidden');
    document.getElementById('leaderboard-btn').removeAttribute('hidden');
    document.getElementById('if-premium').innerHTML = '<a class="btn btn-dark px-3" role="button" disabled><i class="fab fa-github">Premium User</i></a>' + document.getElementById('if-premium').innerHTML;
}

let currentPage = 1;
let lastFEPage=1;
const perpage = localStorage.getItem('perpage') || 5;
if (document.readyState == "loading" ){
    const decodeToken = parseJwt(token);
    const isAdmin = decodeToken.isPremiumUser;
    if(isAdmin){enablePremium()}

    // axios.get('http://localhost:3000/home/show', { headers: {'Authorization': token} } )
    axios.get(`/home/show/${currentPage}`,{params: {perpage}, headers: {'Authorization': token} } )
        .then((result) => {
            result.data.data.forEach(element => {
                addNewLineElement(element);
            });
            showPagination(result.data.info);
            lastFEPage = result.data.info.lastPage;
        }).catch((err) => {
            console.log(err);
            document.body.innerHTML+= '<h6> Error: Failed to load data from server</h6>'
        }
    );
};

dynamicPage.addEventListener('submit',(e)=>{
    e.preventDefault();
    const perpage = document.getElementById('perpage').value;
    localStorage.setItem('perpage',perpage);
    window.location.reload();
});
function addNewLineElement(expenseDetails){
    const ul = document.getElementById('tracker');
    const li = document.createElement('li');
    li.innerHTML = `
                    <div class="card">
                    <table class="table">
                        <tbody>
                        <tr>
                            <th scope="row">Price</th>
                            <td>${expenseDetails.amount}</td>
                        </tr>
                        <tr>
                            <th scope="row">Product Name</th>
                            <td>${expenseDetails.category}</td>
                        </tr>
                        <tr>
                            <th scope="row">Category</th>
                            <td>${expenseDetails.description}</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>`
    const id=expenseDetails.id
    const delBtn = document.createElement('input');
    delBtn.className = 'form-control bg-danger'
    delBtn.id='delete';
    delBtn.type='button';
    delBtn.value='delete';
    delBtn.addEventListener('click', ()=> {
        if(confirm('Are you sure?')){
        axios.get(`http://localhost:3000/home/delete/${id}`, { headers: {'Authorization': token} })
        li.remove();
        }
    });
    delBtn.style.border = '2px solid red';
    delBtn.style.marginRight = '5px'
    li.appendChild(delBtn);
    
    const editBtn = document.createElement('input');
    editBtn.id='edit';
    editBtn.type='button';
    editBtn.value='Edit';
    editBtn.className = 'form-control bg-info'
    editBtn.addEventListener('click', ()=> {
        document.getElementById('amount').value = expenseDetails.amount;
        document.getElementById('description').value = expenseDetails.description;
        document.getElementById('category').value = expenseDetails.category;
        li.remove();
        editingExpenseId = expenseDetails.id;
    });
    editBtn.style.border = '2px solid green';
    li.appendChild(editBtn);
    ul.appendChild(li);
}

document.getElementById('premium').onclick = async function (e) {
    const response  = await axios.get('http://localhost:3000/purchase/premium-membership', { headers: {"Authorization" : token} });
    
    var options =
    {
     "key": response.data.key_id,
     "order_id": response.data.order.id,
     "handler": async function (response) {
        const result = await axios.post("http://localhost:3000/purchase/update-transaction-status", {
            order_id: options.order_id, payment_id: response.razorpay_payment_id
        }, { headers: { "authorization": token } });

        alert("You are now a premium user");
        localStorage.setItem('token',result.data.token);
        enablePremium();
        location.reload();
        }
    }

    const rzrp1 = new Razorpay(options);
    rzrp1.open();
    e.preventDefault();
    
    rzrp1.on("payment.failed", () => {
        axios.post("http://localhost:3000/purchase/update-transaction-status", { order_id: response.data.order.id }, { headers: { "authorization": token } })
        alert("something went wrong");
        rzrp1.close()
    })
}
    
let leaderboardDisplayed = false;
let leaderboardElements = [];
let leaderboardList = document.getElementById('leaderboard-list');
let leaderboardBtn = document.getElementById('leaderboard-btn');

axios.get("http://localhost:3000/premium/show-leaderboard", { headers: { "authorization": token } })
    .then(res => {
        for (let i = 0; i < res.data.length; i++) {
            const li = document.createElement("li");
            li.id = "leaderboard-li"
            li.appendChild(document.createTextNode(` Name : ${res.data[i].name} ,`));
            li.appendChild(document.createTextNode(`Total Expense : ₹${res.data[i].totalExpense || 0}`));
            leaderboardElements.push(li);
        }
    })
    .catch(err => {
        console.log(err)
    })

leaderboardBtn.onclick = (e) => {
    e.preventDefault();

    if (leaderboardDisplayed) {
        leaderboardBtn.innerHTML = 'Show Leaderboard';
        document.getElementById('leaderboard-tracker').setAttribute('hidden', 'hidden');
        leaderboardList.style.display = 'none';
        leaderboardDisplayed = false;
    } else {
        leaderboardBtn.innerHTML = 'Hide Leaderboard';
        document.getElementById('leaderboard-tracker').removeAttribute('hidden');
        leaderboardList.style.display = 'block';
        leaderboardElements.forEach(element => {
            leaderboardList.append(element)
        });
        leaderboardDisplayed = true;
    }
}

let reportBtn = document.getElementById('report-btn');
let reportList = document.getElementById('report-list');
let listno = 0;
let reportDisplayed = false;

    axios.get('http://localhost:3000/getAllUrl',{headers: {'Authorization' : token}})
    .then((res) => {
        if(res.status === 200){
            showUrls(res.data)
        }
    }).catch(err=> console.log(err));

    function showUrls(data){
        data.urls.forEach(url => {
            const li= document.createElement('a');
            li.id = 'report-list-li';
            li.href = `${url.fileURL}`;
            li.appendChild(document.createTextNode(`${listno + 1}. ${url.filename.split('Expense')[1]}`));
            reportList.append(li);
            const lineBreak = document.createElement('br');
            reportList.appendChild(lineBreak);
            listno++
        })
    }
    

reportBtn.onclick = async (e) => {
    e.preventDefault();
    const decodeToken = parseJwt(token);
    const isAdmin = decodeToken.isPremiumUser;

    if(reportDisplayed){
        reportDisplayed = false;
        document.getElementById('initial-tracker').removeAttribute('hidden');
        reportBtn.innerHTML = ' Expenses Report ';
        document.getElementById('report-dwn-btn').setAttribute('hidden','hidden');
        document.getElementById('report-tracker').setAttribute('hidden','hidden');

    } else {
        reportDisplayed = true;
        document.getElementById('initial-tracker').setAttribute('hidden','hidden');
        reportBtn.innerHTML = 'Hide Expenses Report';
        if(isAdmin){
        document.getElementById('report-dwn-btn').removeAttribute('hidden');
        }
        document.getElementById('report-tracker').removeAttribute('hidden');
    }

}

const reportDwnBtn = document.getElementById('report-dwn-btn');
reportDwnBtn.addEventListener('click', (e)=> {
    e.preventDefault();
    axios.get('download', { headers: { "authorization": token } }).then((response) => {
            showUrlOnScreen(response.data.downloadUrlData);
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'Expense.txt';
            a.click();
        })
    .catch((err) => {
        console.log(err);
    });
});

function showUrlOnScreen(data){
    const li= document.createElement('a');
    li.id = 'report-list-li';
    li.href = `${data.fileURL}`;
    li.appendChild(document.createTextNode(`${listno + 1}. ${data.filename.split('Expense')[1]}`));
    reportList.append(li);
    const lineBreak = document.createElement('br');
    reportList.appendChild(lineBreak);
    listno++;
}

function showPagination({currentPage,hasNextPage,hasPreviousPage,nextPage,previousPage,lastPage}){
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    if(hasPreviousPage){
        const btn2 = document.createElement('button');
        btn2.className = "pagination"
        btn2.innerHTML = previousPage ;
        btn2.addEventListener('click' , ()=>getPageExpenses(previousPage));
        pagination.appendChild(btn2);
    }

    const btn1 = document.createElement('button');
    btn1.innerHTML = currentPage ;
    btn1.addEventListener('click' , ()=>getPageExpenses(currentPage));
    pagination.appendChild(btn1);

    if(hasNextPage){
        const button3 = document.createElement('button');
        button3.innerHTML = nextPage ;
        button3.addEventListener('click' , ()=>getPageExpenses(nextPage));
        pagination.appendChild(button3);
    }

    if( currentPage!=lastPage && nextPage!=lastPage && lastPage != 0){
        const button3 = document.createElement('button');
        button3.innerHTML = lastPage ;
        button3.addEventListener('click' , ()=>getPageExpenses(page));
        pagination.appendChild(button3);
    }
}

async function getPageExpenses(page){
    currentPage = page;
    const tracker = document.getElementById('tracker');

    const token = localStorage.getItem('token');

    let response = await axios.get(`http://localhost:3000/home/show/${page}`,{params:{perpage},headers: { "Authorization": token}} );
    if(response.status === 200){
        tracker.innerHTML = ''
        for(let i=0;i<response.data.data.length;i++){
            addNewLineElement(response.data.data[i]);
        }
    }

    showPagination(response.data.info)
}