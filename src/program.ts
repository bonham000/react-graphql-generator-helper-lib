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

/**
 * Read program input arguments.
 */
program
  .option("--schemaSource [value]", "url or file path to your GraphQL schema")
  .option("--outputFile [value]", "destination path to write the output to")
  .option("--configFile [value]", "file path you want to store the output")
  .option(
    "--copySchema [value]",
    "boolean flag to copy the schema file into the output folder, default false",
  )
  .parse(process.argv);

const {
  copySchema = false,
  outputFile = "",
  configFile = "./codegen.yml",
  schemaSource = process.env.SCHEMA_SOURCE,
} = program;

/**
 * Validate input.
 */
validateInputArguments(schemaSource, configFile);

/**
 * Run the program.
 */
(async () => {
  const schemaFn = getSchemaProcessingMethod(schemaSource);
  await schemaFn(schemaSource, "");

  await exec(
    `node gql-lib/gql.js --depthLimit 10 --schemaFilePath ./${SCHEMA_FILE} --destDirPath ${GQL_OUTPUT_FOLDER}`,
  );

  await exec(`graphql-codegen --config ${configFile}`);

  removeTemporaryWorkingFiles(outputFile, copySchema);
})();
