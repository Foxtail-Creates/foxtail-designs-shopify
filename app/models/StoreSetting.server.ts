import db from "../db.server";
import type { Flower, Palette } from '@prisma/client';
import { Prisma } from '@prisma/client'


export type StoreOptions = {
    flowersAvailable: Flower[],
    palettesAvailable: Palette[]
}

export async function createStoreOptions() {
    // get flower options from database
    const flowers: Flower[] = (await db.flower.findMany()).filter((flower) => flower.imageLink !== null);

    // get palette options from database
    const palettes: Palette[] = await db.palette.findMany();

    return {
        flowersAvailable: flowers,
        palettesAvailable: palettes
    }
}