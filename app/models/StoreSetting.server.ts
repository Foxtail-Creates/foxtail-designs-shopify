import db from "../db.server";
import type { Flower, Palette } from '@prisma/client';
import { Prisma } from '@prisma/client'


export type StoreOptions = {
    flowersAvailable: Flower[],
    flowersExcluded: Flower[],
    palettesAvailable: Palette[],
    palettesExcluded: Palette[]
}

export async function createStoreOptions() {
    // get flower options from database
    const flowers: Flower[] = await db.flower.findMany();

    // get palette options from database
    const palettes: Palette[] = await db.palette.findMany();
    // for each palette, add to map. Make colors. 
    // TODO: image link?

    // TODO: get size options from database
    return {
        flowersAvailable: flowers,
        flowersExcluded: [],
        palettesAvailable: palettes,
        palettesExcluded: []
    }

}