// Globals
var socket = io(window.location.host)

// Vue Components
Vue.component('app-header', {
  props: ['status'],
  
  template: `
  <h1>Simple Chat
  <span id="status" v-bind:class="classObject">
  {{status ? 'connected' : 'loading'}}
  </span>
  </h1>
  `,

  computed: {
    classObject: function() {
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
  <section id="join" class="well hidden" >
    <form id="JoinForm" class="form-inline text-right">
        <fieldset>
          <input type="text" class="form-control " placeholder="Your name" autocomplete="off" required autofocus />
          <button id="sendJoin" class="btn btn-success" disabled>Join</button>
        </fieldset>
    </form>
  </section>
  `,

  data: {
    message: '',
    parsedMessage: 'parsedMessage'
  },
  computed: {
    parsedMessage: function() {
      return this.message.trim()
    }
  }
})

// Vue Instance
var vm = new Vue({
  el: '#app',
  data: {
    socketStatus: false
  }
})

// SOCKET EVENTS
// handle connectting to and disconnecting from the chat server
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

// welcome message received from the server
socket.on('welcome', function (msg) {
  console.log('Received welcome message: ', msg)
  // enable the form and add welcome message
  $('main').removeClass('hidden')
  $('#messages').prepend($('<div class="text-center">').html('<strong>' + msg + '<strong>'))
})

// chat message from another user
socket.on('chat', function (msg) {
  console.log('Received message: ', msg)
  $('#messages').prepend($('<div class="alert alert-success">').html('<strong>' + msg.user.name + ':</strong> ' + msg.message))
})

// message received that new user has joined the chat
socket.on('joined', function (user) {
  console.log(user.name + ' joined left the chat.')
  $('#messages').prepend($('<div class="text-center">').html('<strong>' + user.name + ' joined the chat.' + '<strong> '))
})

// handle leaving message
socket.on('left', function (user) {
  console.log(user.name + ' left the chat.')
  $('#messages').prepend($('<div class="text-center">').html('<strong>' + user.name + ' left the chat.' + '<strong> '))
})

// keep track of who is online
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
  $('#connected').text(names)
})
