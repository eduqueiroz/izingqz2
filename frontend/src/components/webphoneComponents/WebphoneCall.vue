<template>
  <Draggable :initial-x="50" :initial-y="50" id="dragabletest" class="z-top">
    <div
      v-if="$store.state.webphone.uiFlags.isWebphoneVisible"
      :key="callInfo.id"
      id="WAVOIP_DRAGABLE"
      class="call-info-container modern-softphone bg-white shadow-lg rounded-lg select-none p-4"
    >
      <div class="modern-softphone">
        <!-- Display -->
        <div class="input-wrapper">
          <input type="text" v-model="display" readonly class="display-input" />
          <!-- <span class="clear-icon" @click="clearDisplay">{{ mdi-backspace}} </span> -->
          <q-btn
            flat
            dense
            icon="mdi-backspace"
            @click="clearDisplay"
            color="red-6"
            class="clear-button"
            >
            <q-tooltip content-class="bg-white text-black font-bold">Limpar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            icon="mdi-close-thick"
            @click="closeWebphone"
            color="red-6"
            class="close-button"
            >
            <q-tooltip content-class="bg-white text-black font-bold">Fechar</q-tooltip>
          </q-btn>
        </div>
        <!-- Keypad -->
        <div class="keypad mb-3">
          <button v-for="key in keys" :key="key" @click="appendToDisplay(key)" class="keypad-button">
            {{ key }}
          </button>
        </div>
      </div>

      <!-- Call Status -->
      <div class="flex flex-col text-center call-info mb-4">
        <p class="caller-status text-sm mt-1 text-gray-600 font-medium">
          {{ callStatusText }}
        </p>
      </div>

      <!-- Media Controls -->
      <div class="media-controls flex justify-around mb-4">
        <q-btn
          round
          unelevated
          icon="mdi-phone"
          class="accept-button"
          type="button"
          @click="outcomingCall()"
          color="green-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">Ligar</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-phone-hangup"
          class="reject-button"
          @click="endCall"
          color="red-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">Desligar</q-tooltip>
        </q-btn>
        <q-btn
          round
          unelevated
          icon="mdi-backspace"
          class="media-button mute-button"
          @click="backspace"
          color="blue-6"
          >
          <q-tooltip content-class="bg-white text-black font-bold">Limpar</q-tooltip>
        </q-btn>
        <q-btn 
          round
          unelevated
          :icon="isMuted ? 'mdi-microphone-off' : 'mdi-microphone'"
          class="media-button mute-button"
          @click="toggleMute"
          :color="isMuted ? 'red-6' : 'blue-6'"
          >
          <q-tooltip content-class="bg-white text-black font-bold">Mutar</q-tooltip>
        </q-btn>
      </div>
    </div>
  </Draggable>
</template>

<script>
import SoundCalling from 'assets/audio/calling.mp3';
import SoundRinging from 'assets/audio/ring.mp3';
import Draggable from './Draggable.vue';
import Microphone from './icons/Microphone.vue';
import MicrophoneSlash from './icons/MicrophoneSlash.vue';
import VideoIcon from './icons/Video.vue';
import PhoneSlash from './icons/PhoneSlash.vue';
import NumpadVue from './icons/Numpad.vue';
import PhoneTransfer from './icons/PhoneTransfer.vue';
import Phone from './icons/Phone.vue';
import { mapGetters } from 'vuex';
export default {
  components: {
    Draggable,
    // Thumbnail,
    Microphone,
    VideoIcon,
    MicrophoneSlash,
    // VideoSlash,
    Phone,
    PhoneSlash,
    NumpadVue,
    PhoneTransfer,
  },
  props: {},
  data() {
    return {
      display: '',
      keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'], 
      keyTeste:0,
      elapsedTime: 0,
      timer: null,
      isMuted: false,
      callingSound: null,
      ringSound: null,
      showDisplay: false
    };
  },
  computed: {
    callStatusText() {
      const statusMap = {
        accept: this.formattedDuration,
        accept_elsewhere: "Aceito por outro usuário",
        reject_elsewhere: "Rejeitado por outro usuário",
        terminate: "Finalizada",
        reject: "Rejeitada",
        outcoming_calling: "Ligando",
        preaccept: "Chamando",
        relaylatency: "Chamando",
      };
      return statusMap[this.callInfo.status] || "Desconhecido";
    },
    callStatusClass() {
      return this.callInfo.status === 'accept' ? 'status-accepted' : 'status-rejected';
    },
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
    }),
    username() {
      return this.callInfo.tag || this.callInfo.phone || '';
    },
    isCallEndDisabled() {
      return [
        'terminate',
        'reject',
        'accept_elsewhere',
        'reject_elsewhere',
      ].includes(this.callInfo.status);
    },
    formattedDuration() {
      const minutes = Math.floor(this.elapsedTime / 60);
      const seconds = this.elapsedTime % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
        2,
        '0'
      )}`;
    },
  },
  watch: {
    inboxes(newInboxes) {
      newInboxes.forEach(inbox => {
        if (inbox.wavoipToken) {
          this.startWavoip(inbox.name, inbox.wavoipToken);
        }
      });
    },
    callInfo(newCallInfo) {
      let instances = this.$store.state.webphone.wavoip;
      Object.keys(instances).forEach(token => {
        this.listernSockets(token, instances[token].whatsapp_instance);
      });
      const status = newCallInfo.status;
      this.keyTeste++
      if (status === 'accept') {
        this.startTimer();
      } else if (status === 'terminate') {
        this.stopTimer();
      }
      if (status === 'outcoming_calling') {
        this.playCalling();
      } else {
        this.stopCalling();
      }
      if (status === 'offer') {
        this.playRinging();
      } else {
        this.stopRinging();
      }
    },
    wavoip(newWavoip) {
      Object.keys(newWavoip).forEach(token => {
        this.listernSockets(token, newWavoip[token].whatsapp_instance);
      });
    },
  },
  mounted() {
    // this.$store.dispatch(
    //   'webphone/startWavoip',
    //   'b8018d84-dfed-45a0-9513-1877596ac8c6'
    // );
    // this.$store.dispatch(
    //   'webphone/startWavoip',
    //   'b0d3785b-2ef2-43e3-8d57-fbce592bfb3a'
    // );
  },
  methods: {
    outcomingCall() {
      // this.$store.dispatch('webphone/toggleWebphoneVisibility', false);
      this.showDisplay = true
      this.$store.dispatch('webphone/outcomingCall', {
        phone: this.display,
        contact_name: 'Ligação Direta',
        chat_id: 'ticketFocado.id',
      })
    },
    appendToDisplay(key) {
      this.display += key;
    },
    clearDisplay() {
      this.display = '';
    },
    backspace() {
      this.display = this.display.slice(0, -1);
    },
    toggleMute() {
      this.isMuted = !this.isMuted;
    },
    startWavoip(inboxName, token) {
      this.$store.dispatch('webphone/startWavoip', {
        token,
        inboxName,
      });
    },
    startTimer() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      const startDate = this.$store.state.webphone.call.active_start_date;
      this.timer = setInterval(() => {
        const now = new Date();
        this.elapsedTime = Math.floor((now - startDate) / 1000);
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
      this.elapsedTime = 0;
    },
    closeWebphone() {
      this.$store.dispatch('webphone/toggleWebphoneVisibility', false);
      this.$store.dispatch('webphone/updateWebphoneVisible', {
        isOpen: false,
      });
    },
    acceptCall() {
      this.$store.dispatch('webphone/acceptCall');
    },
    rejectCall() {
      this.$store.dispatch('webphone/rejectCall');
    },
    endCall() {
      this.$store.dispatch('webphone/endCall');
    },
    mute() {
      this.isMuted = true;
    },
    unMute() {
      this.isMuted = false;
    },
    listernSockets(token, whatsapp_instance) {
      // console.log(token, whatsapp_instance,whatsapp_instance.socket, "newWavoip")
      // if (!whatsapp_instance?.socket) return
      // whatsapp_instance.socket.off('signaling');
      // whatsapp_instance.socket.on('signaling', (...args) => {
      //   debugger
      //   console.log('..>..................................', args)
      //   const data = args[0];
      //   console.log(data,data?.tag, "webphone/updateCallStatus")

      //   this.$store.dispatch('webphone/updateCallStatus', data?.tag);
      //   if (data?.tag === 'offer') {
      //     const name = data?.content?.from_tag;
      //     const whatsapp_id = data?.content?.phone;
      //     const phone =
      //       parsePhoneNumber(`+${whatsapp_id}`)?.formatInternational() ??
      //       whatsapp_id;
      //     const profile_picture = data?.content?.profile_picture;
      //     this.$store.dispatch('webphone/incomingCall', {
      //       token: token,
      //       phone: phone,
      //       contact_name: name,
      //       profile_picture: profile_picture,
      //     });
      //   } else if (data?.tag === 'terminate') {
      //     setTimeout(() => {
      //       this.$store.dispatch('webphone/resetCall');
      //     }, 3500);
      //   } else if (data?.tag === 'reject') {
      //     setTimeout(() => {
      //       this.$store.dispatch('webphone/resetCall');
      //     }, 3500);
      //   } else if (data?.tag === 'accept_elsewhere') {
      //     setTimeout(() => {
      //       this.$store.dispatch('webphone/resetCall');
      //     }, 3500);
      //   } else if (data?.tag === 'reject_elsewhere') {
      //     setTimeout(() => {
      //       this.$store.dispatch('webphone/resetCall');
      //     }, 3500);
      //   }
      //   // setCallState(data?.tag)
      // });
    },
    playCalling() {
      this.callingSound = new Audio(SoundCalling);
      this.callingSound.loop = true;
      this.callingSound.play();
    },
    stopCalling() {
      if (this.callingSound) {
        this.callingSound.pause();
        this.callingSound.currentTime = 0;
      }
    },
    playRinging() {
      this.ringSound = new Audio(SoundRinging);
      this.ringSound.loop = true;
      this.ringSound.play();
    },
    stopRinging() {
      if (this.ringSound) {
        this.ringSound.pause();
        this.ringSound.currentTime = 0;
      }
    },
  },
};
</script>

<style scoped>
/* Modern Softphone Styles */
.modern-softphone {
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem; /* Padding for overall margin within container */
  border: 1px solid #e0e0e0; /* Light gray border */
}

/* Input Container */
.input-container {
  margin-bottom: 1rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  position: relative; /* Allows for positioning elements inside */
}

.display-input {
  flex: 1; /* Takes available space */
  padding: 12px;
  font-size: 1.2rem;
  border: 2px solid #ccc;
  border-radius: 8px; /* Rounded corners */
  text-align: left; /* Align text to left */
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  padding-right: 100px; /* Space for the "YY" text and "X" button */
  margin-bottom: 10px;
}

.clear-icon {
  position: absolute;
  right: 50px; /* Adjust based on button size */
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #ff5c5c;
  cursor: pointer; /* Make it clickable */
}

.clear-button{
  position: absolute;
  right: 50px; /* Align with the right edge of the input */
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  height: 36px; /* Consistent height with input */
}

.close-button {
  position: absolute;
  right: 8px; /* Align with the right edge of the input */
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  height: 36px; /* Consistent height with input */
}

/* Keypad */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.keypad-button {
  background-color: #f0f0f0;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 15px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.keypad-button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

/* Media Controls */
.media-controls {
  display: flex;
  justify-content: space-around;
}

.media-button {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease;
}

.call-button:hover {
  background-color: #4caf50;
}

.end-call-button:hover {
  background-color: #e53935;
}

.backspace-button:hover {
  background-color: #f39c12;
}

.mute-button:hover {
  background-color: #007bff;
}

/* Caller Status */
.caller-status {
  font-size: 1rem;
  color: #444;
  font-weight: bold;
}

/* Accept and Reject Buttons */
.accept-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #22c55e;
  color: white;
  margin-right: 5px;
}

.reject-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #e53935;
  color: white;
}

</style>