// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getParadasAnswer } from "../../src/util/api/paradas";

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const answer = await getParadasAnswer();
  return new Response(answer, {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}
