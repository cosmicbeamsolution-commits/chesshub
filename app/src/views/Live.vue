<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn">
      <h3>
        <span class="icon">
          <span class="mdi mdi-fire"></span>
        </span>
        <span>{{ 'live' | t }}</span>
      </h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <label class="label"><span v-html="eco.name" class="has-text-grey"></span></label>
          <div class="control">
            <input ref="input" @keyup="inputTrigger" v-model="pager.query" class="input is-success" type="text" :placeholder="'live_input_placeholder' | t">
          </div>
          <div class="control">
            <button v-show="pager.query.length" type="button" @click="clear" class="button is-danger">
              <span class="icon">
                <span v-if="!loading" class="mdi mdi-close"></span>
                <span v-else class="mdi mdi-timer"></span>
              </span>
            </button>
            <button v-show="!pager.query.length" type="submit" id="searchbtn" class="button is-success">
              <span class="icon has-margin">
                <span class="mdi mdi-magnify"></span>
              </span>
            </button>
          </div>
        </div>
      </form>
      <div v-show="message">
        <h3>{{
          $root.t(
            'warning'
          )
        }}</h3>
        <p>{{
          $root.t(
            'group-no-results', {
              q: (
                this.$root.t('live') +
                (this.$route.params.query ? `:${this.$route.params.query}` : '')
              )
            }
          )
        }}</p>
      </div>
      <div v-if="Object.keys(data).length" class="has-text-left">
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
import Snackbar from '../components/Snackbar'
import TablePager from '@/components/TablePager'
import GameList from '@/components/GameList'
export default {
  name: 'Live',
  components: {
    TablePager,
    GameList
  },
  watch: {
    '$route' () {
      this.triggerSearch()
    }
  },
  mounted () {
    this.triggerSearch()
  },
  methods: {
    inputTrigger () {
      this.loading = true
      if (this.interval) clearInterval(this.interval)
      this.interval = setTimeout(() => {
        this.$router.push({
          name: 'Live',
          params: {
            query: this.pager.query
          }
        })
      }, 1000)
    },
    clear () {
      this.pager.query = ''
      this.submit()
    },
    triggerSearch () {
      if (this.$route.params.query) {
        this.pager.query = this.$route.params.query
      }
      if (this.$route.query.offset) {
        this.offset = parseInt(this.$route.query.offset)
      }
      this.$nextTick(() => this.$refs.input.focus())
      this.search()
    },
    search () {
      axios.post('/online', this.pager).then((res) => {
        this.data = res.data
        let t = this.$root.t
        var pages = []
        if (res.data.error) {
          if (res.data.error === 'not_enough_params') {
            Snackbar('info', 'Ingresá una palabra clave para ver partidas. Podés buscar por evento, lugar, jugador o PGN.', 15000)
          }
        } else {
          if (res.data.count === 0) {
            this.message = 'No hay partidas en vivo'
            // Snackbar('warning', 'No hay partidas en vivo', 5000)
          } else {
            var numPages = Math.ceil(res.data.count / this.pager.limit)
            for (var i = 0; i < numPages; i++) {
              pages[i] = i * this.pager.limit
            }
            Snackbar('success', [
              t('results-found'),
              this.data.count,
              this.data.count > 1 ? t('games') : t('game'),
              t('showing-results'),
              this.pager.offset + 1,
              t('to'),
              this.pager.offset + (this.pager.limit > this.data.count ? this.data.count : this.pager.offset) + this.pager.limit
            ].join(' '), 5000)
          }
        }

        let max = 20

        if (pages.length > max) {
          pages.splice(max / 2, pages.length - max)
        }

        this.pager.pages = pages
        this.$root.loading = false
      })
    },
    submit () {
      this.$router.push({
        name: 'Live',
        params: {
          query: this.pager.query.trim()
        }
      })
    }
  },
  data () {
    return {
      loading: false,
      data: {},
      eco: {},
      message: '',
      pager: {
        pages: {},
        query: '',
        limit: 12,
        offset: 0
      }
    }
  }
}
</script>
