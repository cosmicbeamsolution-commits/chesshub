<template>
  <div class="is-listing-board" :class="boardColor">
    <article class="media">
      <div class="media-left">
        <router-link :to="getLink()">
          <figure class="board" ref="board" />
        </router-link>
      </div>
      <div class="media-content">
        <div class="content">
          <div v-if="dataItem.black">
            <span v-if="dataItem.black.flag">{{ dataItem.black.flag }}</span>
            <span v-else>{{ dataItem.blackflag }}</span>
            <span v-if="dataItem.black.code"> {{ dataItem.black.code }}</span>
            <span v-else> {{ dataItem.black }}</span>
            <!--span v-if="dataItem.black.elo" class="has-text-grey"> {{ dataItem.black.elo }}</span>
            <span v-else class="has-text-grey"> {{ dataItem.blackelo }}</span-->
            <span v-show="dataItem.result==='0-1'" class="mdi mdi-trophy is-size-7 has-text-warning"></span>
          </div>
          <div v-if="dataItem.white">
            <span v-if="dataItem.white.flag">{{ dataItem.white.flag }}</span>
            <span v-else>{{ dataItem.whiteflag }}</span>
            <span v-if="dataItem.white.code"> {{ dataItem.white.code }}</span>
            <span v-else> {{ dataItem.white }}</span>
            <!--span v-if="dataItem.white.elo" class="has-text-grey"> {{ dataItem.white.elo }}</span>
            <span v-else class="has-text-grey"> {{ dataItem.whiteelo }}</span-->
            <span v-show="dataItem.result==='1-0'" class="mdi mdi-trophy is-size-7 has-text-warning"></span>
          </div>
          <div v-if="dataItem.pgn">
            <span>{{ $root.countMoves(dataItem.pgn) }} plys</span>
          </div>
          <div>
            <span>{{ dataItem.eco | t }}</span>
          </div>
          <div v-if="dataItem.date.indexOf('Z') > -1">
            <span>{{ dataItem.date | humanReadableTime}}</span>
          </div>
          <div v-else>
            <span>{{ dataItem.date }}</span>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import Chess from 'chess.js'
import Chessboard from '.././assets/js/chessboard'
export default {
  name: 'GameList',
  props: {
    dataItem: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState([
      'player',
      'stockfishEvalTime'
    ])
  },
  data () {
    return {
      boardEl: null,
      game: {},
      board: {},
      boardColor: 'classic',
      boardCfg: {
        position: 'start',
        draggable: false,
        moveSpeed: 500,
        pieceTheme: '/img/chesspieces/wikipedia/{piece}.png'
      }
    }
  },
  methods: {
    getLink () {
      if (this.dataItem._id) {
        return `/game/${this.dataItem._id}`
      } else {
        return `/game/${this.dataItem.game}`
      }
    }
  },
  mounted () {
    const pref = JSON.parse(localStorage.getItem('player')) || {}
    this.boardEl = this.$refs.board
    this.game = new Chess()
    if (this.dataItem.fen) {
      this.boardCfg.position = this.dataItem.fen
    }
    this.boardCfg.pieceTheme = `/img/chesspieces/${pref.pieces}/{piece}.png`
    this.boardCfg.moveSpeed = this.player.moveSpeed
    this.boardColor = pref.board
    this.board = Chessboard(this.boardEl, this.boardCfg)
    if (this.boardEl && this.dataItem.from && this.dataItem.to) {
      this.boardEl.querySelector('.square-' + this.dataItem.from).classList.add('highlight-move')
      this.boardEl.querySelector('.square-' + this.dataItem.to).classList.add('highlight-move')
    }
  }
}
</script>
