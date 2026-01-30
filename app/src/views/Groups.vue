<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn">
      <h3 class="title gap-1">
        <span class="icon has-margin">
          <span class="mdi mdi-layers"></span>
        </span>
        <span>Grupos</span>
      </h3>
      <form @submit.prevent="submit">
        <div class="field has-addons">
          <div class="control">
            <input ref="input" @keyup="inputTrigger" v-model="query" class="input is-success" type="text" :placeholder="'name' | t">
          </div>
          <div class="control">
            <button v-show="query.length" type="button" @click="clear" class="button is-danger">
              <span class="icon has-margin">
                <span v-if="!loading" class="mdi mdi-close"></span>
                <span v-else class="mdi mdi-timer"></span>
              </span>
            </button>
            <button v-show="!query.length" type="submit" id="searchbtn" class="button is-success">
              <span class="icon has-margin">
                <span class="mdi mdi-magnify"></span>
              </span>
            </button>
          </div>
        </div>
      </form>
      <div v-show="message" class="column">
        <h3>{{
          $root.t(
            'warning'
          )
        }}</h3>
        <p>{{
          $root.t(
            'group-no-results', {
              q: (
                this.$root.t('groups') +
                (this.$route.params.query ? `:${this.$route.params.query}` : '')
              )
            }
          )
        }}</p>
      </div>
      <div v-if="data.count" class="has-text-left">
        <table class="table">
          <thead>
            <th></th>
            <th>Nombre</th>
            <th>Rondas</th>
            <th>Minutos</th>
            <th>Compensación</th>
          </thead>
          <tbody>
            <tr v-for="(item, index) in data.data" :key="index">
              <td>
                <router-link :to="'/group/'+item._id">
                  <span class="icon has-margin">
                    <span class="mdi mdi-layers"></span>
                  </span>
                </router-link>
              </td>
              <td>
                <span v-html="item.code"></span>
              </td>
              <td>
                <span v-html="item.games"></span>
              </td>
              <td>
                <span v-html="item.minutes"></span>'
              </td>
              <td>
                +<span v-html="item.compensation"></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <nav class="pagination is-centered" role="navigation" aria-label="pagination">
      <!--a class="pagination-previous">Previous</a>
      <a class="pagination-next">Next page</a-->
      <ul class="pagination-list">
        <li v-for="(page, index) in pages" :key="index">
          <router-link :to="'?q=' + query + '&offset=' + page" class="pagination-link" :class="{'is-current': offset == page}" :title="'Ir a página ' + parseInt(page / limit + 1)"></router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from 'axios'
import Snackbar from '../components/Snackbar'
export default {
  name: 'Groups',
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
          name: 'Groups',
          params: {
            query: this.query
          }
        })
      }, 1000)
    },
    clear () {
      this.query = ''
      this.submit()
    },
    triggerSearch () {
      if (this.$route.params.query) {
        this.query = this.$route.params.query
      }
      if (this.$route.query.offset) {
        this.offset = parseInt(this.$route.query.offset)
      }
      this.$nextTick(() => this.$refs.input.focus())
      this.search()
    },
    search () {
      const query = this.query.trim() || ''
      // this.$root.t('group-no-results', { q: query })
      axios.post('/groups', {
        query: query,
        offset: this.offset,
        limit: this.limit
      }).then((res) => {
        this.data = res.data
        var pages = []
        if (res.data.error) {
          if (res.data.error === 'not_enough_params') {
            Snackbar('info', 'Ingresá una palabra clave para ver grupos.', 15000)
          }
        } else {
          if (res.data.count === 0) {
            this.message = this.$root.t(
              'group-no-results', {
                q: query
              }
            )
            // Snackbar('warning', this.$root.t('group-no-results', { q: query }), 5000)
          } else {
            var numPages = Math.ceil(res.data.count / this.limit)
            for (var i = 0; i < numPages; i++) {
              pages[i] = i * this.limit
            }
          }
        }

        let max = 20

        if (pages.length > max) {
          pages.splice(max / 2, pages.length - max)
        }

        this.pages = pages
        this.$root.loading = false
        this.loading = false
      })
    },
    submit () {
      this.$router.push({
        name: 'Groups'
      })
    }
  },
  data () {
    return {
      loading: true,
      data: {},
      pages: {},
      query: '',
      message: '',
      limit: 10,
      offset: 0
    }
  }
}
</script>
