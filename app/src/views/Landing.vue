<template>
  <div class="landing container is-widescreen">
    <div class="content column fadeIn w-100">
      <section class="hero fadeIn delay slow">
        <div class="container is-flex-centered flex-column gap-1">
          <form id="search" class="has-text-centered animated" @submit.prevent="submit">
            <div class="field has-addons is-flex-centered marginless">
              <div class="control">
                <input v-model="query" class="input" name="query" type="text" :placeholder="'search-in-groups' | t" autofocus>
              </div>
              <div class="control">
                <button type="submit" id="searchbtn" class="button is-success">
                  <span class="icon has-text-white">
                    <span class="mdi mdi-layers-search"></span>
                  </span>
                </button>
              </div>
            </div>
          </form>
          <div class="is-flex-centered gap-1">
            <a @click="$root.play" class="button is-medium is-info" :title="[
              $root.t('play-against'),
              $root.t('human')
            ].join(' ')">
              <span class="icon">
                <span class="fa fa-handshake is-size-5"></span>
              </span>
            </a>
            <router-link class="button is-medium is-success" to="/stockfish" :title="[
              $root.t('play-against'),
              $root.t('stockfish')
            ].join(' ')">
              <span class="icon">
                <span class="fa fa-server is-size-5"></span>
              </span>
            </router-link>
          </div>
          <div class="content is-flex-centered flex-md-col gap-1">
            <div v-for="(item, index) in groups" :key="index">
              <router-link :to="`/group/${item._id}`" class="box is-translucid">
                <article>
                  <h2>
                    <span>{{ item.code }}</span>
                    <span class="has-text-grey"> {{ item.users }}</span>
                  </h2>
                  <p class="subtitle has-text-weight-bold has-text-centered">
                    <span class="icon">
                      <span class="mdi mdi-clock-fast"></span>
                    </span>
                    <span>{{ item.minutes }}</span>
                    <span>+</span>
                    <span>{{ item.compensation }}</span>
                    <span class="icon">
                      <span class="mdi mdi-twitter-retweet"></span>
                    </span>
                    <span>{{ item.rounds }}</span>
                  </p>
                </article>
              </router-link>
            </div>
          </div>
        </div>
      </section>
    </div>
    <ul class="pieces is-hidden-mobile">
      <li class="black"></li>
      <li class="black"></li>
      <li class="black"></li>
      <li class="black"></li>
      <li class="black"></li>
      <li class="black"></li>
      <li class="white"></li>
      <li class="white"></li>
      <li class="white"></li>
      <li class="white"></li>
      <li class="white"></li>
      <li class="white"></li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
export default {
  name: 'Landing',
  sockets: {
    groups (data) {
      this.groups = data
    }
  },
  mounted () {
    const saved = JSON.parse(localStorage.getItem('player')) || {}
    axios.post('/group/random').then((res) => {
      this.$root.loading = false
      if (res.data.status === 'success') {
        this.groups = res.data.data
      }
    })
    if (saved.pieces) {
      document.querySelectorAll('.pieces li').forEach(e => {
        let li = window.getComputedStyle(e)
        e.style.backgroundImage = li.getPropertyValue('background-image').replace('cburnett', saved.pieces)
      })
    }
  },
  computed: {
    ...mapState([
      'player'
    ])
  },
  methods: {
    submit () {
      this.$router.push({
        name: 'Groups',
        params: {
          query: this.query
        }
      })
    }
  },
  data () {
    return {
      query: '',
      groups: []
    }
  }
}
</script>
