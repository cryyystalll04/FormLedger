<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>FormLedger Signup</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="signup">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-icon="mdi-account"
                type="text"
                required
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                prepend-icon="mdi-lock"
                type="password"
                required
              ></v-text-field>
              <v-select
                v-model="role"
                :items="['user', 'admin']"
                label="User Role"
                prepend-icon="mdi-account-group"
                required
              ></v-select>
            </v-form>
            <div class="mt-4">
              Already have an account? <router-link to="/login">Login</router-link>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="signup">Sign Up</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const email = ref('');
const password = ref('');
const role = ref('user');

const signup = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/register', {
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value, // Send the selected role to the backend
    });

    console.log('Signup successful:', response.data);
    alert('Signup successful! You can now log in.');
    router.push('/login');
  } catch (error) {
    console.error('Signup failed:', error);
    alert('Signup failed. ' + (error.response?.data?.message || 'Please try again.'));
  }
};
</script>