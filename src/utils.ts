import axios from "axios";
import fs from "fs";
import path from "path";
import rimraf from "rimraf";

export const GQL_OUTPUT_FOLDER = "schema_documents";
export const SCHEMA_FILE = "schema.graphql";

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

export const isValidURL = (input: string) => {
  const pattern = /^((http|https):\/\/)/;
  return pattern.test(input);
};

const fetchAndWriteSchemaFromUrl = async (
  url: string,
  destinationPath: string,
) => {
  const result = await axios.get(url);
  await fs.writeFileSync(path.join(destinationPath, SCHEMA_FILE), result.data);
};

const fetchAndWriteSchemaFromPath = async (
  sourceFilePath: string,
  destinationPath: string,
) => {
  const result = fs.readFileSync(sourceFilePath);
  await fs.writeFileSync(path.join(destinationPath, SCHEMA_FILE), result);
};

export const getSchemaProcessingMethod = (schemaSource: string) => {
  const IS_URL = isValidURL(schemaSource);

  if (IS_URL) {
    return fetchAndWriteSchemaFromUrl;
  } else {
    return fetchAndWriteSchemaFromPath;
  }
};

export const removeTemporaryWorkingFiles = (destinationPath: string) => {
  rimraf.sync(GQL_OUTPUT_FOLDER);
  fs.copyFileSync(SCHEMA_FILE, path.join(destinationPath, SCHEMA_FILE));
  fs.unlinkSync(SCHEMA_FILE);
};
