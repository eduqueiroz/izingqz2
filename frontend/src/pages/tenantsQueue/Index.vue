<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Filas de Tarefas"
      :data="filas"
      row-key="id"
      :columns="columns"
      :rows-per-page-options="[0]"
    >

      <template v-slot:top-right>
        <q-btn label="Atualizar Filas" color="primary" @click="listarFilas" style="margin-right: 10px;"/>
        <q-btn label="Abrir Bull Board" color="primary" @click="abrirBullBoard" style="margin-right: 10px;"/>
        <q-btn label="Reiniciar Backend" color="negative" @click="restart" style="margin-right: 10px;"/>
        <q-btn label="Reiniciar Filas" color="negative" @click="reiniciarFilas" style="margin-right: 10px;"/>
        <q-card-section v-if="!loading">
          <q-item-section>
            <div v-if="!loading">Filas atualizadas a cada 10 segundos</div>
            <div v-if="!loading" class="loading-bar">
            <div class="bar"></div>
            </div>
          </q-item-section>
        </q-card-section>
        <!-- <q-btn label="Reiniciar Processamento" color="warning" @click="reiniciarFilas" /> -->
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn 
          icon="mdi-refresh-circle" 
          flat
          round 
          @click="reprocessarFila(props.row.queueName)" />
        </q-td>
      </template>
    </q-table>
  </div>

</template>

<script>
import { ListarQueue, ReiniciarQueue, ReprocessarServico } from 'src/service/tenants'
import { Restart } from 'src/service/pm2'

export default {
  data() {
    return {
      loading: false,
      filas: [],
      columns: [
        { name: 'queueName', label: 'Nome da Fila', align: 'left', field: row => row.queueName, sortable: true },
        { name: 'failedCount', label: 'Jobs Falhados', align: 'center', field: row => row.failedCount, sortable: true },
        { name: 'activeCount', label: 'Jobs Ativos', align: 'center', field: row => row.activeCount, sortable: true },
        { name: 'waitingCount', label: 'Jobs Aguardando', align: 'center', field: row => row.waitingCount, sortable: true },
        { name: 'acoes', label: 'Reprocessar Fila', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async restart(){
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente o seu backend?',
        message: `Esse processo irá reiniciar todos os serviços, e só deve ser executado caso você tenha acesso ao Servidor, para corrigir possíveis incosistênicas.`,
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
      }).onOk(async () => {
        await Restart() 
      })
    },
    listarFilas() {
      this.loading = false
      ListarQueue().then(response => {
        this.filas = response.data;
      }).catch(error => {
        console.error(error);
      });
    },
    reiniciarFilas() {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente reiniciar as filas?',
        message: 'Execute apenas se houver filas com muitos serviços parados no BullBoard.<br><br>Esse processo irá reiniciar todas as filas do Bull, e deve ser executado no máximo 5x sem restartar o backend.<br><br>Após esse limite, você deve reiniciar o seu backend para limpar as conexões extras realizadas com o Redis.',
        html: true,
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
      }).onOk(async () => {
        ReiniciarQueue().then(() => {
        this.listarFilas();
      }).catch(error => {
        console.error(error);
      });
      })
    },
    reprocessarFila(queueName) {
      if (!queueName) {
        console.error('Nome da fila está indefinido');
        return;
      }
      ReprocessarServico(queueName).then(() => {
        this.listarFilas();
      }).catch(error => {
        console.error(error);
      });
    },
    abrirBullBoard() {
      this.$q.notify({
        html: true,
        message: `Usuário: admin<br>
        Senha: use a senha do seu Redis<br>
        Você será redirecionado em 3 segundos`,
        type: 'positive',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      setTimeout(() => {
        const url = process.env.URL_API + '/admin/queues/';
        window.open(url, '_blank');
      }, 3000);
    }
  },
  mounted() {
    this.listarFilas();
    setInterval(() => {
      this.loading = false
      this.listarFilas();
    }, 10000);
  }
}
</script>

<style lang="sass">
.loading-bar
  width: 100%
  height: 4px
  background-color: #ccc
  position: relative
  
  .bar
    width: 0
    height: 100%
    background-color: #007bff
    position: absolute
    top: 0
    left: 0
    animation: loadingAnimation 10s infinite
  
@keyframes loadingAnimation
  0%
    width: 0
  100%
    width: 100%
</style>

