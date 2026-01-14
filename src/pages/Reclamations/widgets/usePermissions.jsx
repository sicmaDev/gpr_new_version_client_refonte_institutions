import { useMemo } from "react";

export const usePermissions = (user, props) => {
  return useMemo(() => {
    const isAuthor = user.firstAndLastName === props.created_by;
    const hasAuthorization = props.authorize;

    const isTransmitter =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedBy;

    const isAffecter =
      user.firstAndLastName === props.assigned_by;

    const isAuthorWithAuthorization =
      isAuthor && hasAuthorization && !isTransmitter && !isAffecter;

    const isTransmittedToUser =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedTo &&
      props.status === "SAVED" &&
      props.addR === "MOLDUE";

    const isAffectedUser = user.firstAndLastName === props.handled_by;

    const isUserOpenSession =
      props.session && user.firstAndLastName === props.session?.createdBy?.firstAndLastName;

    const isRa = user.ra === true;
    const raCanOpenSession = (isRa && props.unit === user.servicePointDto.libelle) && !isTransmitter && !isAffecter;
   
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
