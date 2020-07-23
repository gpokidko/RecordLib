import React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Aliases from "./Aliases";
import EditField from "./EditField";
import EditAddress from "./EditAddress";

function EditApplicant(props) {
  const {
    first_name,
    last_name,
    date_of_birth,
    date_of_death,
    aliases,
    ssn,
    address,
    modifier,
  } = props;
  const applicantStyle = {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    margin: "15px",
    border: "1px solid black",
    borderRadius: "5px",
    padding: "10px",
    width: "90%",
  };
  const buttonStyle = { justifySelf: "right", marginRight: "20px" };

  /**
   * This function starts with the modifier function, which expects a key,value pair
   * and returns a function which takes a key and returns a function which expects a value.
   */
  const getPropertyModifier = (key) => {
    return (value) => modifier(key, value);
  };

  const toggleEditing = () => modifier("editing", false);

  return (
    <form>
      <div className="applicant" style={applicantStyle}>
        <div>
          <EditField
            item={first_name}
            label="First Name: "
            modifier={getPropertyModifier("first_name")}
          />
          <EditField
            item={last_name}
            label="Last Name: "
            modifier={getPropertyModifier("last_name")}
          />
        </div>
        <Button
          variant="contained"
          type="button"
          style={buttonStyle}
          onClick={toggleEditing}
        >
          Done Editing
        </Button>
        <EditField
          item={date_of_birth}
          fieldType="date"
          label="DOB: "
          modifier={getPropertyModifier("date_of_birth")}
        />
        <EditField
          item={date_of_death}
          fieldType="date"
          label="Deceased Date: "
          modifier={getPropertyModifier("date_of_death")}
        />
        <EditField
          item={ssn}
          label="Social Security Number: "
          modifier={getPropertyModifier("ssn")}
        />
        <div></div>
        <div>
          <EditAddress
            address={address}
            header="Address:"
            modifier={modifier}
          />
        </div>
        <div></div>
        <div>
          <Aliases editing={true} aliases={aliases} />
        </div>
      </div>
    </form>
  );
}

EditApplicant.propTypes = {
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  date_of_birth: PropTypes.string,
  date_of_death: PropTypes.string,
  aliases: PropTypes.array,
  ssn: PropTypes.string,
  address: PropTypes.shape({
    line_one: PropTypes.string,
    city_state_zip: PropTypes.string,
  }),
  modifier: PropTypes.func,
};

export default EditApplicant;
