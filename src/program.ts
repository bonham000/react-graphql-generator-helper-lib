#!/usr/bin/env node
import childProcess from "child_process";
import program from "commander";
import dotenv from "dotenv";
import util from "util";

dotenv.config();
const exec = util.promisify(childProcess.exec);

import {
  getSchemaProcessingMethod,
  GQL_OUTPUT_FOLDER,
  removeTemporaryWorkingFiles,
  SCHEMA_FILE,
  validateInputArguments,
} from "./utils";

program
  .option("--schemaSource [value]", "url or file path to your GraphQL schema")
  .option("--outputFile [value]", "destination path to write the output to")
  .option("--configFile [value]", "file path you want to store the output")
  .parse(process.argv);

const {
  configFile,
  outputFile = "",
  schemaSource = process.env.SCHEMA_SOURCE,
} = program;

validateInputArguments(schemaSource, configFile);

(async () => {
  const schemaFn = getSchemaProcessingMethod(schemaSource);
  await schemaFn(schemaSource, "");

  await exec(
    `gqlg --depthLimit 5 --schemaFilePath ./${SCHEMA_FILE} --destDirPath ${GQL_OUTPUT_FOLDER}`,
  );

  await exec(`graphql-codegen --config ${configFile}`);

  removeTemporaryWorkingFiles(outputFile);
})();
