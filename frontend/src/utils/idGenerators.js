export const generatePetitionId = (petitionIds) => {
  return (petitionIds.length === 0
    ? 1
    : Math.max(...petitionIds.map((id) => parseInt(id))) + 1
  ).toString();
};
