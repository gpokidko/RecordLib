/** Display an Analysis of a CRecord, and provide a button to navigate to downloading petitions.
 *
 */
import React from "react";
import { connect } from "react-redux";
import Container from "@material-ui/core/Container";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import PetitionDecision from "frontend/src/components/PetitionDecision";

function Analysis(props) {
  const { analysis } = props;

  return (
    <Container>
      <h2> Analysis </h2>
      {analysis.decisions ? (
        <div>
          <Button component={RouterLink} to="/petitions">
            Get Petitions
          </Button>
          {analysis.decisions.map((decision, idx) => {
            return <PetitionDecision key={idx} decision={decision} />;
          })}
        </div>
      ) : (
        <p> You should submit the record for analysis first. </p>
      )}
    </Container>
  );
}

function mapStateToProps(state) {
  if (state.analysis.analysis) {
    return { analysis: state.analysis.analysis };
  }
  return { analysis: {} };
}

export default connect(mapStateToProps)(Analysis);
