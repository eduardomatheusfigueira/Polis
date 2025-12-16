import { EconomicStance, SocialStance, ArchetypeBackground } from '../types';

interface TraitDefinition {
    label: string;
    description: string;
    bonus: string;
    malus: string;
    stats?: {
        charisma: number;
        intelligence: number;
        resources: number;
    };
}

export const ECONOMIC_STANCES: Record<EconomicStance, TraitDefinition> = {
    'NEOLIBERAL': {
        label: 'Neoliberal',
        description: 'Focus on free markets, privatization, and austerity.',
        bonus: '+20% Funds Generation (Private Sector confidence)',
        malus: '-10% Popularity among Working Class'
    },
    'DEVELOPMENTALIST': {
        label: 'Developmentalist',
        description: 'State-driven industrialization and infrastructure.',
        bonus: '+15% Infrastructure Growth Speed',
        malus: '-10% Budget Efficiency (High public spending)'
    },
    'SOCIAL_DEMOCRAT': {
        label: 'Social Democrat',
        description: 'Balanced market with strong welfare state.',
        bonus: '+15% General Popularity (Social Programs)',
        malus: '-15% Funds from Investment (Corporate tax)'
    },
    'LIBERTARIAN': {
        label: 'Libertarian',
        description: 'Minimal state intervention, max deregulation.',
        bonus: '+25% Corporate Support & Donations',
        malus: '-20% Public Services Quality & Satisfaction'
    },
    'CENTR_ECON': {
        label: 'Pragmatic Center',
        description: 'Mix of policies for stability.',
        bonus: '+10% Stability (Resistant to crises)',
        malus: 'No distinct advantage in growth or funds'
    }
};

export const SOCIAL_STANCES: Record<SocialStance, TraitDefinition> = {
    'CONSERVATIVE': {
        label: 'Conservative',
        description: 'Uphold traditional values and institutions.',
        bonus: 'High Support from Religious & Elderly groups',
        malus: 'Low Support from Youth & Artists'
    },
    'PROGRESSIVE': {
        label: 'Progressive',
        description: 'Advocate for social justice and reform.',
        bonus: 'High Support from Youth & Minorities',
        malus: 'High Opposition from Traditional sectors'
    },
    'MODERATE': {
        label: 'Moderate',
        description: 'Avoid radical changes, seek consensus.',
        bonus: 'Easier Coalition building',
        malus: 'Low Voter Enthusiasm (Harder to rally base)'
    },
    'RADICAL': {
        label: 'Radical',
        description: 'Seek fundamental structural change.',
        bonus: '+20% Base Enthusiasm (Zealous supporters)',
        malus: '-30% Relations with Institutions'
    },
    'TRADITIONALIST': {
        label: 'Traditionalist',
        description: 'Focus on heritage and old hierarchy.',
        bonus: '+15% Authority (Order/Security)',
        malus: '-15% Innovation & Modernization'
    }
};

export const ARCHETYPE_BACKGROUNDS: Record<ArchetypeBackground, TraitDefinition> = {
    'UNION_LEADER': {
        label: 'Union Leader',
        description: 'Rose through the ranks of labor movements.',
        bonus: 'Strike Power: Can mobilize protests cheaply.',
        malus: 'Distrusted by Business Elites.',
        stats: { charisma: 7, intelligence: 5, resources: 3 }
    },
    'TYCOON': {
        label: 'Business Tycoon',
        description: 'A self-made (or inherited) mogul entering politics.',
        bonus: 'Capital Injection: Cooldown to gain personal funds.',
        malus: 'Perceived as out of touch.',
        stats: { charisma: 4, intelligence: 5, resources: 9 }
    },
    'INTELLECTUAL': {
        label: 'Intellectual',
        description: 'Academic or expert with deep technical knowledge.',
        bonus: 'Evidence-Based: Policy proposals cost less energy/budget.',
        malus: 'Struggles to connect emotionally.',
        stats: { charisma: 3, intelligence: 9, resources: 4 }
    },
    'OUTSIDER': {
        label: 'Media Outsider',
        description: 'Celebrity or personality outside the system.',
        bonus: 'Media Circus: TV appearances have double effect.',
        malus: 'Lack of political know-how (Lower legislative success).',
        stats: { charisma: 9, intelligence: 3, resources: 5 }
    },
    'MILITARY': {
        label: 'Ex-Military',
        description: 'Former disciplinarian focused on order.',
        bonus: 'Iron Hand: +20% Security effectiveness.',
        malus: 'Authoritarian drift scares civil society.',
        stats: { charisma: 5, intelligence: 5, resources: 5 }
    },
    'INFLUENCER': {
        label: 'Digital Influencer',
        description: 'Star of the new digital age.',
        bonus: 'Viral Campaign: Online ads are 50% cheaper.',
        malus: 'Volatile support (Short attention span).',
        stats: { charisma: 8, intelligence: 4, resources: 6 }
    }
};
