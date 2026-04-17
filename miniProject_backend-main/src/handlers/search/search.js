const searchController = require('../../controllers/searchController');
const { requireAttendeeMember } = require('../../middleware/authMiddleware');

function decodeBase64Image(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  const normalized = value.startsWith('data:image')
    ? value.split(',', 2)[1]
    : value;

  // Require a minimum length to avoid treating random small strings as images.
  if (!normalized || normalized.length < 64) return null;

  // Keep validation strict to reduce false positives from plain text payloads.
  if (!/^[A-Za-z0-9+/=\s]+$/.test(normalized)) return null;

  try {
    return Buffer.from(normalized.replace(/\s/g, ''), 'base64');
  } catch (_) {
    return null;
  }
}

function getBodyBuffer(event) {
  const contentType =
    event.headers?.['content-type'] ||
    event.headers?.['Content-Type'] ||
    '';

  if (event.body && typeof event.body === 'string' && contentType.includes('application/json')) {
    try {
      const payload = JSON.parse(event.body);
      const imageBase64 =
        payload?.imageBase64 ||
        payload?.selfie ||
        payload?.image ||
        payload?.data;

      const decoded = decodeBase64Image(imageBase64);
      if (decoded) return decoded;
    } catch (_) {
      return null;
    }
  }

  if (event.body && typeof event.body === 'string') {
    const decoded = decodeBase64Image(event.body);
    if (decoded) return decoded;
  }

  if (event.body && event.isBase64Encoded) {
    return Buffer.from(event.body, 'base64');
  }

  if (event.body && typeof event.body === 'string') {
    return Buffer.from(event.body, 'utf8');
  }

  return null;
}

exports.handler = async (event) => {

  const eventId = event.pathParameters?.eventId;

  const auth =
    await requireAttendeeMember(event, eventId);

  if (auth.error) return auth.error;

  const imageBuffer = getBodyBuffer(event);

  const limit =
    event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit, 10)
      : 50;

  return searchController.searchFaces({
    eventId,
    userId: auth.user.sub,
    imageBuffer,
    limit
  });
};