<template>
  <v-container>
    <v-card class="mt-8">
      <v-card-title>
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Create New Form
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="createForm">
          <v-text-field
            v-model="formName"
            label="Form Name"
            outlined
            dense
          ></v-text-field>
          <v-textarea
            v-model="formSchema"
            label="Paste JSON Schema Here"
            outlined
            rows="15"
          ></v-textarea>
          <v-btn type="submit" color="primary">Create Form</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const goBack = () => {
  router.go(-1);
};
const authStore = useAuthStore();
const formName = ref('');
const formSchema = ref('');

const createForm = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  try {
    const schemaObject = JSON.parse(formSchema.value);
    await axios.post('http://localhost:3000/api/forms', {
      name: formName.value,
      form_schema: schemaObject,
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    alert('Form created successfully!');
    router.push('/dashboard');
  } catch (err) {
    console.error('Failed to create form:', err);
    alert('Failed to create form. Please check your JSON schema and try again.');
  }
};
</script>