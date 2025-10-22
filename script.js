let currfolder;
let songs_url;
let currSong = new Audio();
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
let getSongs = async function (folder) {
    currfolder = folder;
    let urls = await fetch(`http://127.0.0.1:5500/songs/${folder}`);
    let response = await urls.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let links = div.getElementsByTagName("a");
    songs_url = [];
    for (let count = 0; count < links.length; count++) {
        let element = links[count];
        if (element.href.endsWith(".mp3")) {
            songs_url.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }
    playMusic(songs_url[0], true)
    // get songs and append in li's
    let ul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    ul.innerHTML = " "
    songs_url.forEach(song => {
        let li = document.createElement("li");
        // li.innerHTML = " "
        li.innerHTML = `<img class="invert" src="music.svg" alt="" />
                <div class="info">
                  <div>${decodeURI(song)}</div>
                  <div>album</div>
                </div>
                <div class="playnow">
                  <span>playnow</span>
                  <img class="invert" src="playnow.svg" alt="" />
                </div>`;
        ul.innerHTML + ul.appendChild(li);
    })

    //add eventlistener to the each li
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(list => {
        list.addEventListener("click", () => {
            console.log(list.getElementsByClassName("info")[0].firstElementChild.innerHTML);
            playMusic(list.getElementsByClassName("info")[0].firstElementChild.innerHTML);
        })
    })

    return songs_url;
}

let playMusic = function (track, pause = false) {
    currSong.src = `/songs/${currfolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "pause.svg";
    }
    let songinfo = document.querySelector(".songinfo");
    songinfo.innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

let Albums = async function () {
    // console.log("album display");
    let albums_url = await fetch("http://127.0.0.1:5500/songs/");
    let album_response = await albums_url.text();
    let div = document.createElement("div");
    div.innerHTML = album_response;
    console.log(div);
    let links = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        if (link.href.includes("/songs/")) {
            let data_folder = link.href.split("/").slice(-1)[0];
            console.log(data_folder);
            let anchor = await fetch(`http://127.0.0.1:5500/songs/${data_folder}/data.json`);
            anchor_response = await anchor.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${data_folder} class="card">
              <img src="/songs/${data_folder}/cover.jpg" alt="" />
              <h3>${anchor_response.heading}</h3>
              <p>${anchor_response.info}</p>
            </div>`
        }
    }
}


let main = async function () {
    await getSongs("stylesongs")

    //displaying album
    await Albums();

    //eventlistener for timeupdate
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)}/${secondsToMinutesSeconds(currSong.duration)}`;
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
    })
    //eventlistener for seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100;
    })
    //eventlistener to play
    play.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            play.src = "pause.svg";
        } else {
            currSong.pause();
            play.src = "play.svg"
        }
    })
    //eventlistner for previous
    previous.addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs_url.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs_url[index - 1]);
        }
    })

    //eventlistener for next
    next.addEventListener("click", () => {
        console.log("next clicked");
        let index = songs_url.indexOf(currSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs_url.length) {
            playMusic(songs_url[index + 1]);
        }
    })
    //eventlistener for hamburger
    hamburger.addEventListener("click", () => {
        let leftElement = document.querySelector(".left");
        leftElement.style.left = "0%";
        leftElement.style.zIndex = "1";
    })
    //eventlistener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })
    //eventlistener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", e => {
        currSong.volume = e.target.value / 100;
    })
    //eventlistener for mute
    volume.addEventListener("click", () => {
        if (currSong.volume > 0) {
            volume.src = "mute.svg";
            currSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            volume.src = "volume.svg";
            currSong.volume = 20 / 100;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 20;
        }
    })
    //Load playlist whenever card is clicked
    Array.from(document.querySelector(".cardContainer").getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (element) => {
            songs_url = await getSongs(element.currentTarget.dataset.folder);
            playMusic(songs_url[0]);
        })
    })
}
main();