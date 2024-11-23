<template>
    <div class="container">
    <div class="login-section fixed-layout">
      <q-layout class="vertical-center full-width">
        <q-page-container>
          <q-page class="flex justify-center items-center">
            <q-ajax-bar position="top" color="primary" size="5px" />
            <div class="login-content">
              <q-img
                src="/zpro.png"
                spinner-color="white"
                class="logo-image q-mb-lg q-px-md no-cover"
                style="max-width: 120%"
              />
              <q-separator spaced />
              <div class="text-primary">
                <div class="text-h6">Crie sua conta!</div>
                <div>
                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.name"
                    label="Nome"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                    >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-account-check-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.cpfCnpj"
                    label="CPF/CNPJ"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                    >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-card-account-details-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.email"
                    label="E-mail"
                    type="email"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                    >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-email-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.mobilePhone"
                    label="Celular"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                    mask="(##) #####-####"
                    fill-mask
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-cellphone-basic"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-input>

                  <q-input
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.password"
                    label="Senha"
                    :type="isPwd ? 'password' : 'text'"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-shield-key-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </q-input>

                  <q-select
                    :color="$q.dark.isActive ? 'white' : ''"
                    :input-style="{ color: 'black' }"
                    v-model="formData.selectedPlan"
                    :options="planos"
                    option-value="id"
                    :option-label="formatPlanLabel"
                    label="Selecione um Plano"
                    outlined
                    clearable
                    class="q-mb-md"
                    required
                  >
                    <template v-slot:prepend>
                      <q-icon
                        name="mdi-bank-outline"
                        class="cursor-pointer"
                        color='primary'
                      />
                    </template>
                  </q-select>

                </div>
                <q-btn
                  class="q-mr-sm q-my-lg"
                  color="primary"
                  @click="onSubmit"
                  style="width: 150px"
                  :loading="loading"
                >
                  Criar Conta
                  <span slot="loading">
                    <q-spinner-puff class="on-left" />Criando...
                  </span>
                </q-btn>
                <q-btn  
                  @click="onCancel"
                  color="negative"
                >
                  Login
                </q-btn>
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </div>
    <div class="video-container">
      <video
        autoplay
        muted
        loop
        style="width: 100%; height: auto; object-fit: cover; "
      >
        <source src="../assets/110694.mp4" type="video/mp4" />
      </video>
    </div>
  </div>
</template>

<script>
import { criarCliente } from 'src/service/asaas';
import { ListarPlanos } from 'src/service/planos'
import { MostrarCoresPublicas } from 'src/service/empresas';

export default {
  data() {
    return {
      planos: [],
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
      isPwd: true,
      formData: {
        name: '',
        cpfCnpj: '',
        email: '',
        mobilePhone: '',
        password: '',
        selectedPlan: null
      },
      loading: false,
      notify: {
        visible: false,
        message: '',
        type: 'negative'
      }
    };
  },
  methods: {
    validarCpfCnpj(cpfCnpj) {
      cpfCnpj = cpfCnpj.replace(/[^\d]+/g, '');

      // Validação de CPF
      if (cpfCnpj.length === 11) {
        let soma = 0;
        let resto;

        if (/^(\d)\1+$/.test(cpfCnpj)) return false;

        for (let i = 1; i <= 9; i++) soma += parseInt(cpfCnpj.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;

        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfCnpj.substring(9, 10))) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpfCnpj.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;

        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpfCnpj.substring(10, 11))) return false;

        return true;
      }

      // Validação de CNPJ
      if (cpfCnpj.length === 14) {
        let tamanho = cpfCnpj.length - 2;
        let numeros = cpfCnpj.substring(0, tamanho);
        let digitos = cpfCnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
          soma += numeros.charAt(tamanho - i) * pos--;
          if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho = tamanho + 1;
        numeros = cpfCnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
          soma += numeros.charAt(tamanho - i) * pos--;
          if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(1))) return false;

        return true;
      }

      return false;
    },
    validarEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    validarSenha(senha) {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:,.?/|~])[A-Za-z\d!@#$%^&*()_\-+=\[\]{};:,.?/|~]{7,}$/;
      return regex.test(senha);
    },
    formatPlanLabel(plan) {
      return `Valor: R$${plan.value} | Conexões: ${plan.connections} | Usuários: ${plan.users}`;
    },
    async loadColors() {
      try {
        const response = await MostrarCoresPublicas();
        if (response.status === 200) {
          const colorsArray = response.data;

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];
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
    async onSubmit() {
      this.loading = true;
      if(!this.formData.name
        || !this.formData.cpfCnpj
        || !this.formData.email
        || !this.formData.mobilePhone
        || !this.formData.selectedPlan
      ){
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Preencha todos os campos!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.loading = false;
        return;
      }
      if (!this.validarCpfCnpj(this.formData.cpfCnpj)) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'CPF ou CNPJ inválido.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.loading = false;
        return;
      }
      if (!this.validarEmail(this.formData.email)) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'E-mail inválido.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.loading = false;
        return;
      }
      if (!this.validarSenha(this.formData.password)) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Senha deve ter no mínimo 7 caracteres, incluindo letras, números e um caractere especial! Caracteres não permitidos: Aspas Simples, Aspas Duplas, Barra Invertida, Backticks, Menor e Maior',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.loading = false;
        return;
      }
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 30);
      const nextDueDate = currentDate.toISOString().split('T')[0];
      const payload = {
        name: this.formData.name,
        cpfCnpj: this.formData.cpfCnpj,
        email: this.formData.email,
        mobilePhone: this.formData.mobilePhone.replace(/[^\d]/g, ''),
        password: this.formData.password,
        maxUsers: this.formData.selectedPlan.users,
        maxConnections: this.formData.selectedPlan.connections,
        status: "active",
        userName: this.formData.name,
        billingType: "BOLETO",
        value: this.formData.selectedPlan.value,
        nextDueDate: nextDueDate,
        cycle: "MONTHLY"
      };
      try {
        const response = await criarCliente(payload);
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Cliente criado com sucesso.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.$router.push('/login');
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Erro ao criar cliente ' + error.message,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } finally {
        this.loading = false;
      }
    },
    onCancel() {
      this.$router.push('/'); // Redireciona para a página inicial ou login
    }
  },
  mounted () {
    this.listarPlanos()
    this.userProfile = localStorage.getItem('profile')
    this.loadColors()
  }
};
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
}

.login-section {
  width: 45%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: white;
}

.full-width {
  width: 100%;
}

.no-cover .q-img__image {
  background-size: contain !important;
}

.login-content {
  width: 350px;
  max-width: 350px;
  text-align: center;
}

.video-container {
  display: flex;
  justify-content: flex-end;
  width: 55%;
}

.logo-image {
  height: auto;
  max-width: 100%;
}

.fixed-layout {
  width: 45%;
}

@media (max-width: 600px) {
  .video-container {
    display: none;
  }
  .login-section {
    width: 100%;
  }
}
</style>