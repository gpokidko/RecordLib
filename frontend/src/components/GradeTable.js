import React from "react";
import Grid from "@material-ui/core/Grid";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import GradeTableItem from "./GradeTableItem";

function GradeTable(props) {
  const { gradePredictions } = props;
  const somePredictions = gradePredictions
    .sort((el, el2) => el2[1] - el[1])
    .slice(0, 4);
  return (
    <Grid container item alignItems="flex-end" xs={6}>
      <ButtonGroup>
        {somePredictions.map(([grade, prob]) => {
          return (
            <GradeTableItem grade={grade} prob={prob} key={grade} {...props} />
          );
        })}
      </ButtonGroup>
    </Grid>
  );
}

export default GradeTable;
