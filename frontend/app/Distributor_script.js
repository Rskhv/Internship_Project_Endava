
function parseNameList(rawValue){

    return rawValue
        .split(",")
        .map(name => name.trim())
        .filter(name => name.length > 0);

}

document.getElementById("distributorForm")
.addEventListener("submit", async function(e){

    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const type = document.getElementById("type").value;
    const release_year = document.getElementById("release_year").value;
    const description = document.getElementById("description").value.trim();

    const actors = parseNameList(document.getElementById("actors").value);
    const directors = parseNameList(document.getElementById("directors").value);
    const genres = parseNameList(document.getElementById("genres").value);

    if(!title || !type || !release_year || !description){
        showToast("Please fill in all required fields", "error");
        return;
    }

    try{

        const response = await fetch("http://localhost:3000/api/distribute", {

            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                type,
                release_year,
                description,
                actors,
                directors,
                genres
            })

        });

        const data = await response.json();

        if(data.success){

            showToast("Content added to catalog", "success");
            showPreview(data.content_id, title, type, release_year);
            document.getElementById("distributorForm").reset();

        } else {

            showToast("Could not add content", "error");

        }

    } catch(err){

        console.error(err);
        showToast("Something went wrong", "error");

    }

});

function showPreview(contentId, title, type, releaseYear){

    document.getElementById("previewPoster").src =
        `https://picsum.photos/450/200?${contentId}`;

    document.getElementById("previewTitle").textContent = title;

    document.getElementById("previewMeta").textContent =
        `${type} • ${releaseYear}`;

    document.getElementById("previewCard").style.display = "block";

}

function showToast(message, type){

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `show ${type}`;

    setTimeout(() => {
        toast.className = "";
    }, 3000);

}
