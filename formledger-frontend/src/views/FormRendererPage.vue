<template>
  <v-container>
    <v-card class="mt-8">
      <v-card-title>
        <v-btn icon @click="goBack" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Dynamic Form</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-form v-if="form" @submit.prevent="submitForm">
          <div v-for="(field, fieldName) in form.form_schema.schema" :key="fieldName" class="mb-4">
            <v-text-field
              v-if="field.type === 'text' && field.inputType !== 'number' && field.inputType !== 'email'"
              :label="field.label"
              :type="field.inputType || 'text'"
              v-model="formData[fieldName]"
              :placeholder="field.placeholder"
            ></v-text-field>
            <v-text-field
              v-else-if="field.type === 'text' && field.inputType === 'email'"
              :label="field.label"
              type="email"
              v-model="formData[fieldName]"
              :placeholder="field.placeholder"
            ></v-text-field>
            <v-text-field
              v-else-if="field.type === 'text' && field.inputType === 'number'"
              :label="field.label"
              type="number"
              v-model="formData[fieldName]"
              :placeholder="field.placeholder"
            ></v-text-field>
            <v-textarea
              v-else-if="field.type === 'textarea'"
              :label="field.label"
              v-model="formData[fieldName]"
              :placeholder="field.placeholder"
            ></v-textarea>
            <v-text-field
              v-else-if="field.type === 'date'"
              :label="field.label"
              type="date"
              v-model="formData[fieldName]"
            ></v-text-field>
            </div>
          <v-btn type="submit" color="success">Submit</v-btn>
        </v-form>
        <div v-else-if="!loading">
          <p>Form not found.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const form = ref(null);
const formData = ref({});
const loading = ref(true);
const error = ref(null);

const fetchFormSchema = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  try {
    const response = await axios.get(`http://localhost:3000/api/forms/${route.params.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    form.value = response.data;
  } catch (err) {
    console.error('Failed to fetch form schema:', err);
    error.value = 'Failed to load form. Please try again.';
  } finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  try {
    await axios.post(`http://localhost:3000/api/forms/${route.params.id}/submit`, {
      form_values: formData.value,
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert('Form submitted successfully!');
    router.push('/dashboard');
  } catch (err) {
    console.error('Failed to submit form:', err);
    alert('Failed to submit form. Please try again.');
  }
};

const goBack = () => {
  router.go(-1);
};

onMounted(fetchFormSchema);
</script>