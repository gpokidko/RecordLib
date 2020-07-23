import React, { useState } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import CRecordWrapper from "frontend/src/components/CRecord";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import { analyzeCRecord } from "frontend/src/actions/crecord";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
  return {
    paper: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(3),
    },
  };
});

function RecordPage(props) {
  const { crecordFetched, analyzeCRecord } = props;

  const styles = useStyles();

  const [redirectTo, setRedirectTo] = useState(null);

  function clickHandler(redirectDest) {
    return (e) => {
      e.preventDefault();
      setRedirectTo(redirectDest);
      analyzeCRecord();
    };
  }

  if (redirectTo !== null) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <Container>
      <Paper className={styles.paper}>
        <Typography variant="h3">Cases</Typography>
        <Typography variant="body2">Cases on the applicant's record</Typography>
        <Button type="submit" onClick={clickHandler("/analysis")}>
          {" "}
          Analyze{" "}
        </Button>
        {crecordFetched ? (
          <CRecordWrapper />
        ) : (
          <p> No Record yet (process for making a new record will go here) </p>
        )}
      </Paper>
    </Container>
  );
}

function mapStateToProps(state) {
  return { crecordFetched: state.crecord ? true : false };
}

function mapDispatchToProps(dispatch) {
  return {
    analyzeCRecord: () => {
      dispatch(analyzeCRecord());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordPage);
