import type { Route } from "@react-router/dev/routes";
import { createMatchRequest } from '../match-request.js';

export function action({ request }: Route.ActionArgs) {
  return createMatchRequest(request);
}

export function loader() {
  return new Response('Method not allowed', { status: 405 });
}