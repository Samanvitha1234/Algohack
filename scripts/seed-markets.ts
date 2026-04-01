import axios from "axios";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8787";

async function seed(): Promise<void> {
  const seeds = [
    {
      marketId: 1,
      wallet: "SEED_MAKER_1",
      side: "buy",
      outcome: "yes",
      price: 0.58,
      quantity: 250,
    },
    {
      marketId: 1,
      wallet: "SEED_MAKER_2",
      side: "sell",
      outcome: "yes",
      price: 0.6,
      quantity: 220,
    },
    {
      marketId: 1,
      wallet: "SEED_MAKER_3",
      side: "buy",
      outcome: "no",
      price: 0.42,
      quantity: 180,
    },
  ];

  for (const order of seeds) {
    await axios.post(`${backendUrl}/markets/${order.marketId}/orders`, order);
  }
  // eslint-disable-next-line no-console
  console.log("Seed orders submitted");
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
