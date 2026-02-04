
'use server';

/**
 * Retries a function with exponential backoff.
 * @param fn The asynchronous function to retry.
 * @param retries The maximum number of retries.
 * @param delay The initial delay in milliseconds.
 * @returns The result of the function if it succeeds.
 * @throws The error of the last attempt if all retries fail.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.message?.includes("503") || err.message?.includes("overloaded"))) {
      console.log(`Attempt failed. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}
