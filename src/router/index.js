import { createRouter, createWebHistory } from 'vue-router';
import ProfilePage        from '../pages/ProfilePage.vue';
import SongsPage          from '../pages/SongsPage.vue';
import SettingsPage       from '../pages/SettingsPage.vue';
import PlaylistsPage      from '../pages/PlaylistsPage.vue';
import PlaylistDetailPage from '../pages/PlaylistDetailPage.vue';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    { path: '/',                redirect: '/profile' },
    { path: '/profile',         component: ProfilePage },
    { path: '/songs',           component: SongsPage },
    { path: '/playlists',       component: PlaylistsPage },
    { path: '/playlists/:id',   component: PlaylistDetailPage },
    { path: '/settings',        component: SettingsPage },
  ],
});

export default router;
