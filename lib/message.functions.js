function renderMessages(messages) {
  var div = $('#messages');
  div.empty();

  messages.sort(function(x,y) {
    return x.timestamp - y.timestamp;
  })

  messages.forEach(function(message){
    var html = renderMessage(message);
    div.append(html);
  });

  $("#messages").animate({ scrollTop: $(document).height() }, 100);
};

function renderMessage(message) {

  message = "<div class='col-xs-12 wordwrap message panel panel-default'>" +
              "<b>" + message.sender + " said: " + "</b>" +
              "<span>" + message.message + "</span>" +
            "</div>"

  return message;
};

function purgeOldMessages() {
  messages.list()
    .then(function(result) {
      var old = result.data.filter(function(message) {
        if($.now() > message.timestamp + 300000) {
          return message;
        }
      })

      return Promise.all(old.map(function(message) {
        return messages.delete(message.id);
      }));
    })
    .then(render)
    .catch(function(error) {
      console.log(error);
    })
}
