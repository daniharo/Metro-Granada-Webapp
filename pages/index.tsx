import type { NextPage } from "next";
import { ChangeEventHandler, useCallback, useEffect, useState } from "react";
import { ParadasAnswer, Destino } from "../src/types";
import { Center, Input, Spinner } from "@chakra-ui/react";
import classes from "../styles/Home.module.css";

const normalizarString = (string: String) =>
  string
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const processInfoParadas = (infoParadas: ParadasAnswer) => {
  const paradas: {
    albolote: Destino<"Albolote">;
    armilla: Destino<"Armilla">;
  }[] = [];
  for (const parada of infoParadas.DestinoArmilla) {
    const codeParada = +parada.stationPoint.code.substring(0, 3);
    paradas[codeParada] = {
      armilla: parada,
      albolote: {
        code: "",
        stationPoint: { code: "", name: "" },
        estimations: [],
      },
    };
  }

  for (const parada of infoParadas.DestinoAlbolote) {
    const codeParada = +parada.stationPoint.code.substring(0, 3);
    paradas[codeParada] = { ...paradas[codeParada], albolote: parada };
  }

  return paradas;
};

const Home: NextPage = () => {
  const [infoParadas, setInfoParadas] = useState<ParadasAnswer | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const handleChangeBusqueda: ChangeEventHandler<HTMLInputElement> = (event) =>
    setBusqueda(event.target.value);

  const fetchData = useCallback(async () => {
    const respuesta = await fetch("/api/paradas");
    setInfoParadas(await respuesta.json());
  }, []);

  useEffect(() => {
    fetchData();
    setInterval(fetchData, 7000);
  }, [fetchData]);

  if (infoParadas === null) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }

  const paradasProcesadas = processInfoParadas(infoParadas);

  const paradasFiltradas = paradasProcesadas.filter((parada) =>
    normalizarString(parada.armilla.stationPoint.name).includes(
      normalizarString(busqueda)
    )
  );

  const vistaParadas = paradasFiltradas.map((parada) => (
    <li key={+parada.albolote.stationPoint.code}>
      <strong>
        {parada.albolote.stationPoint.name.replace(" vía 2", "")}:{" "}
      </strong>
      {parada.albolote.estimations.length > 0 && (
        <>
          Albolote{" "}
          {parada.albolote.estimations
            .slice(0, 2)
            .map((estimation) => `${(+estimation.minutes).toFixed(1)}'`)
            .join(" - ")}
        </>
      )}
      {parada.albolote.estimations.length > 0 &&
        parada.armilla.estimations.length > 0 &&
        " ; "}
      {parada.armilla.estimations.length > 0 && (
        <>
          Armilla{" "}
          {parada.armilla.estimations
            .slice(0, 2)
            .map((estimation) => `${(+estimation.minutes).toFixed(1)}'`)
            .join(" - ")}
        </>
      )}
    </li>
  ));

  return (
    <div className={classes.home}>
      <Input placeholder="Busca una parada" onChange={handleChangeBusqueda} />
      <ul>{vistaParadas}</ul>
    </div>
  );
};

export default Home;
