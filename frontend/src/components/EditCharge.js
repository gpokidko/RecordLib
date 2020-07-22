import React from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import FormGroup from "@material-ui/core/FormGroup";
import { makeStyles } from "@material-ui/core/styles";

import EditField from "./EditField";
import Sentences from "./Sentences";
import PredictGradeButton from "./PredictGradeButton";
import GradeTable from "./GradeTable";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginRight: "2rem",
    marginLeft: "2rem",
  },
  toolButton: {
    position: "absolute",
    left: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
}));

/**
 * Component to edit a charge, including supplying values to a newly-created charge.
 */
function EditCharge(props) {
  const classes = useStyles();

  const { charge, gradePredictions, modifier } = props;
  const {
    id,
    offense,
    grade,
    statute,
    disposition,
    disposition_date,
    sentences,
  } = charge;

  /**
   * This function starts with the modifier function, which expects a key,value pair
   * and returns a function which takes a key and returns a function which expects a value.
   */
  const getPropertyModifier = (key) => {
    return (value) => modifier(key, value);
  };

  return (
    <Grid container spacing={1} className={classes.root} id={id}>
      <Grid item xs={6}>
        <EditField
          item={offense}
          label="Offense"
          modifier={getPropertyModifier("offense")}
        />
      </Grid>
      <Grid item xs={6}>
        <EditField
          item={statute}
          label="Statute"
          modifier={getPropertyModifier("statute")}
        />
      </Grid>
      <Grid item xs={6}>
        <EditField
          item={disposition}
          label="Disposition"
          modifier={getPropertyModifier("disposition")}
        />
      </Grid>
      <Grid item xs={6}>
        <EditField
          type="date"
          item={disposition_date}
          label="Disposition Date"
          fieldType="date"
          modifier={getPropertyModifier("disposition_date")}
        />
      </Grid>
      <Grid item xs={6}>
        <FormGroup row className={classes.row}>
          <EditField
            item={grade}
            label="Grade"
            modifier={getPropertyModifier("grade")}
          />
          <PredictGradeButton class={classes.toolButton} {...charge} />
        </FormGroup>
      </Grid>
      {gradePredictions ? (
        <GradeTable
          gradePredictions={gradePredictions}
          modifier={getPropertyModifier("grade")}
        />
      ) : (
        <Grid item xs={6}>
          "No predictions made yet"
        </Grid>
      )}
      <Grid container item xs={12}>
        <Sentences sentences={sentences} chargeId={id} editing={true} />
      </Grid>
    </Grid>
  );
}

EditCharge.propTypes = {
  id: PropTypes.string,
  offense: PropTypes.string,
  grade: PropTypes.string,
  statute: PropTypes.string,
  disposition: PropTypes.string,
  disposition_date: PropTypes.string,
  sentences: PropTypes.array,
  modifier: PropTypes.func,
};

export default EditCharge;
