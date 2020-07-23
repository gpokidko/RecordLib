import React from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";

/**
 * This component wraps a single field and allows
 * it to be edited.
 * The new value is sent to the redux store.
 * @constructor
 */
function EditField(props) {
  const { item, label, modifier, fieldType, ...remainingProps } = props;

  const handleChange = (event) => modifier(event.target.value);

  return (
    <div className="editField">
      <TextField
        id={label}
        label={label}
        value={item || ""}
        type={fieldType || "text"}
        InputLabelProps={{ shrink: fieldType === "date" ? true : undefined }}
        onChange={handleChange}
        {...remainingProps}
      />
    </div>
  );
}

EditField.propTypes = {
  /**
   * The label of the component, describing the contents.
   */
  label: PropTypes.string.isRequired,
  /**
   * The value which can be edited.
   */
  item: PropTypes.string,
  /**
   * The callback which registers the change.
   */
  modifier: PropTypes.func.isRequired,
};

export default EditField;
