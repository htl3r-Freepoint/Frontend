import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'

import {FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText} from '@fortawesome/vue-fontawesome'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
Vue.component('font-awesome-layers-text', FontAwesomeLayersText)

import Axios from "axios";
import $ from 'jquery'

Vue.use(Vuex)

Vue.config.productionTip = false

Vue.prototype.$http = Axios
Vue.prototype.$ = $

const bsTooltip = (el, binding) => {
    const t = []

    if (binding.modifiers.focus) t.push('focus')
    if (binding.modifiers.hover) t.push('hover')
    if (binding.modifiers.click) t.push('click')
    if (!t.length) t.push('hover')

    $(el).tooltip({
        title: binding.value,
        placement: binding.arg || 'top',
        trigger: t.join(' '),
        html: !!binding.modifiers.html,
    });
}

Vue.directive('tooltip', {
    bind: bsTooltip,
    update: bsTooltip,
    unbind(el) {
        $(el).tooltip('dispose')
    }
});

const store = new Vuex.Store({
    state: {
        url: 'https://freepoint.htl3r.com/api',
        /*url: 'localhost:8000/api',*/
        user: {
            token: undefined,
            username: undefined,
            verified: undefined
        },
        company: {
            name: undefined,
            conversionRate: undefined,
            email: undefined,
            logo: undefined
        },
        subdomain: undefined,
        points: 0,
        design: {
            colorMain: "#10cdb7",
            colorText: "#2c3e50",
            colorBackground: "#FAFAFA",
            colorBanner: "#ffffff",
        }
    },
    mutations: {
        setVerfification(state, verified) {
            state.user.verified = verified
        },
        setUser(state, user) {
            state.user = user
        },
        deleteUser(state) {
            state.user = {
                token: undefined,
                username: undefined,
                verified: undefined
            }
        },
        increment(state) {
            state.points++
        },
        add(state, number) {
            state.points += number
        },
        setPoints(state, number) {
            state.points = number
        },
        setColorMain(state, color) {
            state.design.colorMain = color
        },
        setColorText(state, color) {
            state.design.colorText = color
        },
        setColorBackground(state, color) {
            state.design.colorBackground = color
        },
        setColorBanner(state, color) {
            state.design.colorBanner = color
        }
    }
})

router.beforeEach((to, from, next) => {

    if (store.state.user) {
        Axios.post(store.state.url + '/checkLogin', {
            hash: store.state.user.token
        }).then(response => {
            if (!response.data.valid) store.commit("deleteUser")
            else store.commit("setVerfification", response.data.verified)
        }).catch(error => {
            console.error(error)
            //TODO uncomment when server is fixed
            /*localStorage.removeItem('user')
            sessionStorage.removeItem('user')
            store.commit("deleteUser")*/
        })
    }

    let subdir = window.location.host.split('.')[0]
    let domainLocal = 'localhost:8080'
    let domain = "freepoint.at"
    if (subdir !== domainLocal && subdir !== domain) {
        Axios.post(store.state.url + "/getCompany", {
            companyName: subdir
        }).then(response => {
            store.state.company = response.data.company
            store.state.subdomain = subdir
        })
    }
    next()
})

new Vue({
    router: router,
    store: store,
    render: h => h(App)
}).$mount('#app')