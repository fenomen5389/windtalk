const app = require('express')()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

var activeUsersArray = [];

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

io.on('connection', socket => {
    socket.on('join-province-room', (provinceId, peerId, visibleName) => {
        socket.join(provinceId)
        socket.to(provinceId).emit('user-joined', peerId, visibleName)
        socket.on('disconnect', () => {
            socket.to(provinceId).emit('user-left', (peerId, visibleName))
        })
        socket.on('join-province-room', (provinceId2, peerId) => {
            if (provinceId2 != provinceId) {
                socket.leave(provinceId)
                socket.to(provinceId).emit('user-left', (peerId, visibleName))
            }
        })
    })
    socket.on('add-user', user => {
        activeUsersArray.push({ id: socket.id, visibleName: user.visibleName, provinceId: user.provinceId, peerId: user.peerId })
    })
    socket.on('disconnect', () => {
        deleteFromUserArray(socket.id)
    })
})


setInterval(function() {
    io.emit('user-list', activeUsersArray)
}, 1000)


function deleteFromUserArray(socket_id) {
    for (var i = 0; i < activeUsersArray.length; i++) {
        if (activeUsersArray[i].id == socket_id) {
            activeUsersArray.splice(i, 1)
        }
    }
}

server.listen(3000)