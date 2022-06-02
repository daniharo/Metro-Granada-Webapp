import type { NextPage } from "next";
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ParadasAnswer } from "../src/types";
import {
  Box,
  Center,
  CloseButton,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  ScaleFade,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import classes from "../styles/Home.module.css";
import { StarIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Head from "next/head";
import { UseCounterProps } from "@chakra-ui/react";
import useGeolocation from "../src/hooks/useGeolocation.js";
import { getNearestStopForLocation, isDataDeprecated } from "../src/utils";
import RightDrawer from "../components/Drawer";

interface Estimation {
  minutes: number;
  destination: string;
}

interface Stop {
  name: string;
  code: number;
  estimations: {
    Armilla: Estimation[];
    Albolote: Estimation[];
  };
  favourite: boolean;
}

interface IEstimationsProps {
  estimations: Estimation[];
  defaultDestination: string;
  decimals: number;
}
const Estimations: React.FC<IEstimationsProps> = ({
  estimations,
  defaultDestination,
  decimals,
}) => (
  <span>
    {estimations
      .slice(0, 2)
      .map((estimation) => {
        const complement =
          estimation.destination === defaultDestination ? "" : "*";
        return `${estimation.minutes.toFixed(decimals)}${complement}'`;
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

const processInfoParadas: (
  infoParadas: ParadasAnswer,
  favouriteStops: Set<number>
) => Map<number, Stop> = (infoParadas, favouriteStops) => {
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
      favourite: favouriteStops.has(code),
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
  return stops;
};

const DEFAULT_FAVOURITES = new Set<number>();

interface IStopRowProps {
  favourite: boolean;
  onToggleFavourite: React.MouseEventHandler<HTMLButtonElement>;
  name: string;
  estimationsArmilla: Estimation[];
  estimationsAlbolote: Estimation[];
  decimals: number;
  section?: "normal" | "nearest" | "favourites";
}
const StopRow: React.FC<IStopRowProps> = ({
  favourite,
  onToggleFavourite,
  name,
  decimals,
  estimationsAlbolote,
  estimationsArmilla,
  section = "normal",
}) => (
  <Tr bgColor={section === "nearest" ? "blue.50" : "none"}>
    <Td>
      <IconButton
        className={classes.favouriteButton}
        icon={<StarIcon />}
        size={"xs"}
        aria-label="Marcar como favorito"
        onClick={onToggleFavourite}
        color={favourite ? "yellow.400" : undefined}
      />
      {(favourite && section === "favourites") || section === "nearest" ? (
        <span className={classes.bold}>{name}</span>
      ) : (
        name
      )}
    </Td>
    <Td>
      <Estimations
        estimations={estimationsArmilla}
        defaultDestination="Armilla"
        decimals={decimals}
      />
    </Td>
    <Td>
      <Estimations
        estimations={estimationsAlbolote}
        defaultDestination="Albolote"
        decimals={decimals}
      />
    </Td>
  </Tr>
);

const Home: NextPage = () => {
  const router = useRouter();
  const [infoParadas, setInfoParadas] = useState<ParadasAnswer | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [decimals, setDecimals] = useState(0);
  const {
    isOpen: drawerIsOpen,
    onOpen: onOpenDrawer,
    onClose: onCloseDrawer,
  } = useDisclosure();
  const [favouriteStops, setFavouriteStops] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return DEFAULT_FAVOURITES;
    const localStorageItem = window.localStorage.getItem("favouriteStops");
    if (localStorageItem) {
      return new Set(JSON.parse(localStorageItem));
    }
    return DEFAULT_FAVOURITES;
  });
  const toast = useToast();
  const toastShown = useRef(false);
  const geolocation = useGeolocation({ enableHighAccuracy: true });
  const nearestStopCode = getNearestStopForLocation(geolocation);

  useEffect(() => {
    if (router.query.search) {
      setBusqueda(router.query.search as string);
    }
  }, [router.query.search]);

  useEffect(() => {
    window.localStorage.setItem(
      "favouriteStops",
      JSON.stringify(Array.from(favouriteStops))
    );
  }, [favouriteStops]);

  const handleFavStop = (stopCode: number) => {
    setFavouriteStops((prev) => {
      const copy = new Set(prev);
      if (prev.has(stopCode)) {
        copy.delete(stopCode);
      } else {
        copy.add(stopCode);
      }
      return copy;
    });
  };

  const handleChangeBusqueda: ChangeEventHandler<HTMLInputElement> = (event) =>
    setBusqueda(event.target.value);

  const handleChangeDecimales: UseCounterProps["onChange"] = (_, value) =>
    setDecimals(value);

  const fetchData = useCallback(async () => {
    const respuesta = await fetch("/api/paradas");
    const respuestaJSON: ParadasAnswer = await respuesta.json();
    if (isDataDeprecated(respuestaJSON.CargaFin) && !toastShown.current) {
      toast({
        title: "Información no actualizada",
        description: `La información de llegada del siguiente vehículo a la parada no está actualizada.\nÚltima actualización disponible: ${respuestaJSON.cargaInicio}`,
        status: "error",
        isClosable: true,
        duration: null,
      });
      toastShown.current = true;
    }
    setInfoParadas(respuestaJSON);
  }, [toast]);

  useEffect(() => {
    fetchData();
    setInterval(fetchData, 7000);
  }, [fetchData]);

  if (infoParadas === null) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const paradasProcesadas = processInfoParadas(infoParadas, favouriteStops);

  const paradasFiltradas = Array.from(paradasProcesadas.values()).filter(
    (parada) =>
      normalizarString(parada.name).includes(normalizarString(busqueda))
  );

  const favouriteStopsObjects = Array.from(favouriteStops).map((code) =>
    paradasProcesadas.get(code)
  );

  const nearestStop =
    nearestStopCode !== null ? paradasProcesadas.get(nearestStopCode) : null;

  return (
    <div className={classes.home}>
      <Head>
        <title>Metropolitano de Granada - Tiempos de paso (NO OFICIAL)</title>
      </Head>
      <Box display="flex">
        <InputGroup mr={2}>
          <Input
            autoFocus={busqueda.length > 0}
            placeholder="Busca una parada"
            onChange={handleChangeBusqueda}
            value={busqueda}
          />
          <ScaleFade initialScale={0.9} in={busqueda.length > 0}>
            <InputRightElement>
              <CloseButton
                aria-label="Borrar búsqueda"
                onClick={() => setBusqueda("")}
              />
            </InputRightElement>
          </ScaleFade>
        </InputGroup>
        <IconButton
          aria-label="Abrir menú"
          icon={<HamburgerIcon />}
          onClick={onOpenDrawer}
        />
      </Box>
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
            {nearestStop && (
              <>
                <Thead>
                  <Tr>
                    <Th>Más cercana</Th>
                  </Tr>
                </Thead>
                <StopRow
                  key={nearestStop.code}
                  favourite={favouriteStops.has(nearestStop.code)}
                  onToggleFavourite={() => handleFavStop(nearestStop.code)}
                  name={nearestStop.name}
                  estimationsArmilla={nearestStop.estimations.Armilla}
                  estimationsAlbolote={nearestStop.estimations.Albolote}
                  decimals={decimals}
                  section="nearest"
                />
              </>
            )}
            {busqueda.length === 0 && favouriteStopsObjects.length > 0 && (
              <>
                <Thead>
                  <Tr>
                    <Th>Favoritas</Th>
                  </Tr>
                </Thead>
                {favouriteStopsObjects.map((parada) =>
                  parada ? (
                    <StopRow
                      key={parada.code}
                      favourite={favouriteStops.has(parada.code)}
                      onToggleFavourite={() => handleFavStop(parada.code)}
                      name={parada.name}
                      estimationsArmilla={parada.estimations.Armilla}
                      estimationsAlbolote={parada.estimations.Albolote}
                      decimals={decimals}
                      section="favourites"
                    />
                  ) : null
                )}
              </>
            )}
            {nearestStop && (
              <Thead>
                <Tr>
                  <Th>{busqueda.length === 0 ? "Todas" : "Búsqueda"}</Th>
                </Tr>
              </Thead>
            )}
            {paradasFiltradas.map((parada) => (
              <StopRow
                key={parada.code}
                favourite={favouriteStops.has(parada.code)}
                onToggleFavourite={() => handleFavStop(parada.code)}
                name={parada.name}
                estimationsArmilla={parada.estimations.Armilla}
                estimationsAlbolote={parada.estimations.Albolote}
                decimals={decimals}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <RightDrawer
        isOpen={drawerIsOpen}
        onClose={onCloseDrawer}
        lastDataTime={infoParadas.cargaInicio}
        onChangeDecimals={handleChangeDecimales}
        decimals={decimals}
      />
    </div>
  );
};

export default Home;
