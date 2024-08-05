const providers = [
  '@adonisjs/drive/providers/DriveProvider'
]
import { createApp } from 'vue';
import Toast, { useToast } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp({});
const toast = useToast();

// Configurer Toastification
app.use(Toast, {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  position: "top-right",
  preventDuplicates: false,
  duration: 5000,
  transition: "Vue-Toastification__fade",
});

// Vérifier les messages flash de la session
if (window.flashMessage) {
  toast.success(window.flashMessage);
}

app.mount('#app');
