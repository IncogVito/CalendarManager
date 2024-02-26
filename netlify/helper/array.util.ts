
export function trimNestedArray<T>(planSlotsBySectors: T[][], sectorIndex: number, slotCurrentIndex: number) {
    if (sectorIndex >= planSlotsBySectors.length) {
        return [];
    }

    const trimmedPlan = planSlotsBySectors.slice(sectorIndex);

    if (slotCurrentIndex >= trimmedPlan[0].length) {
        trimmedPlan[0] = [];
    } else {
        trimmedPlan[0] = trimmedPlan[0].slice(slotCurrentIndex);
    }

    return trimmedPlan.filter(sector => sector.length > 0);

}