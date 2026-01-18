<template>
  <div class="container is-widescreen landing">
    <div class="columns is-vcentered has-padding-bottom z-index-1 fadeIn">
      <div class="column is-12 has-text-centered">
        <div class="has-text-centered has-padding-bottom">
          <form id="search" class="has-text-centered animated fadeIn delay slow" @submit.prevent="submit">
            <div class="field has-addons is-flex-centered">
              <div class="control">
                <input v-model="query" class="input" name="query" type="text" :placeholder="'search_in_groups' | t" autofocus>
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
          <div class="content is-flex-centered gap-1">
            <div v-for="(item, index) in groups" :key="index">
              <router-link :to="`/group/${item._id}`" class="box">
                <article>
                  <h2>
                    <span>{{ item.code }}</span>
                    <span class="has-text-grey"> {{ item.users }}</span>
                  </h2>
                  <p class="subtitle has-text-weight-bold">
                    <span class="icon">
                      <span class="mdi mdi-clock-fast"></span>
                    </span>
                    <span>{{ item.minutes }}</span>
                    <span>+</span>
                    <span>{{ item.compensation }}</span>
                  </p>
                </article>
              </router-link>
            </div>
          </div>
          <div class="columns is-flex-centered has-text-centered animated fadeIn delay">
            <h5 class="has-text-centered">{{ 'play_against' | t }}</h5>
          </div>
          <div class="is-flex-centered gap-1">
            <a @click="$root.play" class="button is-medium">
              <!--span class="icon">
                <span class="fa fa-handshake is-size-5"></span>
              </span-->
              <span>{{ 'human' | t }}</span>
            </a>
            <router-link class="button is-medium" to="/stockfish">
              <!--span class="icon">
                <span class="fa fa-server is-size-5"></span>
              </span-->
              <span>Stockfish</span>
            </router-link>
          </div>
          <!--div class="is-flex-centered gap-1">
            <h5 class="has-text-centered">{{ 'exhibit' | t }}</h5>
          </div-->
          <div class="is-flex-centered gap-1">
            <div class="column">
              <router-link class="button is-medium" to="/exhibit">
                <!--span class="icon">
                  <span class="fa fa-server is-size-5"></span>
                </span-->
                <span>{{ 'watch' | t }} Stockfish</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
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
        e.style.backgroundImage = li.getPropertyValue('background-image').replace('classic', saved.pieces)
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
      this.$router.push('/groups?q=' + this.query)
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
