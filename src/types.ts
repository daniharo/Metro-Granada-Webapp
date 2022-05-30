export interface ParadasAnswer {
  cargaInicio: String;
  CargaFin: String;
  DestinoArmilla: Destino<"Armilla">[];
  DestinoAlbolote: Destino<"Albolote">[];
}

export interface Destino<D extends "Armilla" | "Albolote"> {
  code: String;
  estimations: {
    compCode: String;
    compDistance: String;
    destination: D;
    lineCode: String;
    minutes: String;
    scheduled: boolean;
  }[];
  stationPoint: {
    code: String;
    name: String;
  };
}
