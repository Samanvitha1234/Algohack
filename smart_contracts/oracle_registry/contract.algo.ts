import { Contract, abimethod } from "@algorandfoundation/algorand-typescript";

export class OracleRegistryApp extends Contract {
  private readonly reporters = new Map<string, boolean>();
  private quorum: bigint = 2n;
  private admin: string = "";

  @abimethod({ onCreate: "require" })
  public create(adminReporter: string, quorum: bigint): void {
    this.admin = adminReporter;
    this.reporters.set(adminReporter, true);
    this.quorum = quorum;
  }

  @abimethod()
  public setReporter(reporter: string, isAllowed: boolean): void {
    this.assertAdmin();
    this.reporters.set(reporter, isAllowed);
  }

  @abimethod()
  public setQuorum(nextQuorum: bigint): void {
    this.assertAdmin();
    if (nextQuorum < 1n) {
      throw new Error("quorum must be >= 1");
    }
    this.quorum = nextQuorum;
  }

  @abimethod({ readonly: true })
  public isReporter(reporter: string): boolean {
    return this.reporters.get(reporter) ?? false;
  }

  @abimethod({ readonly: true })
  public getQuorum(): bigint {
    return this.quorum;
  }

  private assertAdmin(): void {
    // TODO: replace with txn sender checks once contract context auth helpers are wired.
    if (!this.admin) {
      throw new Error("app not initialized");
    }
  }
}
