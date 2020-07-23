import React, { useState } from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import { EditPetitionFormConnected as EditPetitionForm } from "frontend/src/forms/EditPetition";
import { newPetition } from "frontend/src/actions/petitions";

/**
 * NewPetitionForm
 *
 * A button. If you click that button, create a form for editing a new petition. Give the new petition an ID.
 */
export const NewPetitionForm = (props) => {
  const {
    newPetitionId,
    editingPetitionId,
    newPetition,
    defaultAttorney,
    defaultServiceAgencies,
    defaultApplicantInfo,
  } = props;
  const [showEditForm, setShowEditForm] = useState(editingPetitionId !== null);

  console.log("editing petition id");
  console.log(editingPetitionId);

  const handleButtonClick = () => {
    newPetition(
      newPetitionId,
      defaultAttorney,
      defaultServiceAgencies,
      defaultApplicantInfo
    );
    setShowEditForm(true);
  };

  return (
    <div>
      <Button onClick={handleButtonClick}>New Petition</Button>
      {showEditForm && editingPetitionId ? (
        <EditPetitionForm petitionId={editingPetitionId} />
      ) : (
        <></>
      )}
    </div>
  );
};

const generatePetitionId = (petitionIds) => {
  return (Math.max(petitionIds.map((id) => parseInt(id))) + 1).toString();
};

const mapStateToProps = (state) => {
  console.log("is editinPetitionID set yet?");
  console.log(state.petitions.petitionCollection);
  return {
    newPetitionId: generatePetitionId(
      state.petitions.petitionCollection.petitionIds
    ),
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
