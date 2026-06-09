import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Write `content` to a file in the cache directory and open the native share sheet.
 * Replaces the web Blob + anchor-download pattern. Returns the file URI.
 */
export async function shareTextFile(
  filename: string,
  content: string,
  mimeType: string,
): Promise<string> {
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(content);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: filename });
  }
  return file.uri;
}
