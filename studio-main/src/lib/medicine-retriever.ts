
import medicines from '@/data/medicines.json';
import symptoms from '@/data/symptoms.json';

export type Medicine = {
    id: string;
    name: string;
    composition: string;
    uses: string[];
    side_effects: string[];
    price: string;
    manufacturer: string;
    type: string;
    dosage: string;
    description: string;
};

export async function retrieveMedicines(query: string): Promise<Medicine[]> {
    const lowercaseQuery = query.trim().toLowerCase();

    const relevantMedicineIds = new Set<string>();

    // 1. Direct Medicine Matches
    medicines.forEach(med => {
        if (
            med.name.toLowerCase().includes(lowercaseQuery) ||
            med.composition.toLowerCase().includes(lowercaseQuery)
        ) {
            relevantMedicineIds.add(med.id);
        }
    });

    // 2. Symptom Mapping Matches
    symptoms.forEach(sym => {
        if (lowercaseQuery.includes(sym.symptom.toLowerCase())) {
            sym.medicine_ids.forEach(id => relevantMedicineIds.add(id));
        }
    });

    // 3. Fallback: Check 'uses' in medicines if explicitly mentioned
    if (relevantMedicineIds.size === 0) {
        medicines.forEach(med => {
            if (med.uses.some(use => lowercaseQuery.includes(use.toLowerCase()))) {
                relevantMedicineIds.add(med.id);
            }
        });
    }

    const results = medicines.filter(med => relevantMedicineIds.has(med.id));

    // Return top 5 matches
    return results.slice(0, 5);
}
