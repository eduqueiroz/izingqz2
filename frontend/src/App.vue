<template>
  <div id="q-app">
    <router-view />
    <!-- <Webphone /> -->
  </div>
</template>
<script>
// import Webphone from 'src/components/webphoneComponents/Webphone.vue'
export default {
  name: 'Z-PRO',
  components: { 
    // Webphone 
  },
  data () {
    return {
      IDLE_TIMEOUT: 7200,
      idleSecondsCounter: 0
    }
  },
  methods: {
    CheckIdleTime () {
      this.idleSecondsCounter++
      if (this.idleSecondsCounter >= this.IDLE_TIMEOUT) {
        window.location.reload();
      }
    },
    bindEventListeners() {
      document.onclick = () => {
        this.idleSecondsCounter = 0;
      };
      document.onmousemove = () => {
        this.idleSecondsCounter = 0;
      };
      document.onkeypress = () => {
        this.idleSecondsCounter = 0;
      };
    }
  },
  beforeMount () {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?.configs?.isDark) {
      this.$q.dark.set(usuario?.configs?.isDark)
    }
    this.bindEventListeners();
    setInterval(this.CheckIdleTime, 1000);
  }

}
</script>
