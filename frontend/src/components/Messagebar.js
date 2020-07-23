import React, { useState } from "react";
import { connect } from "react-redux";
import Snackbar from "@material-ui/core/Snackbar";
import { dismissMessage } from "../actions/messages";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

const Messagebar = (props) => {
  const { message = {}, dismissMessage } = props;
  const { msgText, severity } = message;

  const open = msgText !== "";

  const handleClose = () => {
    dismissMessage();
  };

  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={open}
      onClose={handleClose}
      message={msgText}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    ></Snackbar>
  );
};

const mapStateToProps = (state) => {
  return {
    message: state.message,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dismissMessage: () => dispatch(dismissMessage()),
  };
};

export const MessagebarConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(Messagebar);
