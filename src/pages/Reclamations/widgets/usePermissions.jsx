import { useMemo } from "react";

export const usePermissions = (user, props) => {
  return useMemo(() => {
    const isAuthor = user.firstAndLastName === props.created_by;
    const hasAuthorization = props.authorize;

    const isTransmitter =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedBy;

    // "A perdu la main suite à une transmission" : transmittedBy/transmittedTo
    // sont écrasés à chaque nouvelle transmission, donc isTransmitter (basé sur
    // transmittedBy) ne détecte que le tout dernier expéditeur direct. Dès que
    // la chaîne dépasse un saut (A→B→C), un intermédiaire comme A n'est plus
    // "transmittedBy" mais n'est pas non plus le destinataire actuel — il doit
    // quand même être exclu. On vérifie donc l'inverse : est-on le détenteur
    // actuel (transmittedTo), ou la plainte n'a-t-elle jamais été transmise ?
    const hasLostHandToTransmission =
      props.transmitted !== "false" &&
      user.firstAndLastName !== props.transmittedTo;

    const isAffecter = user.firstAndLastName === props.assigned_by;
    const isAffectedUser = user.firstAndLastName === props.handled_by;
    const isAuthorButNotAffected = isAuthor && !isAffectedUser;
    // la réclamation est affectée à quelqu’un d’autre ?
    const isAffectedToSomeoneElse = props.handled_by && !isAffectedUser;
    const isAuthorAndIsAffected = isAuthor && isAffectedUser;

    const isAuthorWithAuthorization =
      isAuthor && hasAuthorization && !hasLostHandToTransmission && !isAffecter && !isAffectedToSomeoneElse;

    const isTransmittedToUser =
      props.transmitted !== "false" &&
      user.firstAndLastName === props.transmittedTo &&
      props.status === "SAVED" &&
      props.addR === "MOLDUE";

  

    const isUserOpenSession =
      props.session && user.firstAndLastName === props.session?.createdBy?.firstAndLastName;

    const isRa = user.ra === true;
    const raCanOpenSession = (isRa && props.unit === user.servicePointDto.libelle) && !hasLostHandToTransmission && !isAffecter && !isAffectedToSomeoneElse;

    return {
      isAuthor,
      hasAuthorization,
      isTransmitter,
      hasLostHandToTransmission,
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
