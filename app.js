var http = require('http').createServer();
var io = require('socket.io')(http)
const config = {
    port: 3001
}

const socks = {}; // 客户端socket
const rooms = {}; // 房间

io.on('connection', socket => {
    socket.on('offer', data => {
        if (!rooms[data.roomId]) {
            rooms[data.roomId] = {
                sdp: '',
                candidate:'',
                users: []
            };
        }
        socks[data.roomId] = socket
        rooms[data.roomId].sdp = data.sdp
    })
    socket.on('join', data => {
        if (rooms[data.roomId]) {
            console.log(rooms[data.roomId])
            socket.emit('getInfo', {
                sdp: rooms[data.roomId].sdp,
                candidate: rooms[data.roomId].candidate
            }); //发送给当前用户
            socket.broadcast.to(data.roomId).emit('joined', data.account); // 发给房间内当前用户之外的所有人
        }
    });
    socket.on('answer', data => {
        socks[data.roomId].emit('answer', data);
    });
    socket.on('iceCandidate', data => {
        rooms[data.roomId].candidate = data.candidate
    });
    // sock.on('reply', data=>{ // 转发回复
    //     sockS[data.account].emit('reply', data);
    // });
    // sock.on('1v1answer', data=>{ // 转发 answer
    //     sockS[data.account].emit('1v1answer', data);
    // });
    // sock.on('1v1ICE', data=>{ // 转发 ICE
    //     sockS[data.account].emit('1v1ICE', data);
    // });
    // sock.on('1v1offer', data=>{ // 转发 Offer
    //     sockS[data.account].emit('1v1offer', data);
    // });
    // sock.on('1v1hangup', data=>{ // 转发 hangup
    //     sockS[data.account].emit('1v1hangup', data);
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