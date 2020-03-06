import * as actionTypes from './actionsTypes';
import axios from 'axios';

export const authStart = () => {
	return {
		type: actionTypes.AUTH_START
	}
}

export const authSuccess = (token, userId) => {
	return {
		type: actionTypes.AUTH_SUCCESS,
		idToken: token,
		userId: userId
	}
}
export const authFail = (error) => {
	return {
		type: actionTypes.AUTH_FAIL,
		error: error
	}
}

export const logout = () => {
	return {
		type: actionTypes.AUTH_LOGOUT
	}
}

export const checkAuthTimeout = (expirationTime) => {
	return dispatch => {
		setTimeout(()=>{
			dispatch(logout())
		}, expirationTime * 1000)
	}
}

export const auth = (email, password, isSignIn, hideModal) => {
	return dispatch => {
		dispatch(authStart());
		const authData = {
			email: email,
			password: password,
			returnSecureToken: true
		}
	
		let url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBqyuDPnKvDsJkRD8G1bT96N4XYy-2Y8_I";

		if(!isSignIn){
			url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBqyuDPnKvDsJkRD8G1bT96N4XYy-2Y8_I"
		}

		axios.post(url, authData)
			.then(response => {
				const expirationDate = new Date (new Date().getTime() + response.data.expiresIn * 1000);
				localStorage.setItem('token', response.data.idToken);
				localStorage.setItem('expirationDate', expirationDate);
				localStorage.setItem('userId', response.data.localId);
				localStorage.setItem('email', response.data.email);
				dispatch(authSuccess(response.data.idToken, response.data.localId));
				dispatch(checkAuthTimeout(response.data.expiresIn));
			})
			.then(()=>{
				hideModal();
			})
			.catch(err => {
				dispatch(authFail(err.response.data.error));
			})
	}
}


export const authCheckState = () => {
	return dispatch => {
		const token = localStorage.getItem('token');
		if(!token){
			dispatch(logout())
		}
		else{
			const expirationDate = new Date(localStorage.getItem('expirationDate'))
			if(expirationDate <= new Date()){
				 dispatch(logout());
			}
			else{
				const userId = localStorage.getItem('userId');
				dispatch(authSuccess(token, userId))
				dispatch(checkAuthTimeout((expirationDate.getTime()-new Date().getTime()) / 1000 ));
			}
		}
	}
}

export const clearError = () => {
	return {
		type: actionTypes.CLEAR_ERROR,
	}
}

export default {auth, logout, authCheckState}













