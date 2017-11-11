/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '../server/config/config.js');

fs.copyFile(`${configPath}.dist`, configPath, fs.constants.COPYFILE_EXCL, (error) => {
  if (error) {
    if (error.code === 'EEXIST') {
      console.log(`${configPath} already exists, skipping...`);
    } else {
      throw error;
    }
  } else {
    console.log(`Copied configuration file to ${configPath}`);
  }
});
