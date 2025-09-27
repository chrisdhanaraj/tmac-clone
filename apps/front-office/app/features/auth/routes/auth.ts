import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { auth } from "~/features/auth/api/auth.server"; // Adjust the path as necessary

export async function loader({ request }: LoaderFunctionArgs) {
  return auth.handler(request);
}

export async function action({ request }: ActionFunctionArgs) {
  return auth.handler(request);
}
