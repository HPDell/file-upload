import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import './assets/css/icon.css';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';

Vue.config.productionTip = false
Vue.use(ElementUI);

Vue.prototype.$axios = axios;

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')