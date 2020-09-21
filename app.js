var http = require('http').createServer();
var io = require('socket.io')(http)
const config = {
    port: 3001
}

const rooms = {}; // 房间

io.on('connection', socket => {
    socket.on('openRoom', data => {
        // error:房间已存在(之后加入返回error事件响应统一处理)
        if (!rooms[data.roomId]) {
            rooms[data.roomId] = {
                host: {},
                users: {}
            };
        }
        socket.join(data.roomId);
        rooms[data.roomId].host = socket
    })
    socket.on('offer', data => {
        rooms[data.roomId].users[data.userId].emit('offer',data.sdp)
    })
    socket.on('iceCandidate', data => {
        rooms[data.roomId].users[data.userId].emit('iceCandidate',data.candidate)
    })
    socket.on('join', data => {
        // error:房间不存在
        if (rooms[data.roomId]) {
            socket.join(data.roomId);
            rooms[data.roomId].users[data.userId] = socket
            rooms[data.roomId].host.emit('call',{
                userId: data.userId
            })
            socket.broadcast.to(data.roomId).emit('joined', data); // 发给房间内当前用户之外的所有人
        }
    });
    socket.on('answer', data => {
        rooms[data.roomId].host.emit('answer', data);
    });
    // socket.on('iceCandidate', data => {
    //     rooms[data.roomId].candidate = data.candidate
    // });
});
io.on('disconnect', (sock) => {
    for (let k in users) {
        users[k] = users[k].filter(v => v.id !== sock.id);
    }
    console.log(`disconnect id => ${users}`);
});

function checkRoom (){

}

http.listen(config.port, function () {
    console.log(`listening on :http://localhost:${config.port}`)
})
// https.createServer(app.callback()).listen(3001);