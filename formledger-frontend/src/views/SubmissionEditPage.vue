<template>
  <v-container>
    <v-card class="mt-8">
      <v-card-title>
        <v-btn icon @click="goBack" class="mr-2">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Edit Submission
      </v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-form v-if="form" @submit.prevent="updateSubmission">
          <div v-for="(field, fieldName) in form.form_schema.schema" :key="fieldName" class="mb-4">
            <v-text-field
              v-if="field.type === 'text' || field.type === 'email' || field.type === 'url' || field.type === 'number'"
              :label="field.label"
              v-model="formData[fieldName]"
              :type="field.type === 'number' ? 'number' : 'text'"
            ></v-text-field>
            <v-textarea
              v-else-if="field.type === 'textarea'"
              :label="field.label"
              v-model="formData[fieldName]"
            ></v-textarea>
            </div>

          <v-select
            v-model="submissionStatus"
            :items="['pending', 'in-progress', 'completed']"
            label="Submission Status"
            class="mt-4"
          ></v-select>
          
          <v-btn type="submit" color="primary" class="mt-4">Save Changes</v-btn>
        </v-form>
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
const submissionStatus = ref('pending');
const error = ref(null);
const loading = ref(true);

const fetchSubmissionData = async () => {
  try {
    const submissionResponse = await axios.get(`http://localhost:3000/api/submissions/${route.params.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    const submission = submissionResponse.data;
    formData.value = submission.form_values;
    submissionStatus.value = submission.status;

    const formResponse = await axios.get(`http://3000/api/forms/${route.query.formId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    form.value = formResponse.data;

  } catch (err) {
    console.error('Failed to fetch data:', err);
    error.value = 'Failed to load form and submission data.';
  } finally {
    loading.value = false;
  }
};

const updateSubmission = async () => {
  try {
    await axios.put(`http://localhost:3000/api/submissions/${route.params.id}`, {
      form_values: formData.value,
      status: submissionStatus.value,
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    alert('Submission updated successfully!');
    router.go(-1);
  } catch (err) {
    console.error('Failed to update submission:', err);
    error.value = 'Failed to update submission. Please try again.';
  }
};

const goBack = () => {
  router.go(-1);
};

onMounted(fetchSubmissionData);
</script>