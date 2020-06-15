import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.svg';
import './App.css';
import socket from './helpers/socket';

import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            gameRoom: {},
            gameStatus: null,
            winnerStatus: '',
            inGame: false,
            gameBoard: [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8]
            ],
            displayWinner: false,
        }
    }

    async componentDidMount() {
        const gameStatusRes = await fetch('/api/game_status');
        const gameStatusJson = await gameStatusRes.json();

        const winnerStatusRes = await fetch('/api/game_winner');
        const winnerStatusJson = await winnerStatusRes.json();

        this.setState({ gameStatus: gameStatusJson, winnerStatus: winnerStatusJson });

        socket.on('setGameRoom', response => {
            this.setState({ gameRoom: response });

            // When the game ends, reset game state
            if (this.state.gameRoom.gameStatus === this.state.gameStatus.FINISHED) {
                this.setState({ inGame: false, displayWinner: true });

                // signify end of game
                socket.emit('endGame');
            }
            console.log(this.state.gameRoom);
        });
    }

    findGame = () => {
        if (!this.state.inGame) {
            socket.emit('findGame');
            this.setState({ inGame: true, displayWinner: false });
        }
    }

    boardClick = (e, rowIdx, colIdx) => {
        //console.log(e.target.id, rowIdx, colIdx);
        socket.emit('makeMove', {
            gameId: this.state.gameRoom.id,
            rowIdx,
            colIdx,
        });
    }

    displayWinnerText = () => {
        if (this.state.displayWinner) {
            if (this.state.gameRoom.winner === this.state.winnerStatus.NO_WINNER || this.state.gameRoom.winner === this.state.winnerStatus.TIE) {
                return (
                    <p>There was no winner for this game.</p>
                );
            }

            if (this.state.gameRoom.winner === socket.id) {
                return (
                    <p>You won!</p>
                );
            } else {
                if (this.state.gameRoom.winner !== '') {
                    return (
                        <p>You lost!</p>
                    );
                }
            }
        }
    }

    renderBoard = () => {
        return (
            <Container className="game-container">
                {this.state.displayWinner ? '' : this.state.gameRoom.gameStatus === this.state.gameStatus.SEARCHING ? <p>Waiting for an opponent...</p> : (this.state.gameRoom.playerTurn === socket.id && this.state.gameRoom.gameStatus === this.state.gameStatus.IN_PROGRESS) ? <p>It's your turn!</p> : <p>Waiting for your opponent to make a move...</p>}

                {this.displayWinnerText()}

                {
                    this.state.gameBoard.map((row, rowIdx) => {
                        console.log(row);
                        return (
                            <Row key={rowIdx}>
                                {
                                    this.state.gameBoard[rowIdx].map((col, colIdx) => {
                                        let value = 0;

                                        if (Object.keys(this.state.gameRoom).length > 0) {
                                            value = this.state.gameRoom.gameState[rowIdx][colIdx];
                                        }

                                        return (
                                            <Col key={rowIdx + colIdx} className="game__box" onClick={(e) => this.boardClick(e, rowIdx, colIdx)}>{value === '-' ? '' : value}</Col>
                                        )
                                    })
                                }
                            </Row>
                        )
                    })
                }
            </Container>
        );
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>
                        A multiplayer Tic Tac Toe game using Socket.io
                    </p>
                </header>

                <br />

                {!this.state.inGame && <Button variant="outline-primary" onClick={this.findGame}>Find Game</Button>}

                {(this.state.inGame || this.state.displayWinner) && this.renderBoard()}
            </div >
        );
    }
}

export default App;
