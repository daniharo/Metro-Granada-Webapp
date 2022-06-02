export interface ParadasAnswer {
  cargaInicio: string;
  CargaFin: string;
  DestinoArmilla: Destino<"Armilla">[];
  DestinoAlbolote: Destino<"Albolote">[];
}

export interface Destino<D extends "Armilla" | "Albolote"> {
  code: string;
  estimations: {
    compCode: string;
    compDistance: string;
    destination: D;
    lineCode: string;
    minutes: string;
    scheduled: boolean;
  }[];
  stationPoint: {
    code: string;
    name: string;
  };
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}
