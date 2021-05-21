var socket = io("http://localhost:8000");
//client nhận dữ liệu từ server
socket.on("Server-sent-data", function (data) {
  $("#chat-content").append(data);
});

//client gửi dữ liệu lên server
$(document).ready(function () {
  socket.on("connection", () => {
    console.log(socket.id); // "G5p5..."
  });

  $("#send").click(function () {
    socket.emit("Client-sent-data", "Hello world");
  });
});