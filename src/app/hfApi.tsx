import StringifyWithFloats from "stringify-with-floats";

export const CONFIGS = Object.freeze({
  generation: {
    model: "bigscience/bloom",
    parameters: {
      max_new_tokens: {
        type: "int",
        min: 0,
        max: 250,
        default: 150,
      },
      temperature: {
        type: "float",
        min: 0.0,
        max: 100.0,
        default: 0.9,
      },
      top_k: {
        type: "int",
        min: 1,
        max: 300,
        optional: true,
        default: 50,
      },
      top_p: {
        type: "float",
        min: 0,
        max: 1,
        optional: true,
        default: 0.9,
      },
      repetition_penalty: {
        type: "float",
        min: 0,
        max: 100,
        default: 60,
      },
    },
  },
  summarization: {
    model: "facebook/bart-large-cnn",
    parameters: {
      min_length: {
        type: "int",
        min: 0,
        max: 512,
        default: 256,
      },
      max_length: {
        type: "int",
        min: 0,
        max: 512,
        default: 512,
      },
      temperature: {
        type: "float",
        min: 0.0,
        max: 100.0,
        default: 1.0,
      },
      top_k: {
        type: "int",
        min: 1,
        max: 300,
        optional: true,
        default: 1,
      },
      top_p: {
        type: "float",
        min: 0,
        max: 1,
        optional: true,
        default: 1.0,
      },
      repetition_penalty: {
        type: "float",
        min: 0.1,
        max: 100,
        default: 0.1,
      },
    },
  },
});

export type Task = keyof typeof CONFIGS;
export type Configs = {
  [K in Task]: {
    model: typeof CONFIGS[K]["model"];
    parameters: Parameters<K>;
  };
};
export type Parameters<K extends Task> = {
  [P in keyof typeof CONFIGS[K]["parameters"]]: number;
};
export type Config = {
  task: Task;
  configs: Configs;
};

export function getInitialState(): Config {
  return {
    task: "generation",
    configs: {
      generation: {
        model: CONFIGS.generation.model,
        parameters: {
          max_new_tokens: CONFIGS.generation.parameters.max_new_tokens.default,
          temperature: CONFIGS.generation.parameters.temperature.default,
          top_k: CONFIGS.generation.parameters.top_k.default,
          top_p: CONFIGS.generation.parameters.top_p.default,
          repetition_penalty:
            CONFIGS.generation.parameters.repetition_penalty.default,
        },
      },
      summarization: {
        model: CONFIGS.summarization.model,
        parameters: {
          min_length: CONFIGS.summarization.parameters.min_length.default,
          max_length: CONFIGS.summarization.parameters.max_length.default,
          temperature: CONFIGS.summarization.parameters.temperature.default,
          top_k: CONFIGS.summarization.parameters.top_k.default,
          top_p: CONFIGS.summarization.parameters.top_p.default,
          repetition_penalty:
            CONFIGS.summarization.parameters.repetition_penalty.default,
        },
      },
    },
  };
}

const stringify = StringifyWithFloats(
  Object.values(CONFIGS).reduce((params, task_config_def) => {
    params = {
      ...params,
      ...Object.entries(task_config_def.parameters).reduce(
        (parameters, [param_name, param_def]) => {
          if (param_def.type === "float") {
            parameters[param_name as keyof Parameters<Task>] = "float";
          }
          return parameters;
        },
        {} as { [_: string]: string }
      ),
    };
    return params;
  }, {})
);

type Props = {
  hfToken: string;
  task: Task;
  config: Configs[Task];
  prompt: string;
};

export async function send({ hfToken, task, config, prompt }: Props) {
  const model = config.model;

  Object.entries(CONFIGS[task].parameters);

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: stringify({
        inputs: prompt,
        parameters: config.parameters,
        options: {
          use_cache: false,
          wait_for_model: true,
        },
      }),
    }
  );

  return response.json();
}
