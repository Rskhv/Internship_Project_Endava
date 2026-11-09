
const accountId =
    localStorage.getItem("account_id");

fetch(`http://localhost:3000/profiles/${accountId}`)
.then(response => response.json())
.then(data => {

    const grid = document.getElementById("profileGrid");

    data.forEach(profile => {

        const firstLetter = profile.name.charAt(0);

        grid.innerHTML += `
            <div class="profile-card"
                 onclick="selectProfile(${profile.profile_id})">

                <div class="profile-avatar">
                    ${firstLetter}
                </div>

                <div class="profile-name">
                    ${profile.name}
                </div>

            </div>
        `;
    });

    // Add Profile Card
    grid.innerHTML += `
        <div class="profile-card"
             onclick="openModal()">

            <div class="profile-avatar add-profile">
                +
            </div>

            <div class="profile-name">
                Add Profile
            </div>

        </div>
    `;
});

function openModal(){
    document.getElementById("addProfileModal").style.display = "flex";
}

function closeModal(){
    document.getElementById("addProfileModal").style.display = "none";
}

function selectProfile(profileId){

    localStorage.setItem("profile_id", profileId);

    window.location.href = "home.html";

}

function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `show ${type}`;

    setTimeout(() => {
        toast.className = "";
    }, 3000);

}

function addProfile(){
    const name = document.getElementById("profileName").value.trim();
    const language = document.getElementById("profileLanguage").value;
    const age_category = document.getElementById("profileAge").value;
    const account_id = localStorage.getItem("account_id");
    
    if(name === ""){
        showToast("Enter a profile name","error");
        return;
    }

    fetch("http://localhost:3000/addProfile",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            name,
            language,
            age_category,
            account_id

        })

    })
    .then(res => res.json())
    .then(data => {

        if(data.success){

            closeModal();

            location.reload();

        }else{

            showToast("Could not create profile","error");

        }

    });

}