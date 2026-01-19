<template>
  <div class="container">
    <section class="content column fadeIn">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <form class="form form-boxed has-text-centered slideIn has-margin-top" @submit.prevent="submit">
            <h4 class="title gap-1">
              <span class="icon">
                <span class="mdi mdi-account-key"></span>
              </span>
              <span>{{ 'login' | t }}</span>
            </h4>
            <p>{{ 'login_text' | t }}</p>
            <div class="field">
              <div class="control">
                <input v-model="data.email_or_username" class="input" type="email" :placeholder="'email_or_username' | t" required autofocus>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <input v-model="data.password" class="input" minlength="6" type="password" :placeholder="'password' | t" required>
              </div>
            </div>
            <div class="field">
              <div class="control has-text-centered">
                <button type="submit" class="button is-link w-100" :class="{'is-loading' : $root.processing}">{{ 'login' | t }}</button>
              </div>
            </div>
            <hr>
            <div class="field">
              <div class="control">
                <router-link to="/forgot-password" class="button is-text w-100">{{ 'forgot_password' | t }}</router-link>
                <router-link to="/register" class="button is-text w-100">{{ 'register' | t }}</router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import swal from 'sweetalert'
import { mapState } from 'vuex'
export default {
  name: 'Login',
  data () {
    return {
      data: {}
    }
  },
  created () {
    // this.data.email = this.player.email || this.player.code
    this.$root.loading = false
  },
  computed: {
    ...mapState([
      'player'
    ])
  },
  methods: {
    submit: function () {
      this.$root.processing = true
      this.$store
        .dispatch('login', this.data)
        .then(res => {
          this.$root.processing = false
          this.$router.push('/dash')
        })
        .catch(err => {
          swal('Error', err.response.data)
          this.$root.processing = false
        })
    }
  }
}
</script>
