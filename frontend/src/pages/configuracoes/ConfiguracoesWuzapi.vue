<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>Instale sua API MEOW de forma gratuita</q-item-label>
          <q-item-label caption> {{ montarUrlIntegração() }} </q-item-label>
        </q-item-section>
          <q-tooltip content-class="bg-negative text-bold">
            API Meow (Wuzapi) (Beta)
          </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="wuzapiHost"
            type="textarea"
            autogrow
            dense
            outlined
            label="URL da API"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarWuzapiHost()"
          />
        </div>
      </div>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, AlterarTenantWuzapiHost } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      wuzapiHost: '',
      loading: false,
      userProfile: 'user'
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `https://github.com/pedroherpeto/wuzapi`
    }
  },
  methods: {
    abrirLink() {
      window.open('https://github.com/pedroherpeto/wuzapi', '_blank');
    },
    formatarDataBrasil(data) {
      const dataObjeto = new Date(data);
      return format(dataObjeto, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    },
    montarUrlIntegração() {
      return `${this.cBaseUrlIntegração}`
    },
    formatarData(data) {
      const dataFormatada = new Date(data);
      return dataFormatada.toLocaleDateString('pt-BR');
    },
    async alterarWuzapiHost(){
      try {
        await AlterarTenantWuzapiHost({
          id: this.usuario.tenantId,
          wuzapiHost: this.wuzapiHost,
        })
        this.$q.notify({
          type: 'positive',
          message: 'Configuração alterada!',
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro('Ocorreu um erro!', error)
      } 
    },
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.wuzapiHost = data[0].wuzapiHost
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
  },
})
</script>

<style lang="sass">
.blur-effect 
  filter: blur(0px)
</style>
