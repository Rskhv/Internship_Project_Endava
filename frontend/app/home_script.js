const profileId = localStorage.getItem("profile_id");
const accountId = localStorage.getItem("account_id");
let currentProfile = profileId;

function renderRow(data, rowId){

    const row = document.getElementById(rowId);

    if(!row) return;

    let html = "";

    data.forEach(item=>{

        html += `
        <div class="card" data-id="${item.content_id}">

            <img loading="lazy" src=
            "https://picsum.photos/300/170?${item.content_id}">

            <div class="card-title">
                ${item.title}
            </div>

            <div class="card-overlay">
                <button class="card-play-btn" onclick="playContent(${item.content_id})">▶</button>
                <button class="card-info-btn" onclick="openInfoModal(${item.content_id})">ⓘ</button>
            </div>

        </div>
        `;

    });

    row.innerHTML = html;

}

// Loads the small "Movies" / "TV Shows" preview rows on the home page
function loadMoviesRow(){

    fetch("http://localhost:3000/movies")
    .then(res=>res.json())
    .then(data=>{

        renderRow(data,"moviesRow");

    });

}

function loadTVRow(){

    fetch("http://localhost:3000/tvshows")
    .then(res=>res.json())
    .then(data=>{

        renderRow(data,"tvRow");

    });

}

// Hides every top-level section so each "page" (home, search, browse)
// can show only what belongs to it
function hideAllSections(){

    document.getElementById("heroSection").style.display = "none";
    document.getElementById("defaultContent").style.display = "none";

    document.getElementById("searchHeading").style.display = "none";
    document.getElementById("searchRow").style.display = "none";

    document.getElementById("moviesPage").style.display = "none";
    document.getElementById("tvPage").style.display = "none";

    document.getElementById("playerPage").style.display = "none";

}

function showHome(){

    hideAllSections();

    document.getElementById("heroSection").style.display = "flex";
    document.getElementById("defaultContent").style.display = "block";

}

// Genre dropdowns are populated once from the DB and cached
let cachedGenres = null;

function loadGenres(){

    if(cachedGenres){
        return Promise.resolve(cachedGenres);
    }

    return fetch("http://localhost:3000/genres")
    .then(res=>res.json())
    .then(genres=>{

        cachedGenres = genres;
        return genres;

    });

}

function populateGenreSelect(selectId, genres){

    const select = document.getElementById(selectId);

    let html = `<option value="">All Genres</option>`;

    genres.forEach(g=>{
        html += `<option value="${g.name}">${g.name}</option>`;
    });

    select.innerHTML = html;

}

function fetchMovies(genre = ""){

    const url = genre
        ? `http://localhost:3000/browse?type=${encodeURIComponent("Movie")}&genre=${encodeURIComponent(genre)}`
        : `http://localhost:3000/browse?type=${encodeURIComponent("Movie")}`;

    fetch(url)
    .then(res=>res.json())
    .then(data=>{

        renderRow(data,"moviesGrid");

    });

}

function fetchTVShows(genre = ""){

    const url = genre
        ? `http://localhost:3000/browse?type=${encodeURIComponent("TV Show")}&genre=${encodeURIComponent(genre)}`
        : `http://localhost:3000/browse?type=${encodeURIComponent("TV Show")}`;

    fetch(url)
    .then(res=>res.json())
    .then(data=>{

        renderRow(data,"tvGrid");

    });

}

function showMoviesPage(){

    hideAllSections();

    document.getElementById("moviesPage").style.display = "block";
    document.getElementById("movieGenreSelect").value = "";

    loadGenres().then(genres=>{
        populateGenreSelect("movieGenreSelect", genres);
    });

    fetchMovies();

}

function showTVPage(){

    hideAllSections();

    document.getElementById("tvPage").style.display = "block";
    document.getElementById("tvGenreSelect").value = "";

    loadGenres().then(genres=>{
        populateGenreSelect("tvGenreSelect", genres);
    });

    fetchTVShows();

}

// ===== More Info modal =====

function openInfoModal(contentId){

    fetch(`http://localhost:3000/content/${contentId}`)
    .then(res=>res.json())
    .then(details=>{

        document.getElementById("modalImage").src =
            `https://picsum.photos/500/280?${details.content_id}`;

        document.getElementById("modalTitle").textContent = details.title;

        document.getElementById("modalMeta").textContent =
            `${details.release_year} • ${details.type}`;

        document.getElementById("modalDescription").textContent =
            details.description;

        document.getElementById("modalGenres").textContent =
            details.genres || "N/A";

        document.getElementById("modalDirectors").textContent =
            details.directors || "N/A";

        document.getElementById("modalCast").textContent =
            details.cast || "N/A";

        document.getElementById("modalPlayBtn").onclick = function(){
            playContent(details.content_id);
        };

        document.getElementById("infoModal").style.display = "flex";

    });

}

function closeInfoModal(){

    document.getElementById("infoModal").style.display = "none";

}

// Close the modal when clicking the dark backdrop (outside the card)
document.getElementById("infoModal").addEventListener("click", function(e){

    if(e.target.id === "infoModal"){
        closeInfoModal();
    }

});

// Hero section Play / More Info buttons act on whatever show is featured
let currentFeaturedId = null;

function heroPlay(){

    if(currentFeaturedId){
        playContent(currentFeaturedId);
    }

}

function heroInfo(){

    if(currentFeaturedId){
        openInfoModal(currentFeaturedId);
    }

}

// ===== Simulated playback with a progress bar driven by watch history =====

let playbackInterval = null;
let playbackContentId = null;
let playbackProgress = 0;
let isPlaying = true;

function playContent(contentId){

    closeInfoModal();

    playbackContentId = contentId;
    playbackProgress = 0;
    isPlaying = true;

    document.getElementById("playerPauseBtn").textContent = "⏸ Pause";

    // Pull the title, and resume from whatever progress already exists
    // in tbl_watch_history for this profile + content
    Promise.all([
        fetch(`http://localhost:3000/content/${contentId}`).then(res=>res.json()),
        fetch(`http://localhost:3000/watchprogress/${profileId}/${contentId}`).then(res=>res.json())
    ])
    .then(([details, progressData])=>{

        playbackProgress = progressData && progressData.progress
            ? Number(progressData.progress)
            : 0;

        document.getElementById("playerTitle").textContent = details.title;

        hideAllSections();
        document.getElementById("playerPage").style.display = "flex";

        updatePlayerUI();
        startPlaybackSimulation();

    });

}

function updatePlayerUI(){

    document.getElementById("playerProgressFill").style.width =
        `${playbackProgress}%`;

    document.getElementById("playerPercent").textContent =
        `${Math.round(playbackProgress)}%`;

}

function startPlaybackSimulation(){

    clearInterval(playbackInterval);

    // Simulates the video advancing; ticks the progress bar forward and
    // periodically persists it to tbl_watch_history
    playbackInterval = setInterval(()=>{

        if(!isPlaying) return;

        playbackProgress = Math.min(100, playbackProgress + 1);
        updatePlayerUI();

        if(playbackProgress % 5 === 0 || playbackProgress >= 100){
            saveWatchProgress();
        }

        if(playbackProgress >= 100){
            clearInterval(playbackInterval);
        }

    }, 300);

}

function saveWatchProgress(){

    if(!playbackContentId) return;

    fetch("http://localhost:3000/watchprogress", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
            profile_id: profileId,
            content_id: playbackContentId,
            progress: playbackProgress
        })
    });

}

function togglePlayback(){

    isPlaying = !isPlaying;

    document.getElementById("playerPauseBtn").textContent =
        isPlaying ? "⏸ Pause" : "▶ Resume";

    if(!isPlaying){
        saveWatchProgress();
    }

}

function closePlayer(){

    clearInterval(playbackInterval);
    saveWatchProgress();

    document.getElementById("playerPage").style.display = "none";

    // Refresh Continue Watching so the new progress shows up immediately
    fetch(`http://localhost:3000/continue/${profileId}`)
    .then(res=>res.json())
    .then(data=>{
        renderRow(data, "continueRow");
    });

    showHome();

}

fetch(`http://localhost:3000/continue/${profileId}`)
.then(res=>res.json())
.then(data=>{

    renderRow(data, "continueRow");

});

fetch("http://localhost:3000/trending")
.then(res=>res.json())
.then(data=>{

    renderRow(data, "trendingRow");

});

loadMoviesRow();
loadTVRow();

// Genre filter listeners for the browse pages
document.getElementById("movieGenreSelect").addEventListener("change", function(){
    fetchMovies(this.value);
});

document.getElementById("tvGenreSelect").addEventListener("change", function(){
    fetchTVShows(this.value);
});

// Profile icon initial
fetch(`http://localhost:3000/profile/${profileId}`)
.then(res=>res.json())
.then(profile=>{

    if(profile && profile.name){

        document.getElementById("profileIcon").textContent =
            profile.name.charAt(0).toUpperCase();

    }

});

// Profile dropdown list
function renderProfiles(profiles){

    const dropdown = document.getElementById("profileDropdown");

    let html = "";

    profiles.forEach(profile=>{

        html += `
        <div class="profile-option"
             onclick="switchProfile(${profile.profile_id})">

            <div class="avatar">
                ${profile.name.charAt(0)}
            </div>

            <span>
                ${profile.name}
            </span>

            ${
                profile.profile_id == currentProfile
                ? "✓"
                : ""
            }

        </div>
        `;

    });

    html += `

    <hr>

    <a href="Profiles.html">Manage Profiles</a>
    <a href="Payment.html">Subscription</a>
    <a href="#" id="logoutBtn">Logout</a>

    `;

    dropdown.innerHTML = html;

}

if(accountId){

    fetch(`http://localhost:3000/profiles/${accountId}`)
    .then(res=>res.json())
    .then(profiles=>{

        renderProfiles(profiles);

    });

}

function switchProfile(newProfileId){

    localStorage.setItem("profile_id", newProfileId);
    location.reload();

}

// Logout: use event delegation since #logoutBtn is added to the DOM later
document.addEventListener("click", function(e){

    if(e.target && e.target.id === "logoutBtn"){

        e.preventDefault();
        localStorage.clear();
        window.location.href = "Login.html";

    }

});

// Search
const searchBox = document.getElementById("searchBox");
let searchTimeout;

searchBox.addEventListener("input", function(){

    clearTimeout(searchTimeout);

    const query = searchBox.value.trim();

    if(query === ""){
        showHome();
        return;
    }

    searchTimeout = setTimeout(()=>{

        fetch(`http://localhost:3000/search/${encodeURIComponent(query)}`)
        .then(res=>res.json())
        .then(data=>{

            hideAllSections();

            document.getElementById("searchHeading").style.display = "block";
            document.getElementById("searchRow").style.display = "grid";

            renderRow(data,"searchRow");

        });

    }, 300);

});

fetch("http://localhost:3000/featured")
.then(res => res.json())
.then(show => {

    currentFeaturedId = show.content_id;

    document.getElementById("heroTitle").textContent =
        show.title;

    document.getElementById("heroDescription").textContent =
        show.description;

});