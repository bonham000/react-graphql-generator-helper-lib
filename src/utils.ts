import axios from "axios";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";

/**
 * File path constants.
 */
export const GQL_OUTPUT_FOLDER = "schema_documents";
export const SCHEMA_FILE = "schema.graphql";

/**
 * Validate input program arguments.
 */
export const validateInputArguments = (
  schemaSource: string,
  configFile: string,
) => {
  if (!schemaSource) {
    throw new Error("schemaSource argument is required");
  } else if (!configFile) {
    throw new Error("configFile argument is required");
  }
};

/**
 * Simple helper to validate a string as a URL or not.
 */
export const isValidURL = (input: string) => {
  const pattern = /^((http|https):\/\/)/;
  return pattern.test(input);
};
/**
 * Fetch the schema file from a given URL.
 */
const fetchAndWriteSchemaFromUrl = async (
  url: string,
  destinationPath: string,
) => {
  try {
    const result = await axios.get(url);
    await fs.writeFileSync(
      path.join(destinationPath, SCHEMA_FILE),
      result.data,
    );
  } catch (err) {
    throw new Error(`Could not fetch schema from remote URL! Tried: ${url}`);
  }
};

/**
 * Fetch the schema file from a relative file path.
 */
const fetchAndWriteSchemaFromPath = async (
  sourceFilePath: string,
  destinationPath: string,
) => {
  const result = fs.readFileSync(sourceFilePath);
  await fs.writeFileSync(path.join(destinationPath, SCHEMA_FILE), result);
};

/**
 * Determine the method to fetch the GraphQL schema with.
 */
export const getSchemaProcessingMethod = (schemaSource: string) => {
  const IS_URL = isValidURL(schemaSource);

  if (IS_URL) {
    return fetchAndWriteSchemaFromUrl;
  } else {
    return fetchAndWriteSchemaFromPath;
  }
};

/**
 * Remove temporary working files used while this program is running.
 */
export const removeTemporaryWorkingFiles = (
  destinationPath: string,
  copySchema: boolean,
) => {
  rimraf.sync(GQL_OUTPUT_FOLDER);
  if (copySchema) {
    fs.copyFileSync(SCHEMA_FILE, path.join(destinationPath, SCHEMA_FILE));
  }

  fs.unlinkSync(SCHEMA_FILE);
};
