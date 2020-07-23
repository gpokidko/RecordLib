export const NEW_MESSAGE = "NEW_MESSAGE";
export const DISMISS_MESSAGE = "DISMISS_MESSAGE";

/** create an action to send a message to user.
 *
 * msg is shaped like:
 * {
 *  msgText: "some text",
 *  severity: "warning" | "error" | "info" | "success"
 * }
 */
export const newMessage = (msg) => {
  return {
    type: NEW_MESSAGE,
    payload: msg,
  };
};

export const dismissMessage = () => {
  return {
    type: DISMISS_MESSAGE,
  };
};
