import type { Route } from "@react-router/dev/routes";
import { generateWelcomeMessage } from '../welcome.js';

export function action({ request }: Route.ActionArgs) {
  return generateWelcomeMessage(request);
}

export function loader() {
  return new Response('Method not allowed', { status: 405 });
}