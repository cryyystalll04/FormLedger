<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>FormLedger</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/login" v-if="!authStore.isAuthenticated">Login</v-btn>
      <v-btn text to="/signup" v-if="!authStore.isAuthenticated">Sign Up</v-btn>
      <v-btn text @click="logout" v-if="authStore.isAuthenticated">
        Logout
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  router.push('/');
};
</script>