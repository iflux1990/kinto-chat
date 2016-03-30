function renderUsers(users) {
  var ul = $('#users');
  ul.empty();
  users.forEach(function(user){
    var html = renderUser(user);
    ul.append(html);
  });

  if(users.length)
    $('.sidebar').find('.badge').text(users.length);
}

function renderUser(user) {
 tr = "<tr class='withripple'>" +
        "<td>" + user.name + "</td>" +
      "</tr>";

  return tr;
}

function renderConnectModal() {
  if(!connected) {
    $('#connect').modal('show');
    setTimeout(function() {
      $("[name='name']").focus();
    }, 150);

    $("#message-form [type='submit']").attr('disabled', true);
  }
}

function disconnect(){
  users.list()
    .then(function(result){
      result.data.forEach(function(user) {
        if(user.guid == localStorage['guid']) {
            users.delete(user.id)
              .then(console.log('Deleted'))
              .then(sync)
        }
      })

      sync();
    })
    .catch(function(error) {
      console.error(error);
    })
}

function checkConnectStatus() {
  var users = db.collection("users");

  users.list()
    .then(function(result){
      var guids = result.data.filter(function(user){
        return user.guid
      })

      guids.forEach(function(user) {
        if(user.guid == localStorage['guid']) {
          connected = true;
          $("#message-form [type='submit']").attr('disabled', false);
        }
      })
    })
    .then(function() {
      if(localStorage['guid'] && !connected) {
        users.create({
          guid: localStorage['guid'],
          name: localStorage['name']
        })
        .then(function(){
          render();
          connected = true;
        })
        .catch(function(error) {
            console.error(error);
        })
      }

      console.log("Connected: " + connected);
      renderConnectModal();
    })
    .catch(function(error) {
      console.log(error);
    });
}
