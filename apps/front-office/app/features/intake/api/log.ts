import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  console.log(body);
  return {
    body,
  };
}
