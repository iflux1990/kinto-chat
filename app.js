$.material.init()

var connected;
$.getScript('/lib/helpers.js');

$(window).on('resize', function() {
    $('#messages').css('height', $(window).height() - 340);
    $('.sidebar').css('height', $(window).height() - 180);
})

$('#messages').css('height', $(window).height() - 340);
$('.sidebar').css('height', $(window).height() - 180);


$(window).focus(function(event) {
  setTimeout(function() {
    $('#message-field').focus();
  }, 100);
})

var db = new Kinto();
var users = db.collection("users");
var messages = db.collection("messages");
var syncOptions = {
  remote: "http://xxx.xxx.xxx.xxx:8888/v1", //Kinto backend
  headers: {Authorization: "Basic " + btoa("user:pass")}
};

function render() {
  users.list()
  .then(function(result) {
    renderUsers(result.data);
  })
  .catch(function(error) {
    console.error(error);
  })

  messages.list()
  .then(function(result) {
    renderMessages(result.data);
  })
  .catch(function(error){
    console.error(error);
  })
}

$("#clearUsers").click(function(event) {
  event.preventDefault();
  users.list()
    .then(function(result) {
      result.data.forEach(function(user) {
        users.delete(user.id);
      })
    })
    .then(function() {
      localStorage.removeItem('guid');
      localStorage.removeItem('name');
    })
    .then(render)
    .catch(function(error) {
      console.error(error);
    })
});

$("#connect-form").on('submit', function(event) {
  event.preventDefault();
  localStorage['guid'] = guid();
  localStorage['name'] = event.target.name.value;

  users.create({
    guid: localStorage['guid'],
    name: localStorage['name']
  })
    .then(render)
    .catch(function(error) {
      console.error(error);
  })

  $("#message-form [type='submit']").attr('disabled', false);
  $('#connect').modal('hide');
});

$('#message-form').on('submit', function(event) {
  event.preventDefault();

  if(event.target.message.value.length > 0) {
    messages.create({
      sender: localStorage['name'],
      message: event.target.message.value,
      timestamp: $.now()
    })
    .then(render)
    .then(function() {
      event.target.message.value = "";
      event.target.title.focus;
    })
    .catch(function(error) {
      console.error(error);
    })
  }
})

function sync() {
  users.sync(syncOptions)
    .catch(function(err) {
      console.error(err);
  });

  messages.sync(syncOptions)
    .catch(function(err) {
      console.error(err);
  });

  render();
}

function main() {

  checkConnectStatus();
  sync();

  setInterval(function() {
    purgeOldMessages();
  }, 60000);

  var refresTime = 500;

  $(window).focus(function() {
    refresTime = 500;
  }).blur(function() {
    refresTime = 10000;
  })

  setInterval(function() {
     sync();
  }, refresTime);
}

$(window).on('beforeunload', function(event) {
  disconnect();
  setTimeout(function() {
    return false;
  }, 500);
})




window.addEventListener("DOMContentLoaded", main);
