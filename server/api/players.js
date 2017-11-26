const fs = require('fs');
const path = require('path');
const uuid = require('uuid/v1');
const router = require('express').Router();
const players = require('../db/players');

/**
 * Parses a picture encoded in a base64 string and returns its type and the actual data.
 *
 * @param {string} pictureData the picture data URL containing the base64 encoded picture
 * @return {Object|null} the decoded data object containing the image type and data if the
 *         data URL was matched, `null` otherwise
 */
function parseBase64(pictureData) {
  if (pictureData) {
    const matches = pictureData.match(/^data:image\/([A-Za-z]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      return { type: matches[1], data: matches[2] };
    }
  }

  return null;
}

/**
 * Retrieves the absolute path to a player's picture file.
 *
 * @param {string} filename the name of the picture file to retrieve the path for
 * @return {string} the absolute path to the specified picture file
 */
function getPicturePath(filename) {
  return path.resolve(__dirname, '../../web/picture', filename);
}

/**
 * Writes a picture from a base64 encoded data URL to a file.
 *
 * @param {string} picture the picture data as a base64 data URL
 * @return {string} the name of the picture file that was created or
 *         `null` if the picture data could not be parsed as a base64 string
 *
 */
function writePicture(picture) {
  let filename = null;
  const pictureData = parseBase64(picture);

  if (pictureData) {
    const { type, data } = pictureData;
    filename = `${uuid()}.${type}`;

    fs.writeFile(getPicturePath(filename), data, 'base64', (error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  return filename;
}

/**
 * Retrieves or the name of the current picture from two pictures.
 *
 * If the old picture and the new picture are the same, the old picture is reused.
 * Otherwise, a new picture is created from the new picture data. If the old picture
 * was located in the file system, it will be deleted.
 *
 * @param {string} oldPicture the filename of the old picture (possibly deleted)
 * @param {string} newPicture the picture data of the new picture (possibly created)
 * @return {string} the filename of the picture to use
 */
function getOrReplacePicture(oldPicture, newPicture) {
  if (oldPicture) {
    if (newPicture && newPicture.indexOf(oldPicture) > 0) {
      // the picture wasn't updated, so we reuse the existing one
      return oldPicture;
    }

    // pictures differ -> delete the old picture and create the new one
    const picturePath = getPicturePath(oldPicture);
    fs.unlink(picturePath, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  return writePicture(newPicture);
}

router.get('/', (req, res) => {
  players.get((result) => {
    res.send(result);
  });
});


router.post('/', (req, res) => {
  if (!req.body || !req.body.name) {
    res.sendStatus(400);
  } else {
    const { name, picture } = req.body;
    const filename = writePicture(picture);
    players.add(name, filename, (result) => {
      res.send(result);
    });
  }
});

router.put('/:id', (req, res) => {
  if (!req.body || !req.body.name) {
    res.sendStatus(400);
  } else {
    const { id } = req.params;
    const { name, picture } = req.body;

    players.find(id, (player) => {
      if (!player) {
        res.sendStatus(404);
      } else {
        const filename = getOrReplacePicture(player.picture, picture);
        players.update(id, name, filename, (isSuccess) => {
          if (isSuccess) {
            res.send({
              _id: id,
              name,
              picture: filename
            });
          } else {
            res.sendStatus(400);
          }
        });
      }
    });
  }
});

module.exports = router;
