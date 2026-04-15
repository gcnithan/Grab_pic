const searchService = require('../services/searchService');
const { success, error, validationError } = require('../utils/response');
const { HTTP_STATUS } = require('../config/constants');

async function searchFaces({ eventId, userId, imageBuffer, limit = 50 }) {

  if (!eventId || !userId) {
    return validationError(
      [{ field: 'eventId/userId', message: 'required' }]
    );
  }

  if (!imageBuffer || !imageBuffer.length) {
    return validationError(
      [{ field: 'selfie', message: 'required' }]
    );
  }

  try {

    const embedding =
      await searchService.getEmbeddingFromML(imageBuffer);

    const result =
      await searchService.searchFaces(
        eventId,
        userId,
        embedding,
        limit
      );

    return success({
      statusCode: HTTP_STATUS.OK,
      message: 'Search completed',
      data: result
    });

  } catch (err) {

    const isMlError =
      err.message && err.message.includes('ML');

    return error({
      statusCode: isMlError
        ? HTTP_STATUS.SERVICE_UNAVAILABLE
        : HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: isMlError
        ? 'ML service error'
        : 'Search failed',
      error: err
    });

  }
}

module.exports = { searchFaces };