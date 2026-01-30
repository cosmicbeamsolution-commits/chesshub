import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import axios from 'axios'
import $ from 'jquery'
import Landing from '@/views/Landing'
import Search from '@/views/Search'
import Play from '@/views/Play'
import Live from '@/views/Live'
import Dash from '@/views/Dash'
import Chat from '@/views/Chat'
import Settings from '@/views/Settings'
import Stockfish from '@/views/Stockfish'
import Exhibit from '@/views/Exhibit'
import Openings from '@/views/Openings'
import Opening from '@/views/Opening'
import Game from '@/views/Game'
import Group from '@/views/Group'
import Groups from '@/views/Groups'
import Watch from '@/views/Watch'
import Register from '@/views/Register'
import Login from '@/views/Login'
import RegisterSuccess from '@/views/RegisterSuccess'
import ForgotPass from '@/views/ForgotPass'
import Validate from '@/views/Validate'
import NotFound from '@/views/NotFound'

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

window.jQuery = $
window.$ = $

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'Landing', component: Landing },
    { path: '/search/:query?', name: 'Search', component: Search },
    { path: '/openings', name: 'Openings', component: Openings },
    { path: '/opening/:name', name: 'Opening', component: Opening },
    { path: '/live/:query?', name: 'Live', component: Live },
    { path: '/dash', name: 'Dash', component: Dash },
    { path: '/game/:game', name: 'Game', component: Game },
    { path: '/play/:game/:id?', name: 'Play', component: Play },
    { path: '/watch/:game', name: 'Watch', component: Watch },
    { path: '/chat/:chat', name: 'Chat', component: Chat },
    { path: '/groups/:query?', name: 'Groups', component: Groups },
    { path: '/group/:group', name: 'Group', component: Group },
    { path: '/settings', name: 'Settings', component: Settings },
    { path: '/stockfish', name: 'Stockfish', component: Stockfish },
    { path: '/exhibit', name: 'Exhibit', component: Exhibit },
    { path: '/register', name: 'Register', component: Register },
    { path: '/register-success', name: 'RegisterSuccess', component: RegisterSuccess },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPass },
    { path: '/validate/:code', name: 'Validate', component: Validate },
    { path: '/login', name: 'Login', component: Login },
    { path: '*', name: 'NotFound', component: NotFound }
  ]
})

router.beforeEach(async (to, from, next) => {
  await Vue.nextTick()
  router.app.loading = true

  if (!Object.keys(store.state.player).length) {
    store
      .dispatch('player')
      .then(res => {
        axios.get(`/json/lang/${res.lang}.json`).then(json => {
          router.app.translations = json.data
          // console.log('🙌 Player identification successfully performed')
          // router.app.$socket.emit('Settings', res)
          next()
        })
      }).catch(err => {
        console.log(`Error: Languages not found. ` + err)
      })
  } else {
    next()
  }
})

router.afterEach(() => {
  if (document.querySelector('.menu')) {
    document.querySelector('.menu').classList.remove('fs')
    document.querySelector('.menu-burger').classList.remove('cross')
  }
  if (store.getters.menuState) {
    store.commit('togglemenu')
  }
})

export default router
