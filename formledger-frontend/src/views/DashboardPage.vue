<template>
  <v-container>
    <v-row class="mt-8">
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 text-center">
          <v-icon size="48" color="primary">mdi-format-list-checks</v-icon>
          <div class="text-h5 font-weight-bold mt-2">{{ activeFormsCount }}</div>
          <p class="text-subtitle-1 text-medium-emphasis">Active Forms</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 text-center">
          <v-icon size="48" color="primary">mdi-file-edit-outline</v-icon>
          <div class="text-h5 font-weight-bold mt-2">{{ totalSubmissions }}</div>
          <p class="text-subtitle-1 text-medium-emphasis">Total Submissions</p>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-card class="pa-4 text-center">
          <v-icon size="48" color="primary">mdi-chart-bar</v-icon>
          <div class="text-h5 font-weight-bold mt-2">{{ averageSubmissions }}</div>
          <p class="text-subtitle-1 text-medium-emphasis">Avg Submissions</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-8">
      <v-card-title class="d-flex justify-space-between align-center">
        All Forms
        <v-btn color="primary" to="/create-form">
          <v-icon left>mdi-plus</v-icon>
          Create New Form
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-data-table
          :headers="headers"
          :items="forms"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.created="{ item }">
            {{ new Date(item.created).toLocaleDateString() }}
          </template>
          <template v-slot:item.submissions="{ item }">
            <span class="font-weight-bold">{{ item.submissionCount }}</span>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn small color="primary" :to="`/submissions/${item.id}`">View Submissions</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const forms = ref([]);
const loading = ref(true);
const error = ref(null);

const headers = [
  { title: 'Form Name', key: 'name' },
  { title: 'Status', key: 'status' },
  { title: 'Created', key: 'created' },
  { title: 'Submissions', key: 'submissionCount' },
  { title: 'Actions', key: 'actions', sortable: false },
];

const activeFormsCount = computed(() => forms.value.filter(f => f.status === 'active').length);
const totalSubmissions = computed(() => forms.value.reduce((sum, form) => sum + form.submissionCount, 0));
const averageSubmissions = computed(() => totalSubmissions.value / (forms.value.length || 1));

const fetchForms = async () => {
  if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
    router.push('/login');
    return;
  }

  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/api/forms', {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    forms.value = response.data;
  } catch (err) {
    console.error('Failed to fetch forms:', err);
    error.value = 'Failed to load forms. Please try again.';
    if (err.response && err.response.status === 403) {
      error.value = 'Access denied. You do not have permission to view this page.';
    }
    if (err.response && err.response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchForms);
</script>