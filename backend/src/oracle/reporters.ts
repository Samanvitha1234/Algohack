export interface ReporterConfig {
  id: string;
  address: string;
  secret: string;
}

export const reporters: ReporterConfig[] = [
  { id: "reporter-1", address: "REPORTERADDR1ALGODEMO0000000000000000000000000000000", secret: "oracle-reporter-1" },
  { id: "reporter-2", address: "REPORTERADDR2ALGODEMO0000000000000000000000000000000", secret: "oracle-reporter-2" },
  { id: "reporter-3", address: "REPORTERADDR3ALGODEMO0000000000000000000000000000000", secret: "oracle-reporter-3" },
];

export const ORACLE_QUORUM = 2;
