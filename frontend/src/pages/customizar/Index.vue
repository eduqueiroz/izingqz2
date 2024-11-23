<template>
  <q-page class="q-pa-md" v-if="userProfile === 'superadmin'">
    <div class="q-gutter-md row justify-around">

      <!-- Card para Seleção de Cores -->
      <q-card flat bordered class="my-card col-12">
        <q-card-section>
          <div class="text-center q-pa-sm">
            Escolher Cores
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              Cor Neutra
              <q-color v-model="colors.neutral" label="Cor Neutra" />
            </div>
            <div class="col-12 col-md-3">
              Cor Primária
              <q-color v-model="colors.primary" label="Cor Primária" />
            </div>
            <div class="col-12 col-md-3">
              Cor Secundária
              <q-color v-model="colors.secondary" label="Cor Secundária" />
            </div>
            <div class="col-12 col-md-3">
              Cor de Destaque
              <q-color v-model="colors.accent" label="Cor de Destaque" />
            </div>
            <div class="col-12 col-md-3">
              Cor de Aviso
              <q-color v-model="colors.warning" label="Cor de Aviso" />
            </div>
            <div class="col-12 col-md-3">
              Cor Negativa
              <q-color v-model="colors.negative" label="Cor Negativa" />
            </div>
            <div class="col-12 col-md-3">
              Cor Positiva
              <q-color v-model="colors.positive" label="Cor Positiva" />
            </div>
            <div class="col-12 col-md-3">
              Cor Clara
              <q-color v-model="colors.light" label="Cor Clara" />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="applyColors">Salvar Cores</q-btn>
          <q-btn color="negative" @click="saveColorsToBackend">Aplicar Alterações de Cor</q-btn>
        </q-card-actions>
      </q-card>

      
      <!-- Card para Logo -->
      <q-card flat bordered class="my-card col-12 col-md-4">
        <q-card-section>
          <div class="text-center q-pa-sm">
            Logo
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center">
            <q-img :src="logoUrl" spinner-color="primary" style="height: 50px; width: 140px" />
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense style="width: 100%;">
            <template v-slot:prepend>
              <q-icon name="image" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerLogoFileInput" label="Escolher arquivo" color="primary" />
            </template>
            <input ref="logoFileInput" type="file" @change="handleLogoFileUpload" style="display: none;" />
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="uploadLogoFile" :disable="!selectedLogoFile">Upload</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Favicon -->
      <q-card flat bordered class="my-card col-12 col-md-4">
        <q-card-section>
          <div class="text-center q-pa-sm">
            Favicon
          </div>
        </q-card-section>
        <q-card-section>
          <div class="text-center">
            <q-img :src="iconUrl" spinner-color="primary" style="height: 50px; width: 140px" />
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense style="width: 100%;">
            <template v-slot:prepend>
              <q-icon name="favorite" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerIconFileInput" label="Escolher arquivo" color="primary" />
            </template>
            <input ref="iconFileInput" type="file" @change="handleIconFileUpload" style="display: none;" />
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="uploadIconFile" :disable="!selectedIconFile">Upload</q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para Atualizar Nome do Aplicativo -->
      <q-card flat bordered class="my-card col-12 col-md-3">
        <q-card-section>
          <div class="text-center q-pa-sm">
            Nome
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="appName"
            label="Nome do Aplicativo"
            filled
            dense
            style="width: 100%;"
          >
            <template v-slot:prepend>
              <q-icon name="edit" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" @click="updateAppName">Upload Nome</q-btn>
        </q-card-actions>
      </q-card>

      <q-card flat bordered class="my-card col-12">
        <div class="text-center q-mt-md">
        <div v-if="loadingBar" style="margin-top: 10px; margin-bottom: 20px; margin-left:10px; margin-right: 10px">
          <div v-if="loadingBar">Aguarde, aplicando alterações no seu frontend... Seu frontend está sendo rebuildado nesse momento.</div>
          <div v-if="loadingBar" class="loading-bar">
            <div class="bar"></div>
          </div>
        </div>
        <q-banner class="bg-yellow text-black" inline-actions>A alteração só irá funcionar em instalações que mantenham pasta e usuário padrão do instalador automático</q-banner>
        <q-btn style="margin-top: 10px; margin-bottom: 20px; margin-left:10px; margin-right: 10px" color="negative" @click="buildFrontend" :disabled="loadingBar">Aplicar Alterações de Logo, Favicon e Nome</q-btn>
      </div>
    </q-card>
    

    </div>
  </q-page>
</template>

<script>
import { UploadLogo, UploadIcon, UpdateName, Build } from 'src/service/customizar';
import { MostrarCores, AtualizarCores } from 'src/service/empresas';

export default {
  data() {
    return {
      userProfile: 'user',
      loadingBar: false,
      appName: '',
      logoUrl: '/zpro.png',
      iconUrl: '/favicon.ico',
      selectedLogoFile: null,
      selectedIconFile: null,
      colors: {
        neutral: "#E0E1E2",
        primary: "#5c67f2",
        secondary: "#f5f5f9",
        accent: "#ff5c93",
        warning: "#ffeb3b",
        negative: "#f44336",
        positive: "#25d366",
        light: "#8DB1DD",
      },
    };
  },
  created() {
    this.loadColorsFromBackend();
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile');
  },
  methods: {
    applyColors() {
      const root = document.documentElement;
      root.style.setProperty("--q-neutral", this.colors.neutral);
      root.style.setProperty("--q-primary", this.colors.primary);
      root.style.setProperty("--q-secondary", this.colors.secondary);
      root.style.setProperty("--q-accent", this.colors.accent);
      root.style.setProperty("--q-warning", this.colors.warning);
      root.style.setProperty("--q-negative", this.colors.negative);
      root.style.setProperty("--q-positive", this.colors.positive);
      root.style.setProperty("--q-light", this.colors.light);
    },
    async loadColorsFromBackend() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;
          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key]; // Use a chave correta aqui
            return acc;
          }, {});

          this.applyColors();
        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    // async loadColorsFromBackend() {
    //   try {
    //     const response = await MostrarCores();
    //     console.log(response.data);
    //     if (response.status === 200) {
    //       const companyData = response.data[0];
    //       const colorsArray = companyData.systemColors;
    //       this.colors = colorsArray.reduce((acc, colorObj) => {
    //         const key = colorObj.label.toLowerCase();
    //         acc[key] = colorObj.systemColors;
    //         return acc;
    //       }, {});

    //       this.applyColors();
    //     } else {
    //       console.error('Erro ao carregar as cores');
    //     }
    //   } catch (error) {
    //     console.error('Erro ao carregar as cores:', error);
    //   }
    // },
    async saveColorsToBackend() {
      try {
        const colorsArray = Object.keys(this.colors).map(key => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          [key]: this.colors[key]
        }));

        // Remover aspas dos valores
        const fixedColorsArray = colorsArray.map(color => {
          const newColor = {};
          Object.keys(color).forEach(key => {
            if (typeof color[key] === 'string') {
              newColor[key] = color[key].replace(/"/g, ''); // Remover aspas dos valores
            } else {
              newColor[key] = color[key];
            }
          });
          return newColor;
        });

        const response = await AtualizarCores(fixedColorsArray);
        if (response.status === 200) {
          console.log('Cores salvas com sucesso');
        } else {
          console.error('Erro ao salvar as cores');
        }
      } catch (error) {
        console.error('Erro ao salvar as cores:', error);
      }
    },
    triggerLogoFileInput() {
      this.$refs.logoFileInput.click();
    },
    handleLogoFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        this.selectedLogoFile = target.files[0];
      }
    },
    async uploadLogoFile() {
      if (!this.selectedLogoFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedLogoFile);

      try {
        const response = await UploadLogo(formData);
        if (response.status === 200) {
          this.logoUrl = URL.createObjectURL(this.selectedLogoFile);
        } else {
          console.error('Upload failed.');
        }
      } catch (error) {
        console.error('Error uploading file:' + JSON.stringify(error));
      }
    },
    triggerIconFileInput() {
      this.$refs.iconFileInput.click();
    },
    handleIconFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        this.selectedIconFile = target.files[0];
      }
    },
    async uploadIconFile() {
      if (!this.selectedIconFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedIconFile);

      try {
        const response = await UploadIcon(formData);
        if (response.status === 200) {
          this.iconUrl = URL.createObjectURL(this.selectedIconFile);
        } else {
          console.error('Upload failed.');
        }
      } catch (error) {
        console.error('Error uploading file: ' + JSON.stringify(error));
      }
    },
    async buildFrontend() {
      this.loadingBar = true
      try {
        const response = await Build();
        if (response.status === 200) {
          console.log('Frontend build successful.');
        } else {
          console.error('Build failed.');
        }
      } catch (error) {
        console.error('Error building frontend: ' + JSON.stringify(error));
      }
      setTimeout(() => {
        this.loadingBar = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 20000);
    },
    async updateAppName() {
      if (!this.appName) {
        return;
      }

      try {
        const response = await UpdateName({ newAppName: this.appName });
        if (response.status === 200) {
          console.log('Nome do aplicativo atualizado com sucesso.');
        } else {
          console.error('Falha ao atualizar o nome do aplicativo.');
        }
      } catch (error) {
        console.error('Erro ao atualizar o nome do aplicativo: ' + JSON.stringify(error));
      }
    }
  }
};
</script>

<style scoped>
.my-card {
  margin: 0 auto;
  margin-top: 10px;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: relative;
}
.loading-bar .bar {
  width: 0;
  height: 100%;
  background-color: #007bff;
  position: absolute;
  top: 0;
  left: 0;
  animation: loadingAnimation 1s infinite;
}

@keyframes loadingAnimation {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>