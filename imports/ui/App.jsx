import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import Login from './Login.jsx';
import Board from './Board.jsx';

import { Games } from '../api/games.js';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';


class App extends Component {



	render() {
		return (
			<div className="container">
				<a href="#maincontent" className="skip-link" >Skip to main content</a>
				<nav>
					<h1>Connect-4</h1>
					<AccountsUIWrapper />
				</nav>
				<main id="maincontent">
				{this.props.currentUser ?<Board games={this.props.games} historicGames={this.props.historicGames} activeGame={this.props.activeGame}/> : <Login />}
				</main>
			</div>
		);
	}
}

App.propTypes = {
	currentUser: PropTypes.object,
};

export default createContainer(() => {
	Meteor.subscribe('games');
	function activeGame () {
		if(Meteor.user()) return Games.find({ $and: [
							{
								$or: [
									{'p1._id':{$eq: Meteor.userId()}},
									{'p2._id':{$eq: Meteor.userId()}}
								]
							}, 
							{
								$or: [
									{state:{$eq: 'playing'}},
									{state:{$eq: 'waiting'}}
								]
							}
						]}).fetch();
		return null;
	}
	function findHistoricGames(){
		if(Meteor.user()) return Games.find({ $and: [
							{
								$or: [
									{'p1._id':{$eq: Meteor.userId()}},
									{'p2._id':{$eq: Meteor.userId()}}
								]
							}, 
							{
								state:{$eq: 'ended'},
							}
						]}).fetch();
		return null;

	}
	return {
		games: Games.find({}, { sort: { date_started: -1 } }).fetch(),
		activeGame: activeGame(),
		currentUser: Meteor.user(),
		historicGames: findHistoricGames(),
	};
}, App);