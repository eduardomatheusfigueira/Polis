
import { Archetype, Character, ArchetypeBackground, Temperament, Specialization } from '../types';

export const DEFAULT_ARCHETYPES: Archetype[] = [
    {
        id: 'arch_tycoon',
        name: 'Business Tycoon',
        description: 'A wealth-focused leader who runs the city like a company.',
        icon: '💼',
        background: 'TYCOON',
        baseStats: { charisma: 4, intelligence: 5, resources: 9 }
    },
    {
        id: 'arch_union',
        name: 'Union Leader',
        description: 'A champion of the working class and organized labor.',
        icon: '✊',
        background: 'UNION_LEADER',
        baseStats: { charisma: 7, intelligence: 5, resources: 3 }
    },
    {
        id: 'arch_intellectual',
        name: 'Technocrata',
        description: 'An expert focused on data-driven governance.',
        icon: '🧠',
        background: 'INTELLECTUAL',
        baseStats: { charisma: 3, intelligence: 9, resources: 4 }
    },
    {
        id: 'arch_outsider',
        name: 'Media Star',
        description: 'A famous personality shaking up the status quo.',
        icon: '⭐',
        background: 'OUTSIDER',
        baseStats: { charisma: 9, intelligence: 3, resources: 5 }
    }
];

export const DEFAULT_CHARACTERS: Character[] = [
    // Tycoon Characters
    {
        id: 'char_tycoon_1',
        name: 'Magnus Sterling',
        archetypeId: 'arch_tycoon',
        temperament: Temperament.RUTHLESS,
        specialization: Specialization.FUNDRAISER,
        description: 'A ruthless corporate raider who knows how to raise capital fast.',
        stats: { charisma: 0, intelligence: 0, resources: 0 }, // Modifiers
        flavourText: "Profit is the only policy that matters."
    },
    {
        id: 'char_tycoon_2',
        name: 'Victoria "Vee" Vanguard',
        archetypeId: 'arch_tycoon',
        temperament: Temperament.PRAGMATIC,
        specialization: Specialization.STRATEGIST,
        description: 'Calculated and efficient, she sees the city as a logistics puzzle.',
        stats: { charisma: 0, intelligence: 0, resources: 0 },
        flavourText: "Efficiency is the soul of governance."
    },

    // Union Characters
    {
        id: 'char_union_1',
        name: 'Joe "The Hammer" Steel',
        archetypeId: 'arch_union',
        temperament: Temperament.IDEALIST,
        specialization: Specialization.ORATOR,
        description: 'A fiery speaker who can rally the masses in seconds.',
        stats: { charisma: 0, intelligence: 0, resources: 0 },
        flavourText: "Solidarity forever!"
    },
    {
        id: 'char_union_2',
        name: 'Sarah Bridges',
        archetypeId: 'arch_union',
        temperament: Temperament.PRAGMATIC,
        specialization: Specialization.OPERATOR,
        description: 'She knows how to cut deals behind closed doors to get workers paid.',
        stats: { charisma: 0, intelligence: 0, resources: 0 },
        flavourText: "I don't need a speech, I need a contract."
    },

    // Intellectual Characters
    {
        id: 'char_intel_1',
        name: 'Dr. Alistair Wright',
        archetypeId: 'arch_intellectual',
        temperament: Temperament.PRAGMATIC,
        specialization: Specialization.STRATEGIST,
        description: 'A planner who anticipates problems before they happen.',
        stats: { charisma: 0, intelligence: 0, resources: 0 },
        flavourText: "The data suggests a 98% probability of success."
    },

    // Outsider Characters
    {
        id: 'char_out_1',
        name: 'Buzzer Beater',
        archetypeId: 'arch_outsider',
        temperament: Temperament.CHARISMATIC,
        specialization: Specialization.ORATOR,
        description: 'An ex-athlete turned beloved public figure.',
        stats: { charisma: 0, intelligence: 0, resources: 0 },
        flavourText: "Game on!"
    }
];
