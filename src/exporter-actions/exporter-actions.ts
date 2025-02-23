import { Actions } from "../actions/actions.js";
import zodToJsonSchema from "zod-to-json-schema";
import type { ActionsDefinitionsJsonDTO } from "./dtos/actions-definitions-json.dto.js";
import { get } from "@jondotsoy/utils-js/get";
import jsonSchemaToZod from "json-schema-to-zod";
import { actionDocumentTemplate } from "../gens-templates/action-document.template.js";

/** @deprecated by {@link actionDocumentTemplate} */
const templateAction = (
  actionNameSrc: string,
  descriptionSrc: string,
  inputSrc: string,
  outputSrc: string,
) => `    ${actionNameSrc}: {
      description: ${descriptionSrc},
      input: ${inputSrc},
      output: ${outputSrc},
    },`;

/** @deprecated by {@link actionDocumentTemplate} */
const template = (
  targetUrlSrc: string,
  actionsSrc: string,
  actionsTargetModuleLocation: string,
) => `import { z } from "zod";
import { ActionsTarget } from "${actionsTargetModuleLocation}";

const createActionsTarget = () =>
  new ActionsTarget(${targetUrlSrc}, {
${actionsSrc}
  }).compile();

export default createActionsTarget;
`;

type ToStringOptions = {
  fileLocation?: string;
  actionTargetModuleLocation?: string;
};

export class ActionsDocument {
  constructor(
    readonly targetUrl: URL,
    readonly actionsJson: any,
    readonly fileLocation?: string,
    readonly actionsTargetModuleLocation: string = "../../actions-target/actions-target.js",
  ) {}

  toString(options?: ToStringOptions) {
    const fileLocation =
      options?.fileLocation ?? this.fileLocation ?? process.cwd();
    const actionTargetModuleLocation =
      options?.actionTargetModuleLocation ?? this.actionsTargetModuleLocation;
    const toJsonZod = (value: Record<any, any> | undefined) => {
      if (value) return jsonSchemaToZod(value);
      return "undefined";
    };

    const actionsSrc = Array.from(
      Object.entries(this.actionsJson),
      ([name, actionDescription]) =>
        templateAction(
          JSON.stringify(name),
          JSON.stringify(get.string(actionDescription, "description")),
          toJsonZod(get.record(actionDescription, "input")),
          toJsonZod(get.record(actionDescription, "output")),
        ),
    ).join("\n");

    const targetUrlSrc = JSON.stringify(this.targetUrl.toString());

    return actionDocumentTemplate({
      fileLocation: fileLocation,
      actionTargetModuleLocation,
      actionsDocument: this,
    });
    // return template(targetUrlSrc, actionsSrc, this.actionsTargetModuleLocation);
  }

  static async fromHTTPServer(
    url: URL,
    cwd?: string,
    actionsTargetModuleLocation?: string,
  ) {
    const targetUrl = new URL("./__actions", url);
    const res = await fetch(targetUrl);
    const b = await res.json();
    const actionsJson = b.actions;
    return new ActionsDocument(
      targetUrl,
      actionsJson,
      cwd,
      actionsTargetModuleLocation,
    );
  }
}

export const actionsToJson = (actions: Actions): ActionsDefinitionsJsonDTO => {
  return Object.fromEntries(
    Array.from(
      Object.entries(Actions.describe(actions)),
      ([name, definition]) => [
        name,
        {
          description: definition.description ?? null,
          sse: definition.sse,
          input: definition.input
            ? zodToJsonSchema(definition.input, { target: undefined })
            : null,
          output: definition.output
            ? zodToJsonSchema(definition.output, { target: undefined })
            : null,
        },
      ],
    ),
  );
};

/** @deprecated by {@link ActionsDocument} */
export const importActionsFromJson = (
  json: any,
  target: string,
  uids = new Map<string, number>(),
) => {
  const id = (name: string) => {
    const index = uids.get(name) ?? 0;
    uids.set(name, index + 1);
    if (index === 0) return name;
    return `${name}_${index}`;
  };

  function* compile() {
    const definitions = get.record(json);
    if (!definitions) return null;
    for (const [name, definition] of Object.entries(definitions)) {
      const nameId = id(name);
      const description = get.string(definition, "description");
      const input: any = get(definition, "input");
      const output: any = get(definition, "output");

      const inputZodSrc = input ? jsonSchemaToZod(input, {}) : null;
      const outputZodSrc = output ? jsonSchemaToZod(output, {}) : null;

      const sources = {
        parts: {
          input: { js: inputZodSrc },
          output: { js: outputZodSrc },
        },
        chunkModule: {
          ts:
            "" +
            `export const ${nameId} = {\n` +
            `  description: ${JSON.stringify(description)},\n` +
            `  target: ${JSON.stringify(new URL(`./__actions/${name}`, target).toString())}\n` +
            `  input: ${inputZodSrc},\n` +
            `  output: ${outputZodSrc},\n` +
            `} as const;\n` +
            "\n",
        },
      };

      yield {
        documentId: nameId,
        name,
        description,
        sources,
      };
    }
  }

  const compiled = Array.from(compile());

  return (
    "" +
    `import { z } from "zod";\n` +
    "\n" +
    compiled
      .map(
        ({
          sources: {
            chunkModule: { ts },
          },
        }) => ts,
      )
      .join("") +
    ""
  );
};
