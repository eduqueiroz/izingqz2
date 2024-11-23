<template>
  <div v-if="userProfile === 'admin'">
    <q-list class="text-weight-medium">

      <q-item tag="label" v-ripple @click="abrirLink">
        <q-item-section>
          <q-item-label>Crie uma conta em hub.notificame.com.br e gere o seu token</q-item-label>
          <q-item-label caption> {{ montarUrlIntegração() }} </q-item-label>
        </q-item-section>
          <q-tooltip content-class="bg-negative text-bold">
            HUB Notificame (Beta)
          </q-tooltip>
      </q-item>

      <div class="row q-px-md">
        <div class="col-12" style="margin-top: 20px;">
          <q-input
            class="blur-effect"
            v-model="hubToken"
            type="textarea"
            autogrow
            dense
            outlined
            label="Seu Token Notificame"
            input-style="min-height: 6vh; max-height: 9vh;"
            debounce="700"
            @input="alterarHubToken()"
          />
        </div>
      </div>

    </q-list>
  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { ListarTenantPorId, AlterarTenantHubToken } from 'src/service/tenants'
import { defineComponent } from 'vue'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default defineComponent({
  name: 'IndexConfiguracoes',
  data() {
    return {
      usuario,
      hubToken: '',
      webhookChecked: '',
      loading: false,
      userProfile: 'user'
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `https://hub.notificame.com.br/signup/registrar?from=@ComunidadeZDG`
    }
  },
  methods: {
    abrirLink() {
      window.open('https://hub.notificame.com.br/signup/registrar?from=@ComunidadeZDG', '_blank');
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
    async alterarHubToken(){
      try {
        await AlterarTenantHubToken({
          id: this.usuario.tenantId,
          hubToken: this.hubToken,
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
      this.hubToken = data[0].hubToken
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
