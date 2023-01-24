const { exportAllDeclaration } = require("@babel/types");
const fs = require("fs");
const { beforeEach } = require("node:test");
const path = require("path");
const Ajv = require("ajv").default;
const schema_dashboard_templates = require("../dashboard-template.schema.json");
const ajv = new Ajv();
const validate_dashboard_templates = ajv.compile(schema_dashboard_templates);

function toBeValidAgainstSchema(candidate, schema_validator) {
  const validation_result = schema_validator(candidate);
  const pass = validation_result;
  if (pass) {
    return {
      message: () => `that was valid`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `invalid against schema: ${JSON.stringify(schema_validator.errors)}`,
      pass: false,
    };
  }
}

expect.extend({
  toBeValidAgainstSchema,
});

describe("validate dashboard templates", () => {
  fs.readdirSync(path.resolve(__dirname, "../dashboards"))
    .filter((file) => file.endsWith(".json"))
    .filter((file) => file !== "dashboards.json")
    .forEach((f) => {
      it(`can validate the file: ${f}`, () => {
        const template = fs.readFileSync(
          path.resolve(path.resolve(__dirname, "../dashboards"), f),
          "utf8"
        );
        expect(JSON.parse(template)).toBeValidAgainstSchema(
          validate_dashboard_templates
        );
      });
    });
});
