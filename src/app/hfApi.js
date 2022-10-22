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

export function getInitialState() {
  return {
    task: "generation",
    configs: {
      ...Object.entries(CONFIGS).reduce(
        (task_configs, [take_name, task_config_def]) => {
          task_configs[take_name] = {
            model: task_config_def.model,
            parameters: {
              ...Object.entries(task_config_def.parameters).reduce(
                (parameters, [param_name, param_def]) => {
                  parameters[param_name] = param_def.default;
                  return parameters;
                },
                {}
              ),
            },
          };
          return task_configs;
        },
        {}
      ),
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
            parameters[param_name] = "float";
          }
          return parameters;
        },
        {}
      ),
    };
    return params;
  }, {})
);

export async function send({ hfToken, task, config, prompt }) {
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
