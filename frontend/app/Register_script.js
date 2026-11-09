document.getElementById("registerForm").addEventListener("submit", async function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const subscription_id = sessionStorage.getItem("subscription_id");

    if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
    }

    try {

        // Get country from IP
        const locationResponse = await fetch("https://ipapi.co/json/");
        const location = await locationResponse.json();

        const response = await fetch("http://127.0.0.1:3000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                email,
                password,
                country: location.country_name,
                subscription_id
            })
        });

        const result = await response.json();

        showToast(result.message, response.ok ? "success" : "error");

        if (response.ok) {
            localStorage.setItem("account_id", result.account_id);
            window.location.href = "Payment.html";
        }

    } catch (err) {

        console.error(err);
        showToast("Registration failed.", "error");

    }

});


document.querySelectorAll(".togglePassword").forEach(button => {

    button.addEventListener("click", () => {

        const input = button.previousElementSibling;
        const icon = button.querySelector("img");

        if (input.type === "password") {
            input.type = "text";
            icon.src = "Web_Images/hide.png";
        } else {
            input.type = "password";
            icon.src = "Web_Images/show.png";
        }

    });

});
    
function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `show ${type}`;

    setTimeout(() => {
        toast.className = "";
    }, 3000);

}