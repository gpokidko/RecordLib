import React, { useState } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import { EditPetitionFormConnected as EditPetitionForm } from "frontend/src/forms/EditPetition";
import { newPetition } from "frontend/src/actions/petitions";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import { generatePetitionId } from "frontend/src/utils/idGenerators";

const useStyles = makeStyles((theme) => {
  return {
    paper: {
      padding: theme.spacing(3),
      marginTop: theme.spacing(3),
    },
  };
});
/**
 * NewPetitionForm
 *
 * A button. If you click that button, create a form for editing a new petition. Give the new petition an ID.
 */
export const NewPetitionForm = (props) => {
  const styles = useStyles();

  const {
    petitionIds,
    editingPetitionId,
    newPetition,
    defaultAttorney,
    defaultServiceAgencies,
    defaultApplicantInfo,
  } = props;
  const [showEditForm, setShowEditForm] = useState(editingPetitionId !== null);

  const handleButtonClick = () => {
    const newPetitionId = generatePetitionId(petitionIds);
    newPetition(
      newPetitionId,
      defaultAttorney,
      defaultServiceAgencies,
      defaultApplicantInfo
    );
    setShowEditForm(true);
  };

  return (
    <>
      <Paper className={styles.paper}>
        <Button onClick={handleButtonClick}>New Petition</Button>
      </Paper>
      {showEditForm && editingPetitionId ? (
        <Paper className={styles.paper}>
          <EditPetitionForm petitionId={editingPetitionId} />
        </Paper>
      ) : (
        <></>
      )}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    petitionIds: state.petitions.petitionCollection.petitionIds,
    editingPetitionId: state.petitions.petitionCollection.editingPetitionId,
    defaultAttorney: state.attorney,
    defaultApplicantInfo: state.applicantInfo,
    defaultServiceAgencies: state.serviceAgencies.result.map(
      (id) => state.serviceAgencies.entities[id].name
    ),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    newPetition: (
      newId,
      defaultAttorney,
      defaultServiceAgencies,
      defaultApplicantInfo
    ) => {
      const aliases = Object.entries(defaultApplicantInfo.aliases).map(
        ([id, alias]) => alias
      );
      dispatch(
        newPetition({
          id: newId,
          petition_type: "Expungement",
          attorney: defaultAttorney,
          service_agencies: defaultServiceAgencies,
          client: {
            ...defaultApplicantInfo.applicant,
            aliases: aliases,
          },
        })
      );
    },
  };
};

export const NewPetitionFormConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(NewPetitionForm);
