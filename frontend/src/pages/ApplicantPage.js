import React from "react";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import ApplicantHolderWrapper from "frontend/src/components/ApplicantHolder";
import NameSearch from "frontend/src/components/NameSearch";

const useStyles = makeStyles((theme) => {
  return {
    paper: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(3),
    },
  };
});
function GettingStarted(props) {
  const classes = useStyles();
  return (
    <Container>
      <Paper className={classes.paper}>
        <div className="gettingStarted">
          <ApplicantHolderWrapper />
        </div>
        <NameSearch />
      </Paper>
    </Container>
  );
}

export default GettingStarted;
