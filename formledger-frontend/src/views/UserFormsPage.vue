<template>
  <v-container>
    <v-card class="mt-8 pa-4">
      <v-card-title class="text-h5 font-weight-bold">Available Forms</v-card-title>
      <v-card-subtitle class="mt-1">
        Select a form to fill out and submit your information
      </v-card-subtitle>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <div v-if="forms.length">
          <v-row>
            <v-col v-for="form in forms" :key="form.id" cols="12" sm="6" md="4" lg="3">
              <v-card hover class="fill-height">
                <v-card-text>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title class="text-h6">{{ form.name }}</v-list-item-title>
                      </v-list-item-content>
                  </v-list-item>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" :to="`/forms/${form.id}`">Fill Out Form</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
        <div v-else-if="!loading" class="text-center py-8">
          <p class="text-h6 text-medium-emphasis">No forms found</p>
          <p class="text-subtitle-1 text-medium-emphasis">There are no forms available for you to fill out at this time.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const forms = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchForms = async () => {
  if (!authStore.isAuthenticated) {
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
    if (err.response && err.response.status === 401) {
      authStore.logout();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchForms();
});
</script>