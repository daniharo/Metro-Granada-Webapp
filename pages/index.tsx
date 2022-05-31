import type { NextPage } from "next";
import React, {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ParadasAnswer } from "../src/types";
import {
  Box,
  Center,
  chakra,
  CloseButton,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
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
} from "@chakra-ui/react";
import classes from "../styles/Home.module.css";
import { StarIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Head from "next/head";
import { UseCounterProps } from "@chakra-ui/react";

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
  favourite: boolean;
}

interface IEstimationsProps {
  estimations: Estimation[];
  defaultDestination: String;
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
) => Stop[] = (infoParadas, favouriteStops) => {
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
  return Array.from(stops.values());
};

const DEFAULT_FAVOURITES = new Set<number>();

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
    setInfoParadas(await respuesta.json());
  }, []);

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

  const paradasFiltradas = paradasProcesadas.filter((parada) =>
    normalizarString(parada.name).includes(normalizarString(busqueda))
  );

  const paradasOrdenadas = paradasFiltradas.sort((a, b) => {
    if (a.favourite && !b.favourite) return -1;
    if (!a.favourite && b.favourite) return 1;
    return a.code < b.code ? -1 : a.code === b.code ? 0 : 1;
  });

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
            {paradasOrdenadas.map((parada) => (
              <Tr key={parada.code}>
                <Td>
                  <IconButton
                    className={classes.favouriteButton}
                    icon={<StarIcon />}
                    size={"xs"}
                    aria-label="Marcar como favorito"
                    onClick={() => handleFavStop(parada.code)}
                    color={
                      favouriteStops.has(parada.code) ? "yellow.400" : undefined
                    }
                  />
                  {favouriteStops.has(parada.code) ? (
                    <span className={classes.bold}>{parada.name}</span>
                  ) : (
                    parada.name
                  )}
                </Td>
                <Td>
                  <Estimations
                    estimations={parada.estimations.Armilla}
                    defaultDestination="Armilla"
                    decimals={decimals}
                  />
                </Td>
                <Td>
                  <Estimations
                    estimations={parada.estimations.Albolote}
                    defaultDestination="Albolote"
                    decimals={decimals}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Drawer isOpen={drawerIsOpen} onClose={onCloseDrawer}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader></DrawerHeader>

          <DrawerBody>
            <Flex flexDirection="column">
              <strong>Hora de los últimos datos:</strong>
              <chakra.span mb={4}>{infoParadas.cargaInicio}</chakra.span>
              <FormLabel htmlFor="decimales">
                <strong>Decimales</strong>
              </FormLabel>
              <NumberInput
                id="decimales"
                value={decimals}
                onChange={handleChangeDecimales}
                min={0}
                max={3}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Home;
