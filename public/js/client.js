function PostData(url, data, success, error) {
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
      error(errorThrown);
    }
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
  $('#count').text('('+ data.length+')');
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
    $('#count').text('('+ $("#tblComments li").length +')');
  });
});

$('#iCommemt').keyup(function (e) {
  if (e.keyCode === 13) {
    $('#myButton').click();
  }
});

$(() => {
  setTimeout(()=>{
    getapi('/list-comments');
  }, 1000)
});