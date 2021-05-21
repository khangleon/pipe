function PostData(url, data, success, errors) {
  $.ajax({
    url: url,
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: JSON.stringify(data),
    processData: false,
    success: function (data, textStatus, jQxhr) {
      success(data, textStatus, jQxhr);
    },
    error: function (jqXhr, textStatus, errorThrown) {
      errors(errorThrown);
    }
  });
}

function GetData(url, cb, errs) {
  fetch(url).then((res) => {
    return res.json();
  }).then((json) => {
    cb(json);
  }).catch((err) => {
    errs(err.message);
  });
}

async function getapi(url) {

  // Storing response
  const response = await fetch(url);

  // Storing data in form of JSON
  var data = await response.json();
  //console.log(data);
  if (response) {
    $('#loading').hide();
  }
  showComments(data);
}

function showComments(data) {
  let li = '';
  for (let r of data.reverse()) {
    li += '<li>' + r.content + '</li>';
  }

  $('#tblComments').append(li);
  $('#count').text('(' + data.length + ')');
}

$('#myButton').click(() => {
  let postData = {
    comment: $('#iCommemt').val(),
    dateTime: new Date()
  }

  if ($('#iCommemt').val() === '') {
    return;
  }

  PostData('/add', postData, (data) => {
    $('#tblComments').prepend('<li>' + data.content + '</li>');
    $('#iCommemt').val('');
    $('#count').text('(' + $("#tblComments li").length + ')');
  });
});

$('#iCommemt').keyup(function (e) {
  if (e.keyCode === 13) {
    $('#myButton').click();
  }
});

$(() => {
  setTimeout(() => {
    GetData('/list-comments', (data) => {
      showComments(data);
      $('#loading').hide();
    });
  }, 1000)

  Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
    jpeg_quality: 90
  });
  Webcam.attach( '#divCam' );

});