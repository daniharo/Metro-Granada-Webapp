import type { NextPage } from "next";
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ParadasAnswer } from "../src/types";
import {
  Center,
  IconButton,
  Input,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import classes from "../styles/Home.module.css";
import { StarIcon } from "@chakra-ui/icons";

interface Estimation {
  minutes: number;
  destination: String;
}

interface Stop {
  name: String;
  code: number;
  estimations: {
    Armilla: Estimation[];
    Albolote: Estimation[];
  };
}

interface IEstimationsProps {
  estimations: Estimation[];
  defaultDestination: String;
}
const Estimations: React.FC<IEstimationsProps> = ({
  estimations,
  defaultDestination,
}) => (
  <span>
    {estimations
      .slice(0, 2)
      .map((estimation) => {
        const complement =
          estimation.destination === defaultDestination ? "" : "*";
        return `${estimation.minutes.toFixed(1)}${complement}'`;
      })
      .join(" - ")}
  </span>
);

const getUniqueStationCode = (code: String) => +code.substring(0, 3);

const normalizarString = (string: String) =>
  string
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const processInfoParadas: (infoParadas: ParadasAnswer) => Stop[] = (
  infoParadas: ParadasAnswer
) => {
  const stops: Map<number, Stop> = new Map();
  for (const parada of infoParadas.DestinoArmilla) {
    if (parada.stationPoint === undefined) {
      continue;
    }
    const code = getUniqueStationCode(parada.stationPoint.code);
    stops.set(code, {
      name: parada.stationPoint.name.replace(" vía 1", ""),
      code: +parada.stationPoint.code.substring(0, 3),
      estimations: {
        Armilla: parada.estimations
          .filter((estimation) => estimation.minutes !== undefined)
          .map((estimation) => ({
            minutes: +estimation.minutes,
            destination: estimation.destination,
          })),
        Albolote: [],
      },
    });
  }
  for (const parada of infoParadas.DestinoAlbolote) {
    if (parada.stationPoint === undefined) {
      continue;
    }
    const code = getUniqueStationCode(parada.stationPoint.code);
    const stop = stops.get(code);
    if (stop) {
      stop.estimations.Albolote = parada.estimations
        .filter((estimation) => estimation.minutes !== undefined)
        .map((estimation) => ({
          minutes: +estimation.minutes,
          destination: estimation.destination,
        }));
    }
  }
  return Array.from(stops.values());
};

const Home: NextPage = () => {
  const [infoParadas, setInfoParadas] = useState<ParadasAnswer | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [favouriteStops, setFavouriteStops] = useState<Set<number>>(new Set());
  useEffect(() => {
    const localStorageFavouriteStops =
      window.localStorage.getItem("favouriteStops");
    if (!localStorageFavouriteStops) {
      return;
    }
    const parsed = JSON.parse(localStorageFavouriteStops);
    if (Array.isArray(parsed)) {
      setFavouriteStops(new Set(JSON.parse(localStorageFavouriteStops)));
    }
  }, []);
  useEffect(() => {
    window.localStorage.setItem(
      "favouriteStops",
      JSON.stringify(Array.from(favouriteStops))
    );
  }, [favouriteStops]);

  const handleFavStop = (stopCode: number) => {
    setFavouriteStops((prev) => prev.add(stopCode));
  };

  const handleChangeBusqueda: ChangeEventHandler<HTMLInputElement> = (event) =>
    setBusqueda(event.target.value);

  const fetchData = useCallback(async () => {
    const respuesta = await fetch("/MG_paradas.json");
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
    normalizarString(parada.name).includes(normalizarString(busqueda))
  );

  return (
    <div className={classes.home}>
      <Input placeholder="Busca una parada" onChange={handleChangeBusqueda} />
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Nombre de parada</Th>
              <Th>Armilla</Th>
              <Th>Albolote</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paradasFiltradas.map((parada) => (
              <Tr key={parada.code}>
                <Td>
                  <IconButton
                    className={classes.favouriteButton}
                    icon={<StarIcon />}
                    size={"xs"}
                    aria-label="Marcar como favorito"
                    onClick={() => handleFavStop(parada.code)}
                    color={
                      favouriteStops.has(parada.code) ? "yellow" : undefined
                    }
                  />
                  {parada.name}
                </Td>
                <Td>
                  <Estimations
                    estimations={parada.estimations.Armilla}
                    defaultDestination="Armilla"
                  />
                </Td>
                <Td>
                  <Estimations
                    estimations={parada.estimations.Albolote}
                    defaultDestination="Albolote"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Home;
