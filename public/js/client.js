// Globals
var socket = io(window.location.host)
var user = {
  name: 'anon'
}

var config = {
  messages: [],
  connected: ''
}

// Vue Components
Vue.component('chat-title', {
  props: ['status'],
  template: `
  <h1>
  <img src="https://vuejs.org/images/logo.png" height=35>
  <b>Vue Chat</b>
  <span id="status" v-bind:class="statusColor">
  {{status ? 'connected' : 'loading'}}
  </span>
  </h1>
  `,
  computed: {
    statusColor: function() {
      return {
        label: true,
        'label-default': !this.status,
        'label-success': this.status
      }
    }
  }
})

Vue.component('join-form', {
  props: ['status'],

  template: `
  <section id="join" v-bind:hidden="isNameRegistered">
    <form id="JoinForm" class="text-right">

        <fieldset>
          <div class="input-group input-group-lg">
          <input type="text" class="form-control" v-model="inputMessage" placeholder="Enter your name" autocomplete="off" required autofocus />
          <span class="input-group-btn">
            <button id="sendJoin" class="btn btn-success" v-bind:disabled="!isThereAName" v-on:click.prevent="registerUserName">
            <span class="glyphicon glyphicon-user"></span>
            </button>
          </span>
          </div>
        </fieldset>

    </form>
  </section>
  `,
  data: function() {
    return {
      inputMessage: '',
      isThereAName: false,
      isNameRegistered: false
    }
  },
  watch: {
    inputMessage: function( nameField ) {
      if (nameField === '') this.isThereAName = false
      if (nameField !== '') this.isThereAName = true
    }
  },
  methods: {
    registerUserName: function() {
      console.log('running registerUserName')
      user.name = this.inputMessage
      if (user.name.length === 0) return false

      console.log('Joining chat with name: ', user.name)
      socket.emit('join', user)

      // hide join form upon successful username
      this.isNameRegistered = true
    }
  }
})

Vue.component('chat-message', {
  props: ['message'],
  template: `
  <div class="text-center grey" v-if="message.type=='info'">
    <strong> {{ message.content }} </strong>
  </div>
  <div class="alert alert-info text-right" v-else-if="message.type=='success'">
    <b><small>You</small></b><br>
    {{ message.content }}
  </div>
  <div class="alert alert-success" v-else-if="message.type=='alert'">
    <b><small>{{ message.user }}</small></b><br>
    {{ message.content }}
  </div>
  `
})

Vue.component('message-board', {
  props: ['config', 'user'],
  template: `
  <main class="panel panel-success" v-show="user.name !== 'anon' ">
  <div class="panel-heading">
    <form id="MessageForm" class="text-right">

      <fieldset>
        <div class="input-group input-group-lg">
        <input type="text" class="form-control" v-model="inputSentence" placeholder="Type your message" autocomplete="off" required autofocus />
        <span class="input-group-btn">
          <button id="sendMessage" class="btn btn-success" v-bind:disabled="!isThereSentence" v-on:click.prevent="postChatMessage">
          <span class="glyphicon glyphicon-send"></span>
          </button>
        </span>
        </div>
      </fieldset>

    </form>
  </div>

  <section class="panel-body">
    <div class="text-center">
      <small id="connected">
        {{ config.connected }}
      </small>
    </div>
    <hr>

    <div id="messages" v-for="message in config.messages">
      <chat-message v-bind:message="message"></chat-message>
    </div>
  </section>

  </main>
  `,
  data: function(){
    return {
      inputSentence: '',
      isThereSentence: false,
      isNameRegistered: false
    }
  },
  watch: {
    inputSentence: function(textField) {
      if (textField === '') this.isThereSentence = false
      if (textField !== '') this.isThereSentence = true
    }
  },
  methods: {
    postChatMessage: function() {
      console.log('Sending message: ' + this.inputSentence)
      var msg = this.inputSentence
      if (msg.length === 0) return false
      config.messages.unshift(
        { type: 'success', content: msg }
      )
      console.log('Messages Array: ', config.messages)
      socket.emit('chat', msg)

      this.inputSentence = ''
    }
  }
})

// Vue Instance
var vm = new Vue ({
  el: '#chat',
  data: {
    socketStatus: false,
    config: config,
    user: user
  }
})


// SOCKET EVENTS ==============================================================
// Connecting to and disconnecting from the chat server
socket.on('connect', function () {
  console.log('Connected to Chat Socket')
  // status(true)
  vm.socketStatus = true
})
socket.on('disconnect', function () {
  console.log('Disconnected from Chat Socket')
  // status(false)
  vm.socketStatus = false
})

// Welcome message received from the server
socket.on('welcome', function (msg) {
  console.log('Received welcome message: ', msg)
  // enable the form and add welcome message
  config.messages.unshift(
    { type: 'info', content: msg }
  )
})

// Chat message from another user
socket.on('chat', function (msg) {
  console.log('Received message: ', msg)
  config.messages.unshift(
    { type: 'alert', user: msg.user.name, content: msg.message }
  )
})

// Message received that new user has joined the chat
socket.on('joined', function (user) {
  console.log(user.name + ' joined the chat.')
  config.messages.unshift(
    { type: 'info', content: user.name + ' joined the chat.' }
  )
})

// Handle leaving message
socket.on('left', function (user) {
  console.log(user.name + ' left the chat.')
  config.messages.unshift(
    { type: 'info', content: user.name + ' left the chat.' }
  )
})

// Keep track of who is online
socket.on('online', function (connections) {
  var names = ''
  console.log('Connections: ', connections)
  for (var i = 0; i < connections.length; ++i) {
    if (connections[i].user) {
      if (i > 0) {
        if (i === connections.length - 1) names += ' and '
        else names += ', '
      }
      names += connections[i].user.name
    }
  }
  config.connected = names
})
