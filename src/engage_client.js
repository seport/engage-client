/**
 * Interact with the Engage API
 */
import { getResource } from './async';

export const HOST = 'https://backend.engage.town/api';

// Headers for basic GET request which returns JSON
const HEADERS = new Headers({
  'Content-Type': 'json',
  Accept: 'json',
});

/**
 * getJSON
 * Use this for basic GET requests to get JSON
 * from the Engage API.
 *
 * @param endpointUrl - API endpoint. Appended to the HOST const
 * to create the complete URI.
 *  example: '/tags'
 */
export function getJSON(endpointUrl) {
  return getResource([], HOST, endpointUrl);
}
