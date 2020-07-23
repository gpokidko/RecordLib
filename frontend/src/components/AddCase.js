import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import { addCase } from "frontend/src/actions";
import Button from "@material-ui/core/Button";
/**
 * Component for adding a Case to a CRecord.
 * It starts with a textbox to enter the docket number of the case,
 * and a button.  Once the button is clicked, a case with that docket number
 * is added to the redux state. The new case will then be at the bottom of the list of cases, in edit mode,
 * so that the user can enter its data.
 */
function AddCase(props) {
  const { adder } = props;
  const [docketNumber, setDocketNumber] = useState("");

  const handleChange = (event) => setDocketNumber(event.target.value);
  const handleClick = () => {
    adder(docketNumber);
    setDocketNumber("");
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();
      handleClick();
    }
  };

  return (
    <div className="addCase">
      <TextField
        label="Docket Number"
        type="text"
        value={docketNumber}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleClick} disabled={docketNumber === ""}>
        Add Case
      </Button>
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    adder: (docketNumber) => {
      dispatch(addCase(docketNumber));
    },
  };
}

AddCase.propTypes = {
  /**
   * The callback which adds the case to state.
   */
  adder: PropTypes.func.isRequired,
};

const AddCaseWrapper = connect(null, mapDispatchToProps)(AddCase);
export default AddCaseWrapper;
