import { DOMAIN, SERVER_URLS } from "../../constants";

export const getParadasAnswer = async () => {
  const respuesta = await fetch(`${DOMAIN}${SERVER_URLS.PARADAS}`);
  const text = await respuesta.text();
  return text.trim();
};
