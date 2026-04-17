const { randomUUID } = require('crypto');
const { getPool } = require('../config/database');
const s3Util = require('../utils/s3');

const {
  ML_EMBEDDING_URL,
  PHOTO_PROCESSING_STATUS,
  HTTP_STATUS
} = require('../config/constants');

/* ---------------- ML EMBEDDING ---------------- */

function createMlServiceError(message, statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE, cause = null) {
  const err = new Error(message);
  err.isMlServiceError = true;
  err.statusCode = statusCode;

  if (cause) {
    err.cause = cause;
  }

  return err;
}

function getMlProcessUrl() {
  const baseUrl = String(ML_EMBEDDING_URL || '').trim();
  if (!baseUrl) return '';

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  if (normalizedBase.endsWith('/process')) {
    return normalizedBase;
  }

  return `${normalizedBase}/process`;
}

function getMlTimeoutMs() {
  const value = Number.parseInt(process.env.ML_EMBEDDING_TIMEOUT_MS || '3500', 10);
  if (Number.isNaN(value) || value <= 0) return 3500;
  return value;
}

async function getEmbeddingFromML(imageBuffer) {
  if (!ML_EMBEDDING_URL) {
    return Array(512).fill(0).map(() => Math.random() * 0.01);
  }

  const imageBase64 = Buffer.from(imageBuffer).toString('base64');
  const mlProcessUrl = getMlProcessUrl();
  const timeoutMs = getMlTimeoutMs();

  let res;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    res = await fetch(mlProcessUrl, {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
  } catch (fetchErr) {
    if (fetchErr?.name === 'AbortError') {
      throw createMlServiceError(
        `ML request timed out after ${timeoutMs}ms`,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        fetchErr
      );
    }
    throw createMlServiceError('ML service unreachable', HTTP_STATUS.SERVICE_UNAVAILABLE, fetchErr);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let detail = '';
    try {
      const errorBody = await res.json();
      detail = errorBody?.detail ? ` - ${errorBody.detail}` : '';
    } catch (_) {
      // noop: keep generic message when response body is not JSON
    }

    const mappedStatusCode = res.status >= 500
      ? HTTP_STATUS.SERVICE_UNAVAILABLE
      : HTTP_STATUS.BAD_REQUEST;

    throw createMlServiceError(
      `ML service error: ${res.status}${detail}`,
      mappedStatusCode
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    throw createMlServiceError('Invalid response from ML service', HTTP_STATUS.SERVICE_UNAVAILABLE, parseErr);
  }

  if (!data.faces || data.faces.length === 0) {
    const noFaceErr = new Error('No face detected in search image');
    noFaceErr.statusCode = HTTP_STATUS.BAD_REQUEST;
    throw noFaceErr;
  }

  return data.faces[0].embedding;
}/* ---------------- SEARCH ---------------- */

async function searchFaces(eventId, userId, embedding, limit = 50) {

  const pool = getPool();

  const vectorStr = `[${embedding.join(',')}]`;

  const { rows } = await pool.query(
    `SELECT photo_id,
            MAX(1 - (embedding <=> $1::vector)) AS score
     FROM faces
     WHERE event_id=$2
     GROUP BY photo_id
     HAVING MAX(1 - (embedding <=> $1::vector)) > 0.40
     ORDER BY score DESC
     LIMIT $3`,
    [vectorStr, eventId, limit]
  );

  const searchLogId = randomUUID();

  await pool.query(
    `INSERT INTO search_logs (id,user_id,event_id)
     VALUES ($1,$2,$3)`,
    [searchLogId, userId, eventId]
  );

  const matches = [];

  for (const r of rows) {

    const photo = await pool.query(
      `SELECT id,storage_key
       FROM photos
       WHERE id=$1
         AND event_id=$2
         AND processing_status=$3`,
      [r.photo_id, eventId, PHOTO_PROCESSING_STATUS.PROCESSED]
    );

    if (photo.rows.length === 0) continue;

    const { url } =
      await s3Util.getPresignedDownloadUrl(
        photo.rows[0].storage_key
      );

    matches.push({
      photo_id: r.photo_id,
      score: parseFloat(r.score),
      thumbnail_url: url
    });
  }

  return {
    matches,
    search_log_id: searchLogId
  };
}

module.exports = {
  getEmbeddingFromML,
  searchFaces
};