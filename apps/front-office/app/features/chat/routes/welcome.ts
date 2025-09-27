import { generateWelcomeMessage } from "../welcome.js";

export function action({ request }: { request: Request }) {
  return generateWelcomeMessage(request);
}

export function loader() {
  return new Response("Method not allowed", { status: 405 });
}
