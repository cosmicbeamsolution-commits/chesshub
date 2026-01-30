<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn w-100">
      <h3>
        <span class="icon has-margin">
          <span class="mdi mdi-book-search"></span>
        </span>
        <span>{{ 'search' | t }}</span>
      </h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <div class="control">
            <input ref="input" @keyup="inputTrigger" v-model="pager.query" class="input" type="text" placeholder="Evento, lugar, fecha, jugador o PGN" autofocus>
          </div>
          <div class="control">
            <button v-if="pager.query" type="button" @click="clear" class="button is-danger">
              <span class="icon has-margin">
                <span v-if="!searching" class="mdi mdi-close"></span>
                <span v-else class="mdi mdi-timer"></span>
              </span>
            </button>
            <button v-else type="submit" id="searchbtn" class="button is-success">
              <span class="icon has-margin">
                <span class="mdi mdi-magnify"></span>
              </span>
            </button>
          </div>
        </div>
      </form>
      <div v-show="message" class="column w-100">
        <h3>{{
          $root.t(
            'warning'
          )
        }}</h3>
        <p>{{
          $root.t(
            'group-no-results', {
              q: (
                this.$root.t('search') +
                (this.$route.params.query ? `:${this.$route.params.query}` : '')
              )
            }
          )
        }}</p>
      </div>
      <div v-if="data.count" class="has-text-left">
        <div class="columns is-multiline">
          <div class="column is-12-mobile is-6-tablet is-4-desktop is-3-fullhd" v-for="(item, index) in data.games" :key="index">
            <game-list :data-item="item"/>
          </div>
        </div>
      </div>
    </div>
    <table-pager :dataSet="pager"/>
  </div>
</template>

<script>

import axios from 'axios'
// import Snackbar from '../components/Snackbar'
import TablePager from '@/components/TablePager'
import GameList from '@/components/GameList'
export default {
  name: 'Search',
  watch: {
    '$route' () {
      this.triggerSearch()
    }
  },
  components: {
    TablePager,
    GameList
  },
  mounted () {
    this.pager.query = this.$route.params.query || ''
    this.triggerSearch()
  },
  methods: {
    inputTrigger () {
      this.searching = true
      if (this.interval) clearInterval(this.interval)
      this.interval = setTimeout(() => {
        this.$router.push({
          name: 'Search',
          params: {
            query: this.pager.query
          }
        })
      }, 1500)
    },
    clear () {
      this.pager.query = ''
      this.submit()
    },
    triggerSearch () {
      if (this.$route.query.offset) {
        this.pager.offset = parseInt(this.$route.query.offset)
      }
      // this.$nextTick(() => this.$refs.input.focus())
      this.search()
    },
    search () {
      let req = this.pager
      req.strict = this.$route.query.strict
      axios.post('/search', req).then((res) => {
        this.data = res.data
        let t = this.$root.t
        var pages = []
        if (res.data.error) {
          this.message = this.$root.t('no-results')
          if (res.data.error === 'not_enough_params') {
            this.message = this.$root.t('results-toast')
          }
        } else {
          if (res.data.count === 0) {
            this.message = this.$root.t('results-nomatch')
          } else {
            var numPages = Math.ceil(res.data.count / this.pager.limit)
            for (var i = 0; i < numPages; i++) {
              pages[i] = i * this.pager.limit
            }
            this.message = t('results-found') + this.data.count + ' ' + (this.data.count > 1 ? t('games') : t('game')) + '. ' + t('showing-results') + (this.pager.offset + 1) + ' ' + t('to') + ' ' + (this.pager.offset + this.pager.limit > this.data.count ? this.data.count : this.pager.offset + this.pager.limit)
          }
        }

        let max = 20

        if (pages.length > max) {
          pages.splice(max / 2, pages.length - max)
        }

        this.pager.pages = pages
        this.$root.loading = false
        this.searching = false
      })
    },
    submit () {
      this.$router.push('/search?q=' + this.pager.query.trim()).catch(() => {})
    }
  },
  data () {
    return {
      data: {
        count: 0,
        games: []
      },
      pager: {
        pages: {},
        query: '',
        limit: 12,
        offset: 0
      },
      message: '',
      searching: false,
      msg: 'Search'
    }
  }
}
</script>
