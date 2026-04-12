$(document).ready(function () {

  let state = {
    username: "Guest",
    playlists: [],
    favoriteSongs: [],
    favoriteArtists: []
  };
  
  let allSongs = [];
  let uniqueArtists = [];

  function init() {
    //fetchProfile();
    loadFromLocalStorage();
    fetchSongs();
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem("profile");

    if (saved) {
        state = JSON.parse(saved);
    }

    renderAll();
  }

  /*
  function fetchProfile() {
    $.ajax({
      url: '/api/profile',
      method: 'GET',
      success: (data) => {
        state = data;
        renderAll();
      },
      error: () => {
        console.warn("No profile found, using defaults");
        renderAll();
      }
    });
  }*/

  function fetchSongs() {
    $.ajax({
        url: '/api/songs',
        method: 'GET',
        success: (data) => {
        allSongs = data;

        uniqueArtists = [...new Set(data.map(s => s.artist))];

        populateArtistDropdown();
        populateSongDropdown();
        },
        error: () => console.error("Failed to load songs from server")
    });
  }

  function populateArtistDropdown() {
    $("#artistDropdown").empty().append(`<option value="">Select artist...</option>`);

    uniqueArtists.forEach(artist => {
        $("#artistDropdown").append(`<option value="${artist}">${artist}</option>`);
    });
  }

  function populateSongDropdown() {
    $("#songDropdown").empty().append(`<option value="">Select song...</option>`);
    
    allSongs.forEach(song => {
        const formatted = `${song.title} - ${song.artist}`;

        $("#songDropdown").append(
        `<option value="${formatted}">${formatted}</option>`
        );
    });
  }

  function saveProfile() {
    localStorage.setItem("profile", JSON.stringify(state));

    $.ajax({
        url: '/api/profile',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(state)
    });
    /*
    $.ajax({
      url: '/api/profile',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(state),
      error: (err) => console.error("Save failed:", err)
    });
    */
  }

  function renderAll() {
    renderUsername();
    renderPlaylists();
    renderSongs();
    renderArtists();
    updateStats();
  }

  function renderPlaylists() {
    $("#playlistList").empty();

    state.playlists.forEach((p, index) => {
        $("#playlistList").append(`
        <tr>
            <td>${p}</td>
            <td>
            <button class="button is-danger is-small remove-playlist" data-index="${index}">✕</button>
            </td>
        </tr>
        `);
    });
  }

  function addPlaylist() {
    const val = $("#playlistInput").val().trim();
    if (!val) return;

    state.playlists.push(val);
    $("#playlistInput").val("");

    renderPlaylists();
    updateStats();
    saveProfile();
  }

  function removePlaylist(index) {
    state.playlists.splice(index, 1);
    renderPlaylists();
    updateStats();
    saveProfile();
  }

  function renderSongs() {
    $("#songList").empty();

    state.favoriteSongs.forEach((s, index) => {
        const [title, artist] = s.split(" - ");

        $("#songList").append(`
        <tr>
            <td>${title}</td>
            <td>${artist}</td>
            <td>
            <button class="button is-danger is-small remove-song" data-index="${index}">✕</button>
            </td>
        </tr>
        `);
    });
  }

  function addSong() {
    const dropdownVal = $("#songDropdown").val();

    if (dropdownVal) {

        if (state.favoriteSongs.includes(dropdownVal)) {
            alert("Song already added!");
            return;
        }

        state.favoriteSongs.push(dropdownVal);

        $("#songDropdown").val("");
        renderSongs();
        updateStats();
        saveProfile();
        return;
    }

    const title = $("#customTitle").val().trim();
    const artist = $("#customArtist").val().trim();

    if (!title || !artist) {
        alert("Please fill all fields for custom song.");
        return;
    }

    const formatted = `${title} - ${artist}`;

    if (state.favoriteSongs.includes(formatted)) {
        alert("Song already added!");
        return;
    }

    state.favoriteSongs.push(formatted);

    $("#customTitle, #customArtist").val("");

    renderSongs();
    updateStats();
    saveProfile();
  }

  function removeSong(index) {
    state.favoriteSongs.splice(index, 1);
    renderSongs();
    updateStats()
    saveProfile();
  }

  function renderArtists() {
    $("#artistList").empty();

    state.favoriteArtists.forEach((a, index) => {
        $("#artistList").append(`
        <tr>
            <td>${a}</td>
            <td>
            <button class="button is-danger is-small remove-artist" data-index="${index}">✕</button>
            </td>
        </tr>
        `);
    });
  }

  function addArtist() {
    const dropdownVal = $("#artistDropdown").val();
    const customVal = $("#artistInput").val().trim();

    const artist = dropdownVal || customVal;
    if (!artist) return;

    if (state.favoriteArtists.includes(artist)) {
        alert("Artist already added!");
        return;
    }

    state.favoriteArtists.push(artist);

    $("#artistInput").val("");
    $("#artistDropdown").val("");

    renderArtists();
    updateStats();
    saveProfile();
  }

  function removeArtist(index) {
    state.favoriteArtists.splice(index, 1);
    renderArtists();
    updateStats()
    saveProfile();
  }

  function renderUsername() {
    $("#usernameDisplay").text(state.username);

    $("#profileDescription").text(
        `We don't know much about ${state.username} but we're sure they have great music taste!`
    );
  }

  function updateStats() {
    $("#artistCount").text(state.favoriteArtists.length);
    $("#songCount").text(state.favoriteSongs.length);
    $("#playlistCount").text(state.playlists.length);
  }

  $("#addPlaylist").click(addPlaylist);
  $("#addSong").click(addSong);
  $("#addArtist").click(addArtist);

  $(document).on("click", ".remove-playlist", function () {
    removePlaylist($(this).data("index"));
  });

  $(document).on("click", ".remove-song", function () {
    removeSong($(this).data("index"));
  });

  $(document).on("click", ".remove-artist", function () {
    removeArtist($(this).data("index"));
  });

  init();

});