/* global Meteor*/
/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }]*/
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }]*/
/* eslint prefer-const: "off"*/
/* eslint "react/jsx-no-bind": [2, {
  "ignoreRefs": true,
  "allowArrowFunctions": true,
  "allowBind": true
}]*/
/* eslint "react/prop-types": [0, { ignore: [historicGames] }] */
import React, { Component } from 'react';
import GameList from './GameList.jsx';
import Game from './Game.jsx';
import Message from './Message.jsx';
import GenericMessage from './GenericMessage.jsx';

export default class Board extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modal: false,
    };
  }

  // renderizar nuevo componente que muestra el ganador.
  // para eso debe revisar que newProps: 1. este en playing 2.Todo cols[i][0]!==0
  // en ese caso llama el metodo Meteor.call('games.winner')
  // si winner esta definido, mostrar componente de dialogo que muestre
  // el ganador y puntos de cada jugador
  // tambien mensaje personalizado segun si gano o perdio el usuario actual
  componentWillReceiveProps(newProps) {
    if (newProps.activeGame) {
      if (newProps.activeGame.length > 0) {
        if (newProps.activeGame[0].state === 'playing') {
          if (typeof newProps.activeGame[0].p1.score === 'undefined') {
            let notFinished = newProps.activeGame[0].cols.some((row) => {
              return row[0] === 0;
            });
            if (!notFinished) {
              Meteor.call('games.winner', newProps.activeGame[0]._id);
            }
          } else {
            this.setState({ modal: true });
          }
        }
      }
    }
    if (this.props.activeGame[0]) {
      let newH = newProps.historicGames.filter(
        game => game && game._id === this.props.activeGame[0]._id);
      if (newH.length > 0 && newH[0].givesUp) {
        this.partnerGaveUp(newH[0].winner === Meteor.user().username);
      }
    }
  }

  componentWillUnmount() {
    // this.setState({modal: false});
  }

  availableGames() {
    let avGames = this.props.games;
    return avGames.filter(game => game.state === 'waiting');
  }

  historicGames() {
    let hGames = this.props.historicGames;
    return hGames.filter(game => game.p1._id && game.p2._id);
  }

  endGame() {
    this.setState({ modal: false });
    if (this.props.activeGame[0]) {
      Meteor.call('games.end', this.props.activeGame[0]._id);
    }
  }

  showGiveUp() {
    this.setState({ giveUp: true, title: 'Give up?', message: 'Are you sure you want to give up?' });
  }

  hideGiveUp(endGame) {
    this.setState({ giveUp: false });
    if (endGame && this.props.activeGame[0]) {
      Meteor.call('games.giveUp', this.props.activeGame[0]._id);
    }
  }

  partnerGaveUp(won) {
    let str = won ? 'Partner gave up... You win!' : 'You gave up... You lose';
    this.setState({ giveUp: true, title: 'Game over', message: str });
  }

  blockFocus() {
    this.props.hideNavBar();
    if (this.board) this.board.tabIndex = -1;
  }

  resetFocus() {
    this.props.showNavBar();
    if (this.board) {
      this.board.tabIndex = 0;
      this.board.focus();
    }
  }


  render() {
    return (
      <div ref={(b) => { this.board = b; }} className="row" tabIndex="0">

        {this.props.activeGame.length > 0 ? (<div className="possible-games hideOnSignModal" aria-hidden={this.state.modal || this.state.giveUp ? 'true' : 'false'}>
          {this.props.activeGame[0].state !== 'waiting' ?
            <div className="row">
              <button className="options" onClick={this.showGiveUp.bind(this)}> Give Up </button>
            </div> : ''}
          <Game game={this.props.activeGame[0]} />
        </div>) :
        <div className="hideOnSignModal" aria-hidden={this.state.modal || this.state.giveUp ? 'true' : 'false'}>
          <GameList
            availableGames={this.availableGames()}
            historicGames={this.historicGames()}
            modalIsOn={this.state.modal}
            blockFocus={this.blockFocus.bind(this)} resetFocus={this.resetFocus.bind(this)}
          />
        </div>
    }

        {this.state.modal ?
          <Message
            game={this.props.activeGame[0]} finishGame={() => { this.endGame(); }}
            blockFocus={this.blockFocus.bind(this)} resetFocus={this.resetFocus.bind(this)}
          />
    : ''}
        {this.state.giveUp ? <GenericMessage
          title={this.state.title} message={this.state.message}
          remove={() => { this.hideGiveUp(true); }}
          cancel={() => { this.hideGiveUp(false); }} showCancel={this.props.activeGame[0]}
          blockFocus={this.blockFocus.bind(this)} resetFocus={this.resetFocus.bind(this)}
        /> : ''}
      </div>
    );
  }
}
