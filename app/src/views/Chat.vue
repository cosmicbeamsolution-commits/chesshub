<template>
  <div class="container is-widescreen">
    <div class="content column fadeIn w-100">
      <h3>
        <span class="icon has-margin">
          <span class="mdi mdi-chat"></span>
        </span>
        <span>{{ 'chat' | t }}</span>
      </h3>

      <div class="column has-text-centered is-padded min-20">
        <div class="columns">
          <div class="column chatbox-container">
            <div class="chatbox fadeIn">
              <div v-for="(item, index) in chatLines" :key="index" class="chatline">
                <div class="chatbubble" :class="{
                  'is-pulled-right has-background-info': item.owned,
                  'is-pulled-left has-background-white': !item.owned,
                  'is-bot': item.sender === 'bot'
                }">
                  <div class="is-flex gap-1" :class="{
                    'is-flex-end': item.owned,
                    'is-flex-start': !item.owned
                  }">
                    <span v-html="item.name"/>
                    <p class="is-size-5 bg-transparent" v-html="item.line"/>
                  </div>
                  <div v-html="item.created" class="is-size-7"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form @submit.prevent="sendChat">
          <div class="field is-fullwidth has-addons has-addons-fullwidth is-marginless fadeIn delay">
            <div class="control">
              <input class="input" v-model="chatInput" type="text" :placeholder="'type-your-message' | t" autofocus />
            </div>
            <div class="control has-text-left" style="max-width: 2.5rem;">
              <button type="submit" class="button is-info">
                <span class="icon">
                  <span class="mdi mdi-arrow-up"></span>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
// import Snackbar from '../components/Snackbar'
import PlaySound from '@/components/PlaySound'
import moment from 'moment'
export default {
  name: 'Chat',
  sockets: {
    private_chat (data) {
      if (data.sender !== this.player._id) {
        this.chatLine(data.line)
      }
    }
  },
  data () {
    return {
      chatLines: [],
      chat: {},
      chatInput: '',
      searching: false,
      query: '',
      limit: 10,
      offset: 0,
      msg: 'Results'
    }
  },
  computed: {
    ...mapState([
      'player'
    ])
  },
  beforeDestroy () {
    if (this.$route?.name !== 'Play') {
      this.$socket.emit('private_leave', this.chat)
    }
  },
  beforeMount () {
    this.loadChat()
  },
  methods: {
    loadChat () {
      axios.post('/chat', {
        chat: this.$route.params.chat
      }).then((res) => {
        res.data.lines = res.data.lines?.map((e) => {
          e.owned = this.player._id === e.sender
          return e
        })
        this.chatLines = res.data.lines || []
        this.chat = {
          chat: res.data,
          player: this.player
        }
        this.$root.loading = false
        this.$socket.emit('private_join', this.chat)
        this.scrollToBottom()
      })
    },
    chatHistory () {
      if (this.chatLines) {
        this.data.chatLines.forEach(item => {
          const owned = this.player._id === item.sender
          this.chatLines.push({
            line: item.line,
            created: moment(item.created).fromNow(true),
            sender: item.sender,
            owned: owned
          })
        })
        this.scrollToBottom()
      }
    },
    scrollToBottom () {
      setTimeout(() => {
        const box = document.querySelector('.chatbox-container')
        if (box) {
          box.scrollTop = box.scrollHeight
        }
      }, 100)
    },
    sendChat () {
      const line = {
        sender: this.player._id,
        name: this.player.code,
        line: this.chatInput.trim() || '🤝'
      }
      const data = {
        chat: this.$route.params.chat,
        line: line
      }
      // console.log('chatLine(1)', line)
      // this.chatLine(line)
      this.$socket.emit('private_chat', data)
      this.chatInput = ''
    },
    chatLine (line) {
      const owned = this.player._id === line.sender
      this.chatLines.push({
        line: line.line,
        name: line.name,
        created: moment(line.created).fromNow(true),
        sender: line.sender,
        owned: owned
      })
      if (!owned) {
        PlaySound('chat.mp3')
      }
      this.scrollToBottom()
    }
  }
}
</script>
