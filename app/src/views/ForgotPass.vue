<template>
  <div class="container">
    <section class="content column fadeIn">
      <div class="columns is-centered">
        <div class="column is-narrow">
          <form class="form form-boxed has-text-centered slideIn has-margin-top" @submit.prevent="submit">
            <h4 class="title gap-1">
              <span class="icon">
                <span class="mdi mdi-account-lock"></span>
              </span>
              <span>{{ 'forgot_password' | t }}</span>
            </h4>
            <p>{{ 'forgot_text' | t }}</p>
            <div class="field">
              <div class="control">
                <input v-model="data.email_or_username" class="input" type="text" :placeholder="'email_or_username' | t" required autofocus>
              </div>
            </div>
            <div class="field">
              <div class="control has-text-centered">
                <button type="submit" class="button w-100 is-link" :class="{'is-loading' : $root.processing}">{{ 'recover_password' | t }}</button>
              </div>
            </div>
            <hr>
            <div class="field">
              <div class="control">
                <router-link to="/login" class="button w-100 is-text">{{ 'login' | t }}</router-link>
                <router-link to="/register" class="button w-100 is-text">{{ 'register' | t }}</router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'ForgotPassword',
  data () {
    return {
      acceptTerms: false,
      data: {}
    }
  },
  created () {
    this.data.email_or_username = this.player.code
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
        .dispatch('register', this.data)
        .then(res => {
          this.$router.push('/register-success')
        })
        .catch(err => console.log(err))
    }
  }
}
</script>
