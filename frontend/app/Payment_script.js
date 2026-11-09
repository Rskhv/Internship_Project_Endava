const accountId =
    localStorage.getItem("account_id");

// Set only when arriving from the plan-selection flow; when opened from
// the profile menu's "Subscription" link, this is null and we fall back
// to the account's current plan instead.
let subscriptionId =
    sessionStorage.getItem("subscription_id");

const paymentUrl = subscriptionId
    ? `http://localhost:3000/api/subscriptions/${subscriptionId}`
    : `http://localhost:3000/payment/${accountId}`;

fetch(paymentUrl)
.then(res=>res.json())
.then(data=>{

    // If we fell back to the account's current plan, remember its
    // subscription_id so the payment submission below has one to send
    if(!subscriptionId){
        subscriptionId = data.subscription_id;
    }

    document.getElementById("planName").textContent =
        data.name;

    document.getElementById("planPrice").textContent =
        "₹"+data.price;

    document.getElementById("planResolution").textContent =
        data.resolution;

    document.getElementById("planScreens").textContent =
        data.max_screens;

});

document.getElementById("paymentForm")
.addEventListener("submit",e=>{

    e.preventDefault();

    const payment_method =
        document.getElementById("paymentMethod").value;

    fetch("http://localhost:3000/payment",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            account_id:accountId,

            subscription_id:subscriptionId,

            payment_method

        })

    })
    .then(res=>res.json())
    .then(data=>{

        if(data.success){

            window.location.href="Profiles.html";

        }

    });

});