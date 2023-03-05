import * as NodeID3 from 'node-id3';
import isImage from 'src/util/isImage';
import { createCanvas, loadImage } from 'canvas';

function findMetadataByPath(path: string) {
  const tags = NodeID3.read(path);
  const image = null;

  if (isImage(tags.image)) {
    const imageBuffer = tags.image.imageBuffer;

    if (imageBuffer) {
      // image = `data:${tags.image.mime};base64,${imageBuffer.toString(
      //   'base64',
      // )}`;
      // image = `${imageBuffer.toString('base64')}`;
      // const img = await loadImage(imageBuffer);
      // const canvas = createCanvas(100, 100);
      // const ctx = canvas.getContext('2d');
      // ctx.drawImage(img, 0, 0, 100, 100);
      // const imageData = canvas
      //   .toDataURL('image/jpeg', 0.8)
      //   .replace(/^data:image\/jpeg;base64,/, '')
      //   .toString();
      // console.log('imageData:', imageData);
      // image = imageData;
    }
  }

  return {
    title: tags.title,
    length: tags.length,
    language: tags.language,
    trackNumber: tags.trackNumber,
    genre: tags.genre,
    artist: tags.artist,
    releaseTime: tags.artist,
    year: tags.artist,
    album: tags.album,
    // image: image,
  };
}

export function findAlbumArtByPath(path: string) {
  const tags = NodeID3.read(path);
  let image = null;

  if (isImage(tags.image)) {
    const imageBuffer = tags.image.imageBuffer;

    if (imageBuffer) {
      // image = `data:${tags.image.mime};base64,${imageBuffer.toString(
      //   'base64',
      // )}`;
      image = `${imageBuffer.toString('base64')}`;
    }
  }
  return image;
}

export default findMetadataByPath;
