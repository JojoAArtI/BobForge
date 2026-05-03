import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Read JSON data from a file
 */
export async function readData<T>(filename: string): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readJson(filePath);
    return data;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw new Error(`Failed to read data from ${filename}`);
  }
}

/**
 * Write JSON data to a file
 */
export async function writeData<T>(filename: string, data: T): Promise<void> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeJson(filePath, data, { spaces: 2 });
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw new Error(`Failed to write data to ${filename}`);
  }
}

/**
 * Ensure a directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Read file content as string
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Write string content to file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath: string): Promise<void> {
  await fs.remove(filePath);
}

/**
 * Copy a file
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * List files in a directory
 */
export async function listFiles(dirPath: string): Promise<string[]> {
  const files = await fs.readdir(dirPath);
  return files;
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string): Promise<fs.Stats> {
  return await fs.stat(filePath);
}

// Made with Bob
