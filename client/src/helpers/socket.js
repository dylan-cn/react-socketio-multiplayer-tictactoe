import socketIOClient from 'socket.io-client';

const socket = socketIOClient(window.location.host);


export default socket;