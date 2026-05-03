import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { Writable } from 'stream';

/**
 * Create a ZIP archive from a directory
 */
export async function createZipFromDirectory(
  sourceDir: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    output.on('close', () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

/**
 * Create a ZIP archive and return as stream
 */
export function createZipStream(sourceDir: string): archiver.Archiver {
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.directory(sourceDir, false);
  archive.finalize();

  return archive;
}

/**
 * Create a ZIP from multiple files
 */
export async function createZipFromFiles(
  files: Array<{ path: string; content: string }>,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      console.log(`ZIP created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add each file to the archive
    for (const file of files) {
      archive.append(file.content, { name: file.path });
    }

    archive.finalize();
  });
}

/**
 * Get ZIP file size
 */
export async function getZipSize(zipPath: string): Promise<number> {
  const stats = await fs.stat(zipPath);
  return stats.size;
}

/**
 * Check if directory exists and is not empty
 */
export async function isDirectoryValid(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      return false;
    }

    const files = await fs.readdir(dirPath);
    return files.length > 0;
  } catch {
    return false;
  }
}

// Made with Bob
