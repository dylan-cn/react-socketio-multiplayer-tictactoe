(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{36:function(e,t,a){e.exports=a.p+"static/media/logo.5d5d9eef.svg"},45:function(e,t,a){e.exports=a(85)},50:function(e,t,a){},53:function(e,t,a){},82:function(e,t){},85:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),o=a(32),s=a.n(o),i=(a(50),a(17)),m=a.n(i),c=a(33),l=a(34),u=a(35),p=a(44),g=a(42),d=(a(52),a(36)),f=a.n(d),h=(a(53),a(37)),E=a.n(h)()("http://localhost:8080"),S=a(43),y=a(38),R=a(40),w=a(41),k=function(e){Object(p.a)(a,e);var t=Object(g.a)(a);function a(e){var n;return Object(l.a)(this,a),(n=t.call(this,e)).findGame=function(){n.state.inGame||(E.emit("findGame"),n.setState({inGame:!0,displayWinner:!1}))},n.boardClick=function(e,t,a){E.emit("makeMove",{gameId:n.state.gameRoom.id,rowIdx:t,colIdx:a})},n.displayWinnerText=function(){if(n.state.displayWinner){if(n.state.gameRoom.winner===n.state.winnerStatus.NO_WINNER||n.state.gameRoom.winner===n.state.winnerStatus.TIE)return r.a.createElement("p",null,"There was no winner for this game.");if(n.state.gameRoom.winner===E.id)return r.a.createElement("p",null,"You won!");if(""!==n.state.gameRoom.winner)return r.a.createElement("p",null,"You lost!")}},n.renderBoard=function(){return r.a.createElement(y.a,{className:"game-container"},n.state.displayWinner?"":n.state.gameRoom.gameStatus===n.state.gameStatus.SEARCHING?r.a.createElement("p",null,"Waiting for an opponent..."):n.state.gameRoom.playerTurn===E.id&&n.state.gameRoom.gameStatus===n.state.gameStatus.IN_PROGRESS?r.a.createElement("p",null,"It's your turn!"):r.a.createElement("p",null,"Waiting for your opponent to make a move..."),n.displayWinnerText(),n.state.gameBoard.map((function(e,t){return console.log(e),r.a.createElement(R.a,{key:t},n.state.gameBoard[t].map((function(e,a){var o=0;return Object.keys(n.state.gameRoom).length>0&&(o=n.state.gameRoom.gameState[t][a]),r.a.createElement(w.a,{key:t+a,className:"game__box",onClick:function(e){return n.boardClick(e,t,a)}},"-"===o?"":o)})))})))},n.state={gameRoom:{},gameStatus:null,winnerStatus:"",inGame:!1,gameBoard:[[0,1,2],[3,4,5],[6,7,8]],displayWinner:!1},n}return Object(u.a)(a,[{key:"componentDidMount",value:function(){var e=Object(c.a)(m.a.mark((function e(){var t,a,n,r,o=this;return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch("/api/game_status");case 2:return t=e.sent,e.next=5,t.json();case 5:return a=e.sent,e.next=8,fetch("/api/game_winner");case 8:return n=e.sent,e.next=11,n.json();case 11:r=e.sent,this.setState({gameStatus:a,winnerStatus:r}),E.on("setGameRoom",(function(e){o.setState({gameRoom:e}),o.state.gameRoom.gameStatus===o.state.gameStatus.FINISHED&&(o.setState({inGame:!1,displayWinner:!0}),E.emit("endGame")),console.log(o.state.gameRoom)}));case 14:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){return r.a.createElement("div",{className:"App"},r.a.createElement("header",{className:"App-header"},r.a.createElement("img",{src:f.a,className:"App-logo",alt:"logo"}),r.a.createElement("p",null,"A multiplayer Tic Tac Toe game using Socket.io")),r.a.createElement("br",null),!this.state.inGame&&r.a.createElement(S.a,{variant:"outline-primary",onClick:this.findGame},"Find Game"),(this.state.inGame||this.state.displayWinner)&&this.renderBoard())}}]),a}(r.a.Component);s.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(k,null)),document.getElementById("root"))}},[[45,1,2]]]);
//# sourceMappingURL=main.7e9aeb5e.chunk.js.map