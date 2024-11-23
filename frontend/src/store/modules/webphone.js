// import * as types from '../mutation-types';
import Wavoip from 'wavoip-api';
// import { useAlert } from 'dashboard/composables';
import { cloneDeep } from 'lodash'
import parsePhoneNumber from 'libphonenumber-js';

const findRecordById = ($state, id) =>
  $state.records.find(record => record.id === Number(id)) || {};

const defaultState = {
  records: [],
  uiFlags: {
    isOpen: true,
    isFetching: false,
    isFetchingItem: false,
    isUpdating: false,
    isCheckoutInProcess: false,
    isWebphoneVisible: false,
  },
  call: {
    id: null,
    duration: 0,
    tag: null,
    phone: null,
    picture_profile: null,
    status: null,
    direction: null,
    whatsapp_instance: null,
    active_start_date: null,
    chat_id: null,
    inbox_name: null,
  },
  wavoip: {},
};

export const getters = {
  getAccount: $state => id => {
    return findRecordById($state, id);
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  getCallInfo($state) {
    return $state.call;
  },
  getWavoip($state) {
    return $state.wavoip;
  },
};

export const actions = {
  toggleWebphoneVisibility: ({ commit }, isVisible) => {
    commit('SET_WEBPHONE_VISIBILITY', isVisible);
  },
  startWavoip: async ({ commit, state, dispatch }, { inboxName, token }) => {
    if (state.wavoip[token] && token) {
      return;
    }

    const WAV = new Wavoip();
    const whatsapp_instance = await WAV.connect(token);

    whatsapp_instance.socket.off('signaling');
    whatsapp_instance.socket.on('signaling', (...args) => {
      const data = args[0];

      if(state.call.inbox_name) {
        if(state.call.inbox_name !== inboxName) {
          return;
        }
      }

      dispatch('updateCallStatus', data?.tag);
      if (data?.tag === 'offer') {
        const name = data?.content?.from_tag;
        const whatsapp_id = data?.content?.phone;
        const phone =
          parsePhoneNumber(`+${whatsapp_id}`)?.formatInternational() ??
          whatsapp_id;
        const profile_picture = data?.content?.profile_picture;
        dispatch('incomingCall', {
          token: token,
          phone: phone,
          contact_name: name,
          profile_picture: profile_picture,
        });
      } else if (data?.tag === 'terminate') {
        setTimeout(() => {
          dispatch('resetCall');
        }, 3500);
      } else if (data?.tag === 'reject') {
        setTimeout(() => {
          dispatch('resetCall');
        }, 3500);
      } else if (data?.tag === 'accept_elsewhere') {
        setTimeout(() => {
          dispatch('resetCall');
        }, 3500);
      } else if (data?.tag === 'reject_elsewhere') {
        setTimeout(() => {
          dispatch('resetCall');
        }, 3500);
      }
    });

    commit('ADD_WAVOIP', {
      token: token,
      whatsapp_instance: whatsapp_instance,
      inboxName: inboxName,
    });

    whatsapp_instance.socket.on('connect', () => {});

    whatsapp_instance.socket.on('disconnect', () => {});
  },
  outcomingCall: async ({ commit, state, dispatch }, callInfo) => {
    let { phone, contact_name, chat_id, profile_picture } = callInfo;

    let instances = callInfo.instances ?? Object.keys(state.wavoip);
    let token = callInfo.token ?? instances[0];
    let wavoip = state.wavoip[token].whatsapp_instance;
    let inbox_name = state.wavoip[token].inbox_name;

    let offerResponse;

    let remainingInstances = instances.filter(instance => instance !== token);

    if (wavoip) {
      let timeout = setTimeout(() => {
        // useAlert(`[${inbox_name}] - timeout`);
        // this.$q.notify({
        //   type: 'warn',
        //   message: `[${inbox_name}] - timeout`,
        //   progress: true,
        //   actions: [{ icon: 'close', round: true, color: 'white' }],
        // });

        dispatch('outcomingCall', {
          ...callInfo,
          instances: remainingInstances,
          token: null,
        });
      }, 1000);

      offerResponse = await wavoip
        .callStart({
          whatsappid: phone,
        })
        .then(response => {
          let output;
          if (response.type === 'success') {
            let profile_picture = response?.result?.profile_picture;

            output = {
              profile_picture: profile_picture,
            };
          } else {
            output = {
              error: true,
              message: response?.result,
            };
          }

          return output;
        })
        .catch(response => {
          return {
            error: true,
            message: response?.result,
          };
        })
        .finally(() => {
          clearTimeout(timeout);
        });
    } else {
      offerResponse = {
        error: true,
      };
    }

    if (offerResponse.error) {
      if (offerResponse.message === 'Numero não existe') {
        throw new Error(offerResponse.message);
      } else if (offerResponse.message === 'Limite de ligações atingido') {
        // this.$q.notify({
        //   type: 'warn',
        //   message: `Limite de ligações diários atingido`,
        //   progress: true,
        //   actions: [{ icon: 'close', round: true, color: 'white' }],
        // });
        // useAlert('Limite de ligações diários atingido');
      }

      if (remainingInstances.length > 0) {
        dispatch('outcomingCall', {
          ...callInfo,
          instances: remainingInstances,
          token: null,
        });
      } else {
        // this.$q.notify({
        //   type: 'warn',
        //   message: `Linha ocupada, tente mais tarde ou faça um upgrade`,
        //   progress: true,
        //   actions: [{ icon: 'close', round: true, color: 'white' }],
        // });
        throw new Error('Linha ocupada, tente mais tarde ou faça um upgrade');
      }

      return;
    }

    commit('SET_WEBPHONE_CALL', {
      id: token,
      duration: 0,
      tag: contact_name,
      phone: phone,
      picture_profile: offerResponse?.profile_picture || profile_picture,
      status: 'outcoming_calling',
      direction: 'outcoming',
      whatsapp_instance: token,
      inbox_name: inbox_name,
      chat_id: chat_id,
    });

    commit('SET_WEBPHONE_UI_FLAG', {
      isOpen: true,
    });
  },
  incomingCall: async ({ commit, state, dispatch }, callInfo) => {
    try {
      if (state.call.id) {
        dispatch('rejectCall', callInfo.token);
        return;
      }


      let { phone, contact_name, profile_picture, token } = callInfo;

      let inbox_name = state.wavoip[token].inbox_name;

      commit('SET_WEBPHONE_CALL', {
        id: token,
        duration: 0,
        tag: contact_name,
        phone: phone,
        picture_profile: profile_picture,
        status: 'offer',
        direction: 'incoming',
        whatsapp_instance: token,
        inbox_name: inbox_name,
        chat_id: null,
      });

      commit('SET_WEBPHONE_UI_FLAG', {
        isOpen: true,
      });
    } catch (error) {
      throw new Error(error);
    }
  },
  updateCallStatus: ({ commit }, status) => {
    commit('SET_WEBPHONE_CALL', {
      status: status,
    });

    if (status === 'accept') {
      commit('SET_WEBPHONE_CALL', {
        active_start_date: new Date(),
      });
    }
  },
  acceptCall: async ({ state, dispatch }) => {
    try {
      const wavoip_token = state.call.whatsapp_instance;
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;

      await wavoip.acceptCall();

      dispatch('updateCallStatus', 'accept');
    } catch (error) {
      // Ignore error
    }
  },
  rejectCall: async ({ state, dispatch }, token) => {
    try {
      const wavoip_token = token ?? state.call.whatsapp_instance;
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;

      wavoip.rejectCall();
      dispatch('resetCall');
    } catch (error) {
      // Ignore error
    }
  },
  endCall: async ({ state }) => {
    try {
      const wavoip_token = state.call.whatsapp_instance;
      const wavoip = state.wavoip[wavoip_token].whatsapp_instance;

      await wavoip.endCall();
    } catch (error) {
      // Ignore error
    }
  },
  resetCall: async ({ commit }) => {
    commit('SET_WEBPHONE_CALL', {
      id: null,
      duration: 0,
      tag: null,
      phone: null,
      picture_profile: null,
      status: null,
      direction: null,
      whatsapp_instance: null,
      active_start_date: null,
      inbox_name: null,
      chat_id: null,
    });
  },
  updateWebphoneVisible: ({ commit }, { isOpen }) => {
    commit('SET_WEBPHONE_UI_FLAG', {
      isOpen: isOpen,
    });
  },
  openWebphone: ({ commit }) => {
    commit('SET_WEBPHONE_UI_FLAG', {
      isOpen: true,
    });
  },
};

export const mutations = {
  SET_WEBPHONE_VISIBILITY($state, isVisible) {
    $state.uiFlags.isWebphoneVisible = isVisible;
  },
  SET_WEBPHONE_UI_FLAG($state, data) {
    $state.uiFlags = {
      ...$state.uiFlags,
      ...data,
    };
  },
  ADD_WAVOIP($state, data) {
    const vdata=cloneDeep(data)
    $state.wavoip = {
      ...$state.wavoip  ,
      [vdata.token]: { inbox_name: vdata.inboxName, token: vdata.token, whatsapp_instance:vdata.whatsapp_instance },
    };
    // $state.wavoip = {
    //   ...$state.wavoip,
    //   [data.token]: {
    //     whatsapp_instance: data.whatsapp_instance,
    //     inbox_name: data.inboxName,
    //   },
    // };
  },
  SET_WEBPHONE_CALL($state, data) {
    $state.call = {
      ...$state.call,
      ...data,
    };
  },
};

export default {
  namespaced: true,
  state: defaultState,
  getters,
  actions,
  mutations,
};
