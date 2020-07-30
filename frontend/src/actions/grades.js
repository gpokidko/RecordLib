/**
 * Actions for interacting with the /grades/ api endpoints. This is for predicting grades of offenses
 * with missing grades.
 */

import * as api from "../api";
import { newMessage } from "frontend/src/actions/messages";

export const GUESS_GRADE_SUCCEEDED = "GUESS_GRADE_SUCCEEDED";
export const UPDATE_GRADE = "UPDATE_GRADE";

function guessGradeSucceeded(chargeId, gradeProbabilities) {
  return {
    type: GUESS_GRADE_SUCCEEDED,
    payload: { chargeId, gradeProbabilities },
  };
}

export function guessGrade(chargeId, offense, statute) {
  return (dispatch) => {
    api
      .guessGrade(offense, statute)
      .then((resp) => {
        dispatch(guessGradeSucceeded(chargeId, resp.data));
      })
      .catch((err) => {
        console.log("guess grade api call failed.");
        console.log(err);
        dispatch(newMessage(err));
      });
  };
}

/**
 *
 * @param {*} chargeId The id of the charge that needs to be updated.
 * @param {*} grade The grade that charge chargeId should get.
 */
export function updateGrade(chargeId, grade) {
  return {
    type: UPDATE_GRADE,
    payload: { chargeId, grade },
  };
}
