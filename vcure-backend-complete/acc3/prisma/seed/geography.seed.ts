import { PrismaClient } from '@prisma/client';

/**
 * Sec. 49 MASTER TABLES — Country, State, City
 * Starter set only. Extend via admin tooling or additional seed files as
 * V-Cure expands into new regions (Sec. 69 FUTURE DATABASE EXPANSION).
 */
export async function seedGeography(prisma: PrismaClient) {
  const countries = [
    { name: 'India', isoCode: 'IN', states: [
      { name: 'Andhra Pradesh', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur'] },
      { name: 'Karnataka', cities: ['Bengaluru', 'Mysuru'] },
      { name: 'Maharashtra', cities: ['Mumbai', 'Pune'] },
      { name: 'Delhi', cities: ['New Delhi'] },
    ] },
    { name: 'United States', isoCode: 'US', states: [
      { name: 'California', cities: ['San Francisco', 'Los Angeles'] },
      { name: 'New York', cities: ['New York City'] },
    ] },
    { name: 'United Kingdom', isoCode: 'GB', states: [
      { name: 'England', cities: ['London', 'Manchester'] },
    ] },
  ];

  for (const c of countries) {
    const country = await prisma.country.upsert({
      where: { isoCode: c.isoCode },
      update: { name: c.name },
      create: { name: c.name, isoCode: c.isoCode },
    });

    for (const s of c.states) {
      const state = await prisma.state.upsert({
        where: { countryId_name: { countryId: country.id, name: s.name } },
        update: {},
        create: { name: s.name, countryId: country.id },
      });

      for (const cityName of s.cities) {
        await prisma.city.upsert({
          where: { stateId_name: { stateId: state.id, name: cityName } },
          update: {},
          create: { name: cityName, stateId: state.id },
        });
      }
    }
  }

  console.log(`Seeded ${countries.length} countries with states and cities.`);
}
