export const getActionsDocumentTargetURL = (
  actionsName: string,
  shareActionsFileModule: URL,
) => new URL(`./remote_actions/${actionsName}.js`, shareActionsFileModule);
