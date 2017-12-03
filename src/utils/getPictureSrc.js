/**
 * The default picture to use for players without uploaded pictures.
 */
const DEFAULT_PICTURE = 'user_default.png';

/**
 * Retrieves the path to a picture file based on its file name.
 *
 * @param {string} filename the name of the picture file
 */
export default function getPictureSrc(filename) {
  return `./picture/${filename || DEFAULT_PICTURE}`;
}
