import * as NodeID3 from 'node-id3';

function isImage(
  image: string | Record<string, unknown>,
): image is Record<string, unknown> {
  return (
    typeof image !== 'string' && image !== undefined && 'imageBuffer' in image
  );
}

export default isImage;
