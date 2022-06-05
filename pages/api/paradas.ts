// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getParadasAnswer } from "../../src/util/api/paradas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const answer = await getParadasAnswer();
  res.status(200).setHeader("Content-Type", "application/json").send(answer);
}
