import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Cases from "./Cases";
//import ApplicantHolderWrapper from "./ApplicantHolder";
import { CRECORD_ID } from "../normalize";

/**
 * Component that displays a criminal record.
 * It has information about the defendant and a list of cases.
 */
function CRecord(props) {
  const { cases } = props;

  return <Cases cases={cases} />;
}

CRecord.propTypes = {
  cases: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
  return state.crecord.cRecord[CRECORD_ID];
}

const CRecordWrapper = connect(mapStateToProps)(CRecord);
export default CRecordWrapper;
