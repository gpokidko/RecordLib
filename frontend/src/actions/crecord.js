import * as api from "../api";
import {
  normalizeCRecord,
  denormalizeCRecord,
  CRECORD_ID,
  normalizeAnalysis,
  denormalizeSourceRecords,
} from "../normalize";
import { addOrReplaceApplicant } from "./applicant";
import { upsertSourceRecords } from "./sourceRecords";
import { setMessage } from "./messages";
export const UPDATE_CRECORD = "UPDATE_CRECORD";
export const UPDATE_CRECORD_SUCCEEDED = "UPDATE_CRECORD_SUCCEEDED";
export const FETCH_CRECORD_SUCCEEDED = "FETCH_CRECORD_SUCCEEDED";
export const ANALYZE_CRECORD_SUCCEDED = "ANALYZE_CRECORD_SUCCEDED";

function analyzeRecordsSucceeded(data) {
  // TODO - do we need to normalize 'data' here? Its an analysis from the server, so its pretty deeply
  // nested. But we won't edit it, I think.
  const normalizedAnalysis = normalizeAnalysis(data);
  return {
    type: "ANALYZE_CRECORD_SUCCEEDED",
    payload: normalizedAnalysis,
  };
}

/**
 * Create an action to send the CRecord to the server and receive an analysis of petitions that can be generated from this analysis,
 */
export function analyzeCRecord() {
  return (dispatch, getState) => {
    const crecord = getState().crecord;
    const normalizedData = { entities: crecord, result: CRECORD_ID };
    const denormalizedCRecord = denormalizeCRecord(normalizedData);
    const applicantInfo = getState().applicantInfo;
    const person = Object.assign({}, applicantInfo.applicant, {
      aliases: applicantInfo.applicant.aliases.map(
        (aliasId) => applicantInfo.aliases[aliasId]
      ),
    });
    delete person.editing;
    if (person.date_of_death === "") {
      delete person.date_of_death;
    }
    denormalizedCRecord["person"] = person;
    api
      .analyzeCRecord(denormalizedCRecord)
      .then((response) => {
        const data = response.data;
        const action = analyzeRecordsSucceeded(data);
        dispatch(action);
      })
      .catch((err) => {
        console.log("Error analyzing crecord.");
        dispatch(setMessage(err));
      });
  };
}

/**
 *
 * N.B. this action will trigger two reducers - one to update the crecord object that stores cases and charges, and one to update the 'applicant' slice.
 * @param {*} newCRecord
 */

export function updateCRecordSucceeded(newCRecord) {
  const normalizedCRecord = normalizeCRecord(newCRecord);
  return {
    type: UPDATE_CRECORD_SUCCEEDED,
    payload: { person: newCRecord.person, cRecord: normalizedCRecord },
  };
}

export function updateCRecord() {
  /**
   * Send the CRecord and SourceRecords to the server. the server will analyze the sourceRecord and integrate them into the
   * CRecord, and return a new crecord.
   */
  return (dispatch, getState) => {
    const crecord = getState().crecord;
    const sourceRecords = denormalizeSourceRecords(getState().sourceRecords);
    const normalizedData = { entities: crecord, result: CRECORD_ID };
    const denormalizedCRecord = denormalizeCRecord(normalizedData);
    const applicantInfo = getState().applicantInfo;
    const person = Object.assign({}, applicantInfo.applicant, {
      aliases: applicantInfo.applicant.aliases.map(
        (aliasId) => applicantInfo.aliases[aliasId]
      ),
    });
    delete person.editing;
    if (person.date_of_death === "") {
      delete person.date_of_death;
    }
    if (person.date_of_birth === "") {
      delete person.date_of_birth;
    }
    denormalizedCRecord["person"] = person;

    api
      .integrateDocsWithRecord(denormalizedCRecord, sourceRecords)
      .then((response) => {
        dispatch(updateCRecordSucceeded(response.data.crecord));

        dispatch(addOrReplaceApplicant(response.data.crecord.person));
        dispatch(
          upsertSourceRecords({ source_records: response.data.source_records })
        );
      })
      .catch((err) => {
        console.log("error sending crecord and sourcerecords to server.");
        console.log(err);
        dispatch(setMessage(err));
      });
  };
}
