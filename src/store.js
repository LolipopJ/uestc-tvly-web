import Vue from 'vue';
import Vuex from 'vuex';

import {now} from './time.js';

import config from '../config.json5';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    now: now(),
    channels: {
      Categories: [],
    },
    epg: {},
  },
  mutations: {
    updateNow(state) {
      state.now = now();
    },
    setChannels(state, channels) {
      state.channels = channels;
    },
    setEPG(state, epg) {
      state.epg = epg;
    },
  },
  actions: {
    fetchChannels(context) {
      window.fetch(config.channelsUrl, {
        mode: 'cors',
        credentials: 'include',
      }).then((response) => {
        if (response.status == 200) {
          return response.json();
        } else {
          console.warn('FATEL: failed to get channels!');
        }
      }).then((channels) => {
        context.commit('setChannels', channels);
      });
    },
    fetchEPG(context) {
      if (config.epgUrl && config.epgUrl.length) {
        window.fetch(config.epgUrl, {
          mode: 'cors',
          credentials: 'include',
        }).then((response) => {
          if (response.status == 200) {
            return response.json();
          } else {
            console.warn('FATEL: failed to get channels!');
          }
        }).then((epg) => {
          context.commit('setEPG', epg);
        });
      }
    },
  },
  getters: {
    defaultCategory(state) {
      if (state.channels.Categories.length > 0) {
        return state.channels.Categories[0];
      }
    },
    channelList(state) {
      return (categoryName) => {
        const category = state.channels.Categories.find(
          (c) => c['Name'] == categoryName
        );
        return category ? category.Channels : [];
      };
    },
    hasCategory(state) {
      return (categoryName) => {
        return state.channels.Categories.hasOwnProperty(categoryName);
      };
    },
  },
});

window.setInterval(() => {
  store.commit('updateNow');
}, 1000);

store.dispatch('fetchChannels');
store.dispatch('fetchEPG');