document.getElementById("loginForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        "http://localhost:3000/login",
        {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );

    const data = await response.json();

    if(data.success){

        showToast("Login Successful", "success");

        localStorage.setItem(
            "account_id",
            data.account_id
        );

        window.location.href =
            "Profiles.html";

    } else {

        showToast("Invalid Login", "error");

    }

});

const passwordInput = document.getElementById("password");
const button = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

button.addEventListener("click", () => {

    if(passwordInput.type === "password"){
        passwordInput.type = "text";
        eyeIcon.src = "Web_Images/hide.png";
    }else{
        passwordInput.type = "password";
        eyeIcon.src = "Web_Images/show.png";
    }

});

function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `show ${type}`;

    setTimeout(() => {
        toast.className = "";
    }, 3000);

}


