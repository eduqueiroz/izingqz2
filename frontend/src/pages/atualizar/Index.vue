<template>
  <q-page class="q-pa-md" v-if="userProfile === 'superadmin'">
    <div class="q-gutter-md row justify-around">

      <!-- Card para Upload do update_rapido.zip -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="cloud_upload" size="30px" color="primary" />
            <div class="text-h6">Upload do Arquivo update_rapido.zip</div>
            <q-banner class="bg-yellow text-black" inline-actions style="margin-top: 10px;">
              <p>Arquivo disponível dentro da pasta zpro_passaporte_shell.rar</p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-section>
          <q-input filled dense :value="selectedFileName || ''" style="width: 100%;" readonly>
            <template v-slot:prepend>
              <q-icon name="folder" />
            </template>
            <template v-slot:append>
              <q-btn @click="triggerUpdateFileInput" label="Escolher arquivo" color="primary" :disable="uploading" />
            </template>
            <input ref="updateFileInput" type="file" @change="handleUpdateFileUpload" style="display: none;" />
          </q-input>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="primary" @click="uploadUpdateFile" :disable="!selectedUpdateFile || uploading" class="q-mt-sm">
            UPLOAD
          </q-btn>
        </q-card-actions>
        <q-card-section v-if="uploading" class="q-pa-md">
          <q-linear-progress :value="uploadProgress" color="primary" size="10px" animated />
        </q-card-section>
      </q-card>

      <!-- Card para iniciar o processo de atualização -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="build" size="30px" color="negative" />
            <div class="text-h6">Iniciar Processo de Atualização</div>
            <q-banner class="bg-yellow text-black" inline-actions style="margin-top: 10px;">
              <p>Antes de atualizar, é obrigatório realizar um snapshot da VPS e garantir que tem acesso ao usuário root via SSH da VPS, para possíveis intervenções. O processo pode levar até 20 minutos, dependendo da performance da sua VPS. </p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="negative" @click="startUpdateProcess" :disabled="!updateReady || updatingProcess" class="q-mt-sm">
            INICIAR ATUALIZAÇÃO
          </q-btn>
        </q-card-actions>
        <q-card-section v-if="updatingProcess" class="q-pa-md">
          <q-linear-progress indeterminate color="negative" />
        </q-card-section>
      </q-card>

      <!-- Card para iniciar o processo de migração -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="mdi-transfer" size="30px" color="negative" />
            <div class="text-h6">Iniciar Processo de Migração de Arquivos</div>
            <q-banner class="bg-yellow text-black" inline-actions style="margin-top: 10px;">
              <p>ATENÇÃO: Esse é um processo irreversível e irá fazer uma cópia dos arquivos da pasta public para a subpasta da Empresa. Antes de iniciar o processo de migração de arquivos, é obrigatório realizar um snapshot da VPS e garantir que tem acesso ao usuário root via SSH da VPS, para possíveis intervenções. O processo pode levar até algumas horas, dependendo da performance da sua VPS e quantidade arquivos. </p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="negative" @click="startMigrationProcess" class="q-mt-sm">
            INICIAR MIGRAÇÃO
          </q-btn>
        </q-card-actions>
      </q-card>

      <!-- Card para iniciar o processo de limpeza -->
      <q-card flat bordered class="my-card col-12 col-md-5">
        <q-card-section>
          <div class="text-center q-pa-md">
            <q-icon name="mdi-delete-outline" size="30px" color="negative" />
            <div class="text-h6">Iniciar Processo de Limpeza da Pasta Public</div>
            <q-banner class="bg-yellow text-black" inline-actions style="margin-top: 10px;">
              <p>ATENÇÃO: Esse é um processo irreversível e irá deletar todos os arquivos na pasta public. Antes de iniciar o processo de limpeza de arquivos, é obrigatório realizar um snapshot da VPS e garantir que tem acesso ao usuário root via SSH da VPS, para possíveis intervenções. O processo pode levar até algumas horas, dependendo da performance da sua VPS e quantidade arquivos. </p>
            </q-banner>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn color="negative" @click="startCleanProcess" class="q-mt-sm">
            INICIAR LIMPEZA
          </q-btn>
        </q-card-actions>
      </q-card>

    </div>
  </q-page>
</template>

<script>
import { UploadZip, Update, MigrarArquivos, LimparArquivos } from 'src/service/customizar';

export default {
  data() {
    return {
      userProfile: 'user',
      uploading: false,
      updatingProcess: false,
      selectedUpdateFile: null,
      selectedFileName: '',
      uploadProgress: 0,
      updateReady: false,
    };
  },
  methods: {
    triggerUpdateFileInput() {
      this.$refs.updateFileInput.click();
    },
    handleUpdateFileUpload(event) {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        if (file.name === 'update_rapido.zip') {
          this.selectedUpdateFile = file;
          this.selectedFileName = file.name;
        } else {
          this.selectedUpdateFile = null;
          this.selectedFileName = '';
          this.$q.notify({
            color: 'negative',
            message: 'Apenas o arquivo update_rapido.zip é permitido.',
            timeout: 2000
          });
        }
      }
    },
    async uploadUpdateFile() {
      if (!this.selectedUpdateFile) return;

      const formData = new FormData();
      formData.append('file', this.selectedUpdateFile);

      this.uploading = true;
      this.uploadProgress = 0;

      try {
        const response = await UploadZip(formData, {
          onUploadProgress: (progressEvent) => {
            this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          }
        });
        if (response.status === 200) {
          this.updateReady = true;
          this.$q.notify({
            color: 'positive',
            message: 'Arquivo carregado com sucesso.',
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Falha no upload do arquivo.',
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: 'Erro ao carregar o arquivo: ' + JSON.stringify(error),
          timeout: 2000
        });
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },
    async startUpdateProcess() {
      this.updatingProcess = true;
      try {
        const response = await Update();
        if (response.status === 200) {
          this.$q.notify({
            color: 'positive',
            message: 'Processo de atualização iniciado com sucesso.',
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Falha ao iniciar o processo de atualização.',
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: 'Erro ao iniciar o processo de atualização: ' + JSON.stringify(error),
          timeout: 2000
        });
      }
      setTimeout(() => {
        this.updatingProcess = false;
      }, 20000); // Simulação de tempo de execução do processo
    },
    async startMigrationProcess() {
      try {
        const response = await MigrarArquivos();
        if (response.status === 200) {
          this.$q.notify({
            color: 'positive',
            message: 'Processo de migração iniciado com sucesso.',
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Falha ao iniciar o processo de migração.',
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: 'Erro ao iniciar o processo de migração: ' + JSON.stringify(error),
          timeout: 2000
        });
      }
    },
    async startCleanProcess() {
      try {
        const response = await LimparArquivos();
        if (response.status === 200) {
          this.$q.notify({
            color: 'positive',
            message: 'Processo de limpeza iniciado com sucesso.',
            timeout: 2000
          });
        } else {
          this.$q.notify({
            color: 'negative',
            message: 'Falha ao iniciar o processo de limpeza.',
            timeout: 2000
          });
        }
      } catch (error) {
        this.$q.notify({
          color: 'negative',
          message: 'Erro ao iniciar o processo de limpeza: ' + JSON.stringify(error),
          timeout: 2000
        });
      }
    },
  },
  mounted() {
    this.userProfile = localStorage.getItem('profile');
  },
};
</script>

<style scoped>
.my-card {
  margin: 20px auto;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
