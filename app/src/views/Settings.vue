<template>
  <div class="container is-widescreen has-padding-bottom">
    <section class="content column animated fadeIn">
      <h3 class="title gap-1">
        <span class="icon">
          <span class="mdi mdi-account-cog"></span>
        </span>
        <span>{{ 'settings' | t }}</span>
      </h3>
      <div class="columns is-marginless">
        <div class="column">
          <div class="board-container is-small">
            <div id="board" class="d-inline" :class="boardColor"></div>
          </div>
        </div>
        <div class="column">
          <form @submit.prevent="submit">
            <label class="label">{{ 'settings' | t }}</label>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label>{{ 'username' | t }}</label>
                  <input @input="checkUsername" type="text" v-model="data.code" class="input" maxlength="10" title="Ingresa tu nombre de usuario" required>
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label>{{ 'country' | t }}</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.flag" id="piezas" title="Elegí tu país">
                      <option v-for="(item, index) in flags" :key="index" :value="item.emoji">{{item.emoji}} {{item.name}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label>{{ 'name' | t }}</label>
                  <input @input="checkName" :title="$root.t('name_title')" type="text" v-model="data.name" class="input" maxlength="10">
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label>{{ 'surname' | t }}</label>
                  <input @input="checkName" :title="$root.t('surname_title')" type="text" v-model="data.surname" class="input" maxlength="10" required>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label>{{ 'language' | t }}</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.lang" id="piezas" title="Elegí tu país">
                      <option v-for="(item, index) in languages" :key="index" :value="item.code">{{item.name}}</option>
                    </select>
                  </div>
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label>{{ 'sound' | t }}</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.soundTheme" id="piezas" title="Elegí un sonido">
                      <option v-for="(item, index) in sounds" :key="index" :value="item">{{ item | t }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="field is-horizontal">
              <div class="field-body">
                <div class="field">
                  <label>{{ 'board_theme' | t }}</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.board" id="tablero" :title="'board_theme_desc' | t">
                      <option v-for="(item, index) in boards" :key="index" :value="item">{{ item | t }}</option>
                    </select>
                  </div>
                </div>
                <span></span>
              </div>
              <div class="field-body">
                <div class="field">
                  <label>{{ 'piece_theme' | t }}</label>
                  <div class="select is-fullwidth">
                    <select v-model="data.pieces" id="piezas" title="Elegí estilo de piezas">
                      <option v-for="(item, index) in pieces" :key="index" :value="item">{{ item | t }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <div class="field-group">
                <label class="label">{{ 'settings_general' | t }}</label>
                <div class="field-body">
                  <div class="control has-checkradio" title="Desactiva notificaciones sonoras">
                    <input v-model="data.sound" class="is-checkradio has-background-color is-white" id="sound" type="checkbox" @click="previewSound">
                    <label for="sound">{{ 'sound' | t }}</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" :title="'huge_notifications' | t ">
                    <input v-model="data.strongnotification" class="is-checkradio has-background-color is-white" id="strongnotification" type="checkbox" @click="previewStrongNotification">
                    <label for="strongnotification">{{ 'huge_notifications' | t }}</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" :title="'slowpieceanim' | t">
                    <input v-model="data.slowpieceanim" class="is-checkradio has-background-color is-white" id="slowpieceanim" type="checkbox" @click="previewslowpieceanim">
                    <label for="slowpieceanim">{{ 'slowpieceanim' | t }}</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="Activa visión nocturna">
                    <input v-model="data.darkmode" class="is-checkradio has-background-color is-white" id="darkmode" type="checkbox" @click="previewDarkmode">
                    <label for="darkmode">{{ 'dark_mode' | t }}</label>
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="No disponible para jugar en línea">
                    <input v-model="data.observe" class="is-checkradio has-background-color is-white" id="observe" type="checkbox">
                    <label for="observe">{{ 'observer_mode' | t }}</label>
                    <!--p class="notification is-warning">
                      <small>No disponible para jugar en línea</small>
                    </p-->
                  </div>
                </div>
                <div class="field-body">
                  <div class="control has-checkradio" title="Aceptar invitaciones de otros grupos">
                    <input v-model="data.autoaccept" class="is-checkradio has-background-color is-white" id="autoaccept" type="checkbox">
                    <label for="autoaccept">{{ 'accept_random' | t }}</label>
                    <!--p class="notification is-warning">
                      <small>Aceptar automáticamente todas las invitaciones para jugar</small>
                    </p-->
                  </div>
                </div>
              </div>
            </div>
            <div class="field has-text-centered">
              <div class="column">
                <button type="submit" class="button is-success" :class="{ 'is-loading' : $root.saving }">{{ 'update' | t }}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import Chess from 'chess.js'
import { mapState } from 'vuex'
import Chessboard from '.././assets/js/chessboard'
import Snackbar from '../components/Snackbar'
import PlaySound from '@/components/PlaySound'

export default {
  name: 'Settings',
  watch: {
    'data.pieces'  (val) {
      this.pieceColor = val
      this.drawBoard()
    },
    'data.board'  (val) {
      this.boardColor = val
      this.drawBoard()
    }
  },
  computed: {
    ...mapState([
      'player'
    ])
  },
  mounted () {
    this.data = this.player
    this.anchor.code = this.player.code
    this.anchor.lang = this.player.lang
    this.$root.saving = false
    if (this.player.moveSpeed === 500) {
      this.data.slowpieceanim = true
    }
    axios.get('/json/flags.json').then(flags => {
      this.flags = flags.data
      this.$root.loading = false
      setTimeout(() => {
        this.drawBoard()
        setTimeout(() => {
          this.previewslowpieceanim()
        }, 1000)
      }, 10)
    })
  },
  created () {
    window.addEventListener('resize', this.addWindowListeners)
  },
  destroyed () {
    window.removeEventListener('resize', this.addWindowListeners)
  },
  beforeDestroy () {
    const player = JSON.parse(localStorage.getItem('player'))
    const snackbar = document.querySelector('.ui-snackbar')
    if (snackbar) {
      if (player.strongnotification) {
        snackbar.classList.add('is-strong')
      } else {
        snackbar.classList.remove('is-strong')
      }
    }
  },
  methods: {
    checkUsername ({ type, target }) {
      if (target.value.match(/^[a-zA-Z0-9]+$/) === null) {
        Snackbar('error', this.$root.t('username_regex'))
        this.data.code = this.data.code.replace(/[\W_]+/g, ' ')
      }
    },
    checkName ({ type, target }) {
      if (target.value.match(/^[a-zA-Z0-9]+$/) === null) {
        Snackbar('error', this.$root.t('name_regex'))
        this.data.code = this.data.code.replace(/[\W_]+/g, ' ')
      }
    },
    addWindowListeners () {
      this.board.resize()
    },
    setSpeedMove () {
      if (!this.player.moveSpeed) {
        this.boardCfg.moveSpeed = this.player.moveSpeed
      }
      if (this.data.slowpieceanim) {
        this.boardCfg.moveSpeed = 500
      } else {
        this.boardCfg.moveSpeed = 250
      }
    },
    previewslowpieceanim () {
      setTimeout(() => {
        this.setSpeedMove()
        this.$store.dispatch('player', { moveSpeed: this.boardCfg.moveSpeed })
        this.board.start(false)
        this.game.move('e4')
        this.board.position(this.game.fen())
        if (document.querySelector('.square-e2')) {
          document.querySelector('.square-e2').classList.add('highlight-move')
        }
        if (document.querySelector('.square-e4')) {
          document.querySelector('.square-e4').classList.add('highlight-move')
        }
        PlaySound('move.mp3')
      }, 100)
    },
    previewSound () {
      setTimeout(() => {
        if (this.data.sound) {
          Snackbar('success', `🔊 ${this.$root.t('sound_on')}`)
        } else {
          Snackbar('default', `🔇 ${this.$root.t('sound_off')}`)
        }
      }, 100)
    },
    previewStrongNotification () {
      var snackbarBar = document.querySelector('.ui-snackbar')
      snackbarBar.classList.remove('ui-snackbar--is-active')
      snackbarBar.classList.add('ui-snackbar--is-inactive')
      setTimeout(() => {
        if (this.data.strongnotification) {
          snackbarBar.classList.add('is-strong')
          Snackbar('default', 'huge_notifications', 3000)
        } else {
          snackbarBar.classList.remove('is-strong')
          Snackbar('default', 'normal_notifications', 3000)
        }
      }, 100)
    },
    previewDarkmode () {
      setTimeout(() => {
        if (this.data.darkmode) {
          document.documentElement.classList.add('dark-mode')
        } else {
          document.documentElement.classList.remove('dark-mode')
        }
      }, 100)
    },
    drawBoard: function () {
      this.boardEl = document.getElementById('board')
      this.game = new Chess()

      if (this.data.pieces) {
        this.boardCfg.pieceTheme = '/img/chesspieces/' + this.data.pieces + '/{piece}.png'
        this.boardColor = this.data.board
        this.pieceColor = this.data.pieces
        this.$root.checkBoardStyle(this.data.pieces)
      }
      this.board = Chessboard('board', this.boardCfg)
      // console.log('clientHeight', document.getElementById('board').clientWidth + 'x' + document.getElementById('board').clientHeight)
      this.board.resize()
    },
    submit () {
      this.$root.saving = true
      this.$socket.emit('lobby_leave', { code: this.anchor.code })
      this.data.ref = this.anchor.code || 'desconocido'
      this.data.moveSpeed = this.boardCfg.moveSpeed
      this.$store
        .dispatch('player', this.data)
        .then(data => {
          let checkLang = res => {
            return new Promise((resolve, reject) => {
              if (this.anchor.lang !== res.lang) {
                axios.get(`/json/lang/${res.lang}.json`).then(json => {
                  this.$root.translations = json.data
                  this.$root.appKey++
                  moment.locale(res.lang)
                  resolve()
                })
              } else {
                resolve()
              }
            })
          }
          checkLang(data).then(() => {
            this.anchor.code = data.code
            this.$root.saving = false
            this.$socket.emit('settings', data)
            Snackbar('success', this.$root.t('settings_saved'))
          })
        }).catch(err => {
          console.log(`Algo malo sucedió ` + err)
        })
    }
  },
  data () {
    return {
      boardCfg: {
        position: 'start',
        pieceTheme: '/img/chesspieces/wood/{piece}.png',
        draggable: false
      },
      languages: [
        {
          name: 'English',
          code: 'en'
        },
        {
          name: 'Español',
          code: 'es'
        }
      ],
      sounds: [
        'samsung',
        'light'
      ],
      boards: [
        'classic',
        'bases',
        'bit',
        'blue',
        'bubblegum',
        'burled_wood',
        'dark_wood',
        'dash',
        'fantasy',
        'glass',
        'graffiti',
        'green',
        'green_plastic',
        'ocean',
        'lolz',
        'marble',
        'metal',
        'neon',
        'newspaper',
        'orange',
        'overlay',
        'parchment',
        'pink',
        'purple',
        'red',
        'sand',
        'sky',
        'stone',
        'tan',
        'tournament',
        'translucent',
        'turquoise',
        'walnut'
      ],
      pieces: [
        'cburnett',
        'alpha',
        'neo',
        'neo_wood',
        'wood',
        'bases',
        'chess24',
        'merida',
        'leipzig',
        'fantasy',
        'fritz',
        'book',
        'cases',
        'newspaper',
        'maya',
        'glass',
        'gothic',
        'light',
        'lolz',
        'tigers',
        'condal',
        'marble',
        'modern',
        'club',
        'neon',
        'magi',
        'staunton3d',
        'plastic3d',
        'wood3d',
        'chesskid3d',
        'magi3d'
      ],
      data: {},
      anchor: {},
      flags: [],
      nick: null,
      boardColor: null,
      boardEl: null,
      game: null,
      loading: false
    }
  }
}
</script>
