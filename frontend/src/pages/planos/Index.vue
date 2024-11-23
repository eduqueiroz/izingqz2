<template>
  <div v-if="userProfile === 'superadmin' ">
    <q-table flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Planos"
      :data="planos"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]">
      <template v-slot:top-right>
        <q-btn color="primary"
          style="margin: 5px"
          label="Adicionar"
          @click="planoEdicao = {}; modalPlano = true" />
        <q-btn
          style="margin: 5px"
          color="primary"
          label="Token Asaas"
          @click="openAsaasModal"
        />
        <q-btn
          style="margin: 5px"
          color="negative"
          label="Ver Token"
          :disable="true"
        >
        <q-tooltip anchor="bottom middle" self="top middle">
            <p>{{ showToken }}</p>
          </q-tooltip>
        </q-btn>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
            icon="edit"
            @click="editarPlano(props.row)" />
          <q-btn flat
            round
            icon="mdi-delete"
            @click="deletarPlano(props.row)" />
        </q-td>
      </template>
    </q-table>
    <ModalPlano :modalPlano.sync="modalPlano"
      :planoEdicao.sync="planoEdicao"
      @modal-plano:criada="planoCriada"
      @modal-plano:editada="planoEditada" />
    <q-dialog v-model="isAsaasModalOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alterar Token Asaas</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="asaasToken" label="Token Asaas" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" @click="closeAsaasModal" />
          <q-btn flat label="Salvar" color="primary" @click="saveAsaasToken" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { DeletarPlano, ListarPlanos } from 'src/service/planos'
import { ListarTenants, AlterarTenantAsaasToken } from 'src/service/tenants'
import { MostrarCores } from 'src/service/empresas';
import ModalPlano from './ModalPlano'
export default {
  name: 'Planos',
  components: {
    ModalPlano
  },
  data () {
    return {
      isAsaasModalOpen: false,
      asaasToken: '',
      showToken: '',
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
      userProfile: 'user',
      planoEdicao: {},
      modalPlano: false,
      planos: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'value', label: 'Valor', field: 'value', align: 'left', format: val => ('R$ ' + val)  },
        { name: 'connections', label: 'Conexões', field: 'connections', align: 'center' },
        { name: 'users', label: 'Usuários', field: 'users', align: 'center' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarTenants () {
      const { data } = await ListarTenants()
      this.tenants = data
      this.showToken = this.tenants[0].asaasToken
      this.asaasToken = this.tenants[0].asaasToken
      console.log('this.tenants', this.tenants[0].asaasToken)
    },
    openAsaasModal() {
      this.isAsaasModalOpen = true;
    },
    closeAsaasModal() {
      this.isAsaasModalOpen = false;
    },
    async saveAsaasToken() {
      try {
        await AlterarTenantAsaasToken({ token: this.asaasToken });
        this.$q.notify({ type: 'positive', message: 'Token atualizado com sucesso!' });
        this.closeAsaasModal();
        this.listarTenants()
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Erro ao atualizar o token.' });
      }
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    async listarPlanos () {
      const { data } = await ListarPlanos()
      this.planos = data.plan
    },
    planoCriada (plano) {
      const newPlanos = [...this.planos]
      newPlanos.push(plano)
      this.planos = [...newPlanos]
    },
    planoEditada (plano) {
      const newPlanos = [...this.planos]
      const idx = newPlanos.findIndex(f => f.id === plano.id)
      if (idx > -1) {
        newPlanos[idx] = plano
      }
      this.planos = [...newPlanos]
    },
    editarPlano (plano) {
      this.planoEdicao = { ...plano }
      this.modalPlano = true
    },
    deletarPlano (plano) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Plano "${plano.id}"?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarPlano(plano)
          .then(res => {
            let newPlanos = [...this.planos]
            newPlanos = newPlanos.filter(f => f.id !== plano.id)

            this.planos = [...newPlanos]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Plano ${plano.id} deletada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    }

  },
  mounted () {
    this.listarTenants()
    this.listarPlanos()
    this.userProfile = localStorage.getItem('profile')
    this.loadColors()
  }
}
</script>

<style lang="scss" scoped>
</style>
