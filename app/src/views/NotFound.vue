<template>
  <section class="hero is-widescreen fadeIn">
    <div class="hero-body is-flex-centered content">
      <div class="container is-flex-column is-vertical">
        <div v-show="section.content">
          <h1 class="title">
            <span class="icon has-margin-right">
              <span :class="'mdi mdi-' + section.icon"></span>
            </span>
            <span v-html="section.title"></span>
          </h1>
          <p v-html="section.content"></p>
        </div>
        <div v-show="!section.content">
          <h1 class="title">
            <span class="icon has-margin-right">
              <span class="mdi mdi-space-invaders"></span>
            </span>
            <span>{{ 'resource-not-found' | t }}</span>
          </h1>
          <p>{{ 'resource-not-found-text' | t }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'NotFound',
  data () {
    return {
      section: {
        icon: null,
        title: null,
        content: null
      }
    }
  },
  created () {
    let i = this.$route.path.replace('/', '')
    if (this.$root.translations[i + '-content']) {
      this.section = {
        icon: this.$root.t(i + '-icon'),
        title: this.$root.t(i + '-title'),
        content: this.$root.t(i + '-content')
      }
    }
    this.$root.loading = false
  }
}
</script>
