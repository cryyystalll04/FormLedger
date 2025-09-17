<template>
  <v-container>
    <v-card class="mt-8">
      <v-card-title class="d-flex justify-space-between align-center">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Submissions for Form: {{ route.params.id }}
      </v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-data-table
          :headers="headers"
          :items="submissions"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.form_values="{ item }">
            <div class="d-flex flex-wrap">
              <span v-for="(value, key, index) in item.form_values" :key="key" class="mr-4">
                <span class="font-weight-bold">{{ key }}:</span> {{ value }}
                <span v-if="index < Object.keys(item.form_values).length - 1">,</span>
              </span>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn small color="secondary" @click="exportSingleSubmission(item)">Export as PDF</v-btn>
            <v-btn small color="primary" @click="editSubmission(item)">Edit</v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import jsPDF from 'jspdf';

const route = useRoute();
const router = useRouter();
const goBack = () => {
  router.go(-1);
};
const authStore = useAuthStore();
const submissions = ref([]);
const loading = ref(true);
const error = ref(null);

const headers = [
  { title: 'User', key: 'username', width: '10%' },
  { title: 'Submission Date', key: 'submittedAt', width: '15%' },
  { title: 'Values', key: 'form_values', sortable: false, width: '45%' },
  { title: 'Status', key: 'status', width: '10%' },
  { title: 'Actions', key: 'actions', sortable: false, width: '20%' },
];

const fetchSubmissions = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  try {
    loading.value = true;
    const response = await axios.get(`http://localhost:3000/api/forms/${route.params.id}/submissions`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    submissions.value = response.data;
  } catch (err) {
    console.error('Failed to fetch submissions:', err);
    error.value = 'Failed to load submissions. Please ensure you are an admin.';
  } finally {
    loading.value = false;
  }
};

const exportToPdf = () => {
  const doc = new jsPDF();
  let y = 10;

  doc.text(`Submissions for Form: ${route.params.id}`, 10, y);
  y += 10;

  submissions.value.forEach((submission, index) => {
    doc.text(`--- Submission ${index + 1} ---`, 10, y);
    y += 10;
    doc.text(`User: ${submission.username}`, 10, y);
    y += 7;
    doc.text(`Submitted At: ${new Date(submission.submittedAt).toLocaleDateString()}`, 10, y);
    y += 7;
    doc.text('Form Values:', 10, y);
    y += 7;

    // Loop through form values
    for (const [key, value] of Object.entries(submission.form_values)) {
      doc.text(`- ${key}: ${value}`, 15, y);
      y += 7;
    }

    y += 10;

    // Add a new page if content exceeds current page
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save(`${route.params.id}-submissions.pdf`);
};

// New method to export a single submission to PDF
const exportSingleSubmission = (submission) => {
  const doc = new jsPDF();
  let y = 10;
  
  // Title for the document
  doc.text(`Form Submission Details`, 10, y);
  y += 10;
  
  // Basic submission info
  doc.text(`User: ${submission.username}`, 10, y);
  y += 7;
  doc.text(`Submitted At: ${new Date(submission.submittedAt).toLocaleDateString()}`, 10, y);
  y += 7;
  doc.text(`Status: ${submission.status}`, 10, y);
  y += 10;

  // Form values
  doc.text('Submitted Values:', 10, y);
  y += 7;

  // Loop through form values and add to the PDF
  for (const [key, value] of Object.entries(submission.form_values)) {
    doc.text(`- ${key}: ${value}`, 15, y);
    y += 7;
  }
  
  // Save the PDF with a unique filename
  doc.save(`${route.params.id}_${submission.username}_submission.pdf`);
};

const editSubmission = (submission) => {
  router.push({
    name: 'edit-submission',
    params: { id: submission.id },
    query: { formId: route.params.id }
  });
};

onMounted(fetchSubmissions);
</script>
