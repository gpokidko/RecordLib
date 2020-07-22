import { combineReducers } from "redux";
import { NEW_PETITION, UPDATE_PETITION } from "frontend/src/actions/petitions";
import { normalizeOnePetition } from "frontend/src/normalize/petitions";
import { merge, pull, difference, pick, mergeWith } from "lodash";
import {
  NEW_CASE_FOR_PETITION,
  SET_PETITION_TO_EDIT,
  DELETE_PETITION,
  SET_SERVICE_AGENCIES_ON_PETITION,
} from "../actions/petitions";

/** Find the ids of charges related to a list of cases
 * that need to be deleted.
 */
function getChargeIdsFromCases(caseIdsToDelete, cases) {
  return caseIdsToDelete.reduce((acc, caseId) => {
    return acc.concat(cases[caseId].charges);
  }, []);
}

/**
 * Slice of state explaining if petitions are currently being collected from the server.
 * @param {} state
 * @param {*} action
 */
export function petitionsUpdatesReducer(
  state = { updateInProgress: false },
  action
) {
  switch (action.type) {
    case "FETCH_PETITIONS_SUCCEEDED":
      return { ...state, updateInProgress: false };
    default:
      return state;
  }
  return state;
}

const initialCollectionState = {
  entities: {
    petitions: {},
    cases: {},
    charges: {},
  },
  petitionIds: [],
  editingPetitionId: null,
};

/**
 * Slice of state with a collection of petitions that could be generated by the server.
 *
 * This is a normalized slice, shaped like:
 *
 * petitionCollection:
 *   entities:
 *     petitions: {}
 *     cases: {}
 *     charges: {}
 *   petitionIds: [petition-ids]
 */
export function petitionCollectionReducer(
  state = initialCollectionState,
  action
) {
  switch (action.type) {
    case NEW_PETITION: {
      // Add a new petition
      const newPetition = action.payload;
      // create a new id for this new petition, only if necessary.
      // (if the petitions is from the server, it'llneed a local ID.
      //  but if it was created locally, the New Petition component
      //  will come up with the new id.)
      const newId = newPetition.id || state.petitionIds.length.toString();
      const normalizedPetition = normalizeOnePetition(newPetition, newId);
      const newState = {
        entities: {
          petitions: merge({}, state.entities.petitions, {
            [newId]:
              normalizedPetition.entities.petitions[normalizedPetition.result],
          }),
          cases: merge(
            {},
            state.entities.cases,
            normalizedPetition.entities.cases
          ),
          charges: merge(
            {},
            state.entities.charges,
            normalizedPetition.entities.charges
          ),
        },
        petitionIds: [...state.petitionIds, newId],
        editingPetitionId: newId,
      };
      return newState;
    }
    case UPDATE_PETITION: {
      // Update a petition.

      // NB - to handle updates to things like cases, do I
      // normalize the updateObject with the PetitionSchema?
      const { petitionId, updateObject } = action.payload;

      const casesUpdate = updateObject.cases || null;
      if (casesUpdate) {
        delete updateObject.cases;
      }

      const newState = {
        editingPetitionId: state.editingPetitionId,
        petitionIds: [...state.petitionIds],
        entities: {
          petitions: merge({}, state.entities.petitions, {
            [petitionId]: merge(
              {},
              state.entities.petitions[petitionId],
              updateObject
            ),
          }),
          cases: { ...state.entities.cases },
          charges: { ...state.entities.charges },
        },
      };
      return newState;
    }

    case NEW_CASE_FOR_PETITION: {
      // Add a new case to a petition.
      const { petitionId, caseId, caseDefaults, chargeInfo } = action.payload;
      const newCaseIds = state.entities.petitions[petitionId].cases
        ? // set operation makes sure we're not duplicating cases.
          Array.from(
            new Set([...state.entities.petitions[petitionId].cases, caseId])
          )
        : [caseId];

      const newState = {
        editingPetitionId: state.editingPetitionId,
        petitionIds: [...state.petitionIds],
        entities: {
          petitions: merge({}, state.entities.petitions, {
            [petitionId]: merge({}, state.entities.petitions[petitionId], {
              cases: newCaseIds,
            }),
          }),
          cases: merge({}, state.entities.cases, {
            [caseId]: merge(
              {},
              {
                id: caseId,
                docket_number: caseId,
                editing: false,
              },
              caseDefaults
            ),
          }),
          charges: merge({}, state.entities.charges, chargeInfo),
        },
      };
      return newState;
    }

    case SET_SERVICE_AGENCIES_ON_PETITION: {
      console.log("setting service agencies:");

      const { petitionId, serviceAgencies } = action.payload;
      console.log(serviceAgencies);
      const newState = mergeWith(
        {},
        state,
        (objValue, srcValue, key, object, source, stack) => {
          console.log(`${objValue}, ${srcValue}, ${key}`);
          if (key === "service_agencies") {
            return serviceAgencies;
          }
          return undefined;
        }
      );
      console.log("modified state after setting petitions");
      console.log(newState);
      return newState;
    }

    case SET_PETITION_TO_EDIT: {
      const { petitionId } = action.payload;
      return merge({}, state, { editingPetitionId: petitionId });
    }

    case DELETE_PETITION: {
      const { petitionId } = action.payload;
      const newPetitionIds = pull(state.petitionIds, petitionId);
      const caseIdsToDelete = state.entities.petitions[petitionId].cases || [];
      const caseIdsToKeep = difference(
        Object.keys(state.entities.cases),
        caseIdsToDelete
      );
      const chargeIdsToDelete = getChargeIdsFromCases(
        caseIdsToDelete,
        state.entities.cases
      );
      const chargeIdsToKeep = difference(
        Object.keys(state.entities.charges),
        chargeIdsToDelete
      );

      const newState = {
        editingPetitionId:
          state.editingPetitionId === petitionId
            ? null
            : state.editingPetitionId,
        petitionIds: newPetitionIds,
        entities: {
          petitions: pick(state.entities.petitions, newPetitionIds),
          cases: pick(state.entities.cases, caseIdsToKeep),
          charges: pick(state.entities.charges, chargeIdsToKeep),
        },
      };
      return newState;
    }
    default:
      return state;
  }
  return state;
}

const petitionsReducer = combineReducers({
  petitionUpdates: petitionsUpdatesReducer,
  petitionCollection: petitionCollectionReducer,
});

export default petitionsReducer;
