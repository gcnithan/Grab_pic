const { randomUUID } = require('crypto');
const { getPool } = require('../config/database');
const s3Util = require('../utils/s3');

const {
  ML_EMBEDDING_URL,
  PHOTO_PROCESSING_STATUS
} = require('../config/constants');

/* ---------------- ML EMBEDDING ---------------- */

async function getEmbeddingFromML(imageBuffer) {

  if (!ML_EMBEDDING_URL) {
    return Array(512).fill(0).map(() => Math.random() * 0.01);
  }

  const res = await fetch(ML_EMBEDDING_URL, {
    method: 'POST',
    body: imageBuffer,
    headers: { 'Content-Type': 'application/octet-stream' }
  });

  if (!res.ok) {
    throw new Error('ML service error');
  }

  const data = await res.json();

  return data.embedding || data;
}

/* ---------------- SEARCH ---------------- */

async function searchFaces(eventId, userId, embedding, limit = 50) {

  const pool = getPool();

  const vectorStr = `[${embedding.join(',')}]`;

  const { rows } = await pool.query(
    `SELECT photo_id,
            MAX(1 - (embedding <=> $1::vector)) AS score
     FROM faces
     WHERE event_id=$2
     GROUP BY photo_id
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