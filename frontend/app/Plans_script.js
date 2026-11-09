fetch("http://127.0.0.1:3000/api/subscriptions")
.then(response => response.json())


.then(plans=>{

    const container=document.getElementById("plans");

    plans.forEach(plan=>{

        container.innerHTML+=`

        <div class="plan-card"
             data-id="${plan.subscription_id}">

            <h3>${plan.name}</h3>

            <div class="price">
                ₹${plan.price}
            </div>

            <p>
                Resolution :
                ${plan.resolution}
            </p>

            <p>
                Screens :
                ${plan.max_screens}
            </p>

        </div>

        `;

    });

});

document.addEventListener("click",function(e){

    const card=e.target.closest(".plan-card");

    if(!card) return;

    sessionStorage.setItem(
        "subscription_id",
        card.dataset.id
    );

    window.location.href="Register.html";

});