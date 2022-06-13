let editbutton = document.getElementById('editbutton');
let savebutton = document.getElementById('savebutton');
let email = document.getElementById('email');
let phone = document.getElementById('phone');
let password = document.getElementById('password');
let fname = document.getElementById('name');
let username = document.getElementById('username');
let college = document.getElementById('college');

editbutton.addEventListener('click', () =>{
    email.disabled = false;
    phone.disabled = false;
    password.disabled = false;
    fname.disabled = false;
    username.disabled = false;
    college.disabled = false;
    savebutton.style.display = 'block';
    editbutton.style.display = 'none';
});

// savebutton.addEventListener('click', () =>{
//     email.disabled = true;
//     phone.disabled = true;
//     password.disabled = true;
//     fname.disabled = true;
//     username.disabled = true;
//     college.disabled = true;
//     savebutton.style.display = 'none';
//     editbutton.style.display = 'block';
// });

document.getElementById("uploadBtn").onchange = function () {
    document.getElementById("uploadFile").value = this.value;
};