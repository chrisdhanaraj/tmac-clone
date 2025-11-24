import { createMatchRequest } from "../match-request.js";

export function action({ request }: { request: Request }) {
  return createMatchRequest(request);
}

export function loader() {
  return new Response("Method not allowed", { status: 405 });
}
