const { createApp } = Vue;

createApp({
  data() {
    return {
      songs: [],
      filterGenre: '',
      filterArtist: '',
      searchQuery: '',
      newSong: { title: '', artist: '', genre: '', duration: '', year: '' }
    };
  },

  computed: {
    filteredSongs() {
      return this.songs.filter(song => {
        const matchGenre = this.filterGenre === '' || song.genre === this.filterGenre;
        const matchArtist = this.filterArtist === '' || song.artist.toLowerCase().includes(this.filterArtist.toLowerCase());
        const matchSearch = this.searchQuery === '' || song.title.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchGenre && matchArtist && matchSearch;
      });
    },

    uniqueGenres() {
      return [...new Set(this.songs.map(s => s.genre))];
    }
  },

  mounted() {
    this.fetchSongs();
  },

  methods: {
    fetchSongs() {
      $.ajax({
        url: '/api/songs',
        method: 'GET',
        success: (data) => {
          this.songs = data;
        },
        error: (err) => {
          console.error('Failed to fetch songs:', err);
        }
      });
    },

    addSong() {
      $.ajax({
        url: '/api/songs',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this.newSong),
        success: (data) => {
          this.songs.push(data);
          this.newSong = { title: '', artist: '', genre: '', duration: '', year: '' };
        },
        error: (err) => {
          console.error('Failed to add song:', err);
        }
      });
    },

    removeSong(id) {
      $.ajax({
        url: `/api/songs/${id}`,
        method: 'DELETE',
        success: () => {
          this.songs = this.songs.filter(s => s.id != id);
        },
        error: (err) => {
          console.error('Failed to remove song:', err);
        }
      });
    }
  },

  template: `
    <section class="section">
      <div class="container">
        <h1 class="title">🎵 Songs</h1>

        <!-- Filters -->
        <div class="columns mb-4">
          <div class="column">
            <input class="input" type="text" placeholder="Search by title..." v-model="searchQuery"/>
          </div>
          <div class="column">
            <input class="input" type="text" placeholder="Filter by artist..." v-model="filterArtist"/>
          </div>
          <div class="column">
            <div class="select is-fullwidth">
              <select v-model="filterGenre">
                <option value="">All Genres</option>
                <option v-for="genre in uniqueGenres" :key="genre">{{ genre }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Songs Table -->
        <table class="table is-fullwidth is-striped is-hoverable">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Genre</th>
              <th>Duration</th>
              <th>Year</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="song in filteredSongs" :key="song.id">
              <td>{{ song.id }}</td>
              <td>{{ song.title }}</td>
              <td>{{ song.artist }}</td>
              <td>{{ song.genre }}</td>
              <td>{{ song.duration }}</td>
              <td>{{ song.year }}</td>
              <td>
                <button class="button is-danger is-small" @click="removeSong(song.id)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add Song Form -->
        <div class="box mt-5">
          <h2 class="subtitle">Add a Song</h2>
          <div class="columns">
            <div class="column"><input class="input" placeholder="Title" v-model="newSong.title"/></div>
            <div class="column"><input class="input" placeholder="Artist" v-model="newSong.artist"/></div>
            <div class="column"><input class="input" placeholder="Genre" v-model="newSong.genre"/></div>
            <div class="column"><input class="input" placeholder="Duration" v-model="newSong.duration"/></div>
            <div class="column"><input class="input" placeholder="Year" v-model="newSong.year"/></div>
          </div>
          <button class="button is-success" @click="addSong">Add Song</button>
        </div>

        <!-- D3 Chart -->
        <div class="box mt-5">
          <h2 class="subtitle">Songs by Genre</h2>
          <div id="genre-chart"></div>
        </div>

      </div>
    </section>
  `
}).mount('#app');