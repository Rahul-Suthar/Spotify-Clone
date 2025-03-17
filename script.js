let currentSong = new Audio();
let songs;
let currFolder;

function formateSong(e) {
  return e.split(`/${currFolder.split("/")[1]}/`)[1].replaceAll("%20", " ");
}

// to retrieve songs from songs folder
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");

  songs = [];

  for (let idx = 0; idx < as.length; idx++) {
    let a = as[idx];
    if (a.href.endsWith(".mp3")) {
      songs.push(formateSong(a.href));
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML += `<li> <div class="song">
                <img class="m-icon" src="img/music.svg" alt="" />
                <div class="info">
                  <p>${song.split(".")[0]}</p>
                  <p>Georg</p>
                </div>
              </div>
              <div class="playnow">
                <img class="play-icon" src="img/play.svg" alt="icon" />
              </div> </li>`;
  }

  // attach event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.querySelector(".playnow").addEventListener("click", () => {
      let song = e.querySelector(".info").firstElementChild.innerHTML.trim();
      playMusic(`${song}.mp3`);
    });
  });
}

// to formate song time in 00:00 formate
function formatTime(time) {
  if (isNaN(time) || time < 0) {
    return "00:00";
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// to play passed music
const playMusic = (song, pause = false) => {
  currentSong.src = `/${currFolder}/${song}`;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = song.split(".")[0];
};

// to pause music
const pauseMusic = (song) => {
  currentSong.pause();
  play.src = "img/play.svg";
};

// to toggle left sidebar on screen width <= 1000px
function toggleSidebar() {
  if (window.innerWidth <= 1000) {
    document.getElementById("Splogo").addEventListener("click", () => {
      document.getElementById("left").classList.toggle("showLeft");
    });
  }
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");

  let array = Array.from(as);
  for (let idx = 0; idx < array.length; idx++) {
    const e = array[idx];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let res = await a.json();

      album.innerHTML += `<div data-folder="${folder}" class="card">
                                    <div class="playBtn">
                                      <img src="img/play.svg" alt="play-btn" />
                                    </div>
                                    <img src="/songs/${folder}/cover.jpeg" alt="Cover" />
                                    <h4>${res.title}</h4>
                                    <p>${res.description}</p>
                                  </div>`;
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async () => {
      songs = await getSongs(`songs/${e.dataset.folder}`);
    });
  });
}


async function main() {
  toggleSidebar();
  
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  
  displayAlbums();
  const root = document.documentElement;

  // attach event listener to play, pause, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      pauseMusic(currentSong);
    }
  });

  // listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;

    root.style.setProperty("--progress", (currentTime / duration) * 100 + "%");
    document.querySelector(".songTime").innerHTML = `${formatTime(
      currentTime
    )} / ${formatTime(duration)}`;
  });

  // event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let width = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    let seekTime = (width / 100) * currentSong.duration;
    currentSong.currentTime = seekTime;
    root.style.setProperty("--progress", width + "%");
  });

  // event listener on previous, next

  previous.addEventListener("click", () => {
    let idx = songs.indexOf(formateSong(currentSong.src));
    pauseMusic(currentSong);
    if (idx - 1 >= 0) {
      playMusic(songs[idx - 1]);
    }
  });

  next.addEventListener("click", () => {
    let idx = songs.indexOf(formateSong(currentSong.src));
    pauseMusic(currentSong);
    if (idx + 1 < songs.length) {
      playMusic(songs[idx + 1]);
    }
  });

  // event listener to change volume
  document.querySelector("#volume").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", e=>{
    if (e.target.src.includes("volume")){
      currentSong.volume = 0;
      document.querySelector("#volume").value = 0;
      e.target.src = e.target.src.replace("volume", "mute");      
    } else {
      currentSong.volume = 0.2;
      document.querySelector("#volume").value = 20;
      e.target.src = e.target.src.replace("mute", "volume");
    }
  })

}

main();
