import { NEW_MESSAGE, DISMISS_MESSAGE } from "frontend/src/actions/messages";

const initialState = {
  msgText: "",
  severity: "",
};

export default function messageReducer(state = initialState, action) {
  switch (action.type) {
    case NEW_MESSAGE: {
      return action.payload;
    }

    case DISMISS_MESSAGE: {
      return {
        msgText: "",
        severity: "",
      };
    }

    default:
      return state;
  }
  return state;
}
