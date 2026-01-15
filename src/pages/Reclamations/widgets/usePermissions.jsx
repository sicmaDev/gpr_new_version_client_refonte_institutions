import { useMemo } from "react";

export const usePermissions = (user, props) => {
  return useMemo(() => {
    const isAuthor = user.firstAndLastName === props.created_by;
    const hasAuthorization = props.authorize;

    const isTransmitter =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedBy;

    const isAffecter = user.firstAndLastName === props.assigned_by;
    const isAffectedUser = user.firstAndLastName === props.handled_by;
    const isAuthorButNotAffected = isAuthor && !isAffectedUser;
    // la réclamation est affectée à quelqu’un d’autre ?
    const isAffectedToSomeoneElse = props.handled_by && !isAffectedUser;
    const isAuthorAndIsAffected = isAuthor && isAffectedUser;
   
    const isAuthorWithAuthorization =
      isAuthor && hasAuthorization && !isTransmitter && !isAffecter && !isAffectedToSomeoneElse;

    const isTransmittedToUser =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedTo &&
      props.status === "SAVED" &&
      props.addR === "MOLDUE";

  

    const isUserOpenSession =
      props.session && user.firstAndLastName === props.session?.createdBy?.firstAndLastName;

    const isRa = user.ra === true;
    const raCanOpenSession = (isRa && props.unit === user.servicePointDto.libelle) && !isTransmitter && !isAffecter && !isAffectedToSomeoneElse;
   
    return {
      isAuthor,
      hasAuthorization,
      isTransmitter,
      isAffecter,
      isAuthorWithAuthorization,
      isTransmittedToUser,
      isAffectedUser,
      isUserOpenSession,
      isRa,
      raCanOpenSession,
    };
  }, [user, props]);
};
