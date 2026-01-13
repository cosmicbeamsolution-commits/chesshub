<template>
  <div class="container">
    <section class="content column fadeIn">
      <h3 class="title gap-1">
        <span class="icon">
          <span class="mdi mdi-hands"></span>
        </span>
        <span>{{ 'donate' | t }}</span>
      </h3>
      <p>{{ 'donate_text' | t }}</p>
      <p><a href="https://www.paypal.me/overlemon" target="_blank" class="button is-success">{{ 'make_donation' | t }}</a></p>
    </section>
  </div>
</template>

<script>
export default {
  name: 'donate'
}
</script>
