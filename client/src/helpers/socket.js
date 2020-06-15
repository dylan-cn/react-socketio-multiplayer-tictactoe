import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:8080');


export default socket;