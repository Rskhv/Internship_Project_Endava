const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

function applyTheme(theme){

    if(theme==="light"){

        document.body.classList.add("light-mode");
        if(themeIcon) themeIcon.src="Web_Images/night-mode.png";

    }else{

        document.body.classList.remove("light-mode");
        if(themeIcon) themeIcon.src="Web_Images/day-mode.png";

    }

}

const savedTheme=localStorage.getItem("theme") || "dark";

applyTheme(savedTheme);

if(themeToggle){

    themeToggle.addEventListener("click",()=>{

        let newTheme;

        if(document.body.classList.contains("light-mode")){

            newTheme="dark";

        }else{

            newTheme="light";

        }

        localStorage.setItem("theme",newTheme);

        applyTheme(newTheme);

    });

}