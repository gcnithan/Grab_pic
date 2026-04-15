const searchController = require('../../controllers/searchController');
const { requireAttendeeMember } = require('../../middleware/authMiddleware');

function getBodyBuffer(event) {

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