// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { DOMAIN, SERVER_URLS } from "../../src/constants";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const respuesta = await fetch(`${DOMAIN}${SERVER_URLS.PARADAS}`);
  const text = await respuesta.text();
  const trimmedText = text.trim();
  const json = JSON.parse(trimmedText);
  res.status(200).json(json);
}
