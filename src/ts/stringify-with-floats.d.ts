declare module "stringify-with-floats" {
  export default function StringifyWithFloats(schema: {
    [_: string]: "float";
  }): (json: { [_: string]: any }) => string;
}
