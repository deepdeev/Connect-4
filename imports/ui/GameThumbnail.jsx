import React, { Component } from 'react';

export default class GameThumbnail extends Component {

	//Cambiar contenido (o crear otro) segun si es historico o juego disponible

	joinGame () {
		Meteor.call('games.join', this.props.game._id);
	}

	render(){
		return (
			<div className="col-xs-12 game-item">
				<div className="row">
					<div className="col-xs-8">
						<div className="row">
						<h3>Join {this.props.game.p1.username} game!</h3>
						</div>
						<div className="row">
							<p>Game ID: {this.props.game._id}</p>
							<p>Dificulty: medium (50% win rate)</p>
						</div>
					</div>
					<div className="col-xs-4">
						<button className="options" onClick={this.joinGame.bind(this)}>Join</button>
					</div>
				</div>
			</div>
		);
	}
}