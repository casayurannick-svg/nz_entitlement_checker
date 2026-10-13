import { db } from './index';
import {
  msdPostcodeAreas,
  rateTables,
  NewMsdPostcodeArea,
} from './schema';
import { sql } from 'drizzle-orm';
import { WFF_CONSTANTS_2026, WFF_CONSTANTS_2024 } from '../lib/calculator/wff';
import {
  AS_MAX_CAPS_2024,
  AS_ENTRY_THRESHOLDS_2024,
  AS_ASSET_LIMITS,
} from '../lib/calculator/accommodationSupplement';
import {
  FAMILYBOOST_CONSTANTS_2026,
  FAMILYBOOST_CONSTANTS_2024,
} from '../lib/calculator/familyBoost';

/**
 * Curated New Zealand Postcode Mapping to MSD Accommodation Supplement Areas (1 to 4)
 * Based on official Work and Income / MSD Social Security Regulations geographic classifications:
 * - Area 1: Auckland Urban + Queenstown Lakes District Urban (Highest housing costs)
 * - Area 2: Wellington Urban, Hutt, Porirua, Kapiti, Christchurch Urban, Tauranga, Western Bay of Plenty, Hamilton Urban, Nelson
 * - Area 3: Regional Cities and Provincial Centres (Whangārei, Rotorua, New Plymouth, Palmerston North, Napier, Hastings, Dunedin, Invercargill, etc.)
 * - Area 4: Rest of New Zealand (Rural districts, smaller towns, and offshore islands)
 */
export const NZ_POSTCODE_SEED_DATA: NewMsdPostcodeArea[] = [
  // ==========================================
  // AREA 1: Auckland Urban & Queenstown Lakes
  // ==========================================
  { postcode: '1010', suburb: 'Auckland Central', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1011', suburb: 'Ponsonby / Freemans Bay', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1021', suburb: 'Grey Lynn / Westmere', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1022', suburb: 'Point Chevalier / Westmere', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1023', suburb: 'Epsom / Newmarket', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1024', suburb: 'Mount Eden', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1025', suburb: 'Mount Albert', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1041', suburb: 'Mount Roskill', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1042', suburb: 'Hillsborough', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1050', suburb: 'Remuera', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1051', suburb: 'Greenlane / Ellerslie', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1052', suburb: 'Parnell', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1060', suburb: 'Mount Wellington', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1061', suburb: 'Onehunga / Penrose', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban Central' },
  { postcode: '1062', suburb: 'Otahuhu', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Urban South' },
  { postcode: '1071', suburb: 'Orakei / Mission Bay / Kohimarama', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Eastern Bays' },
  { postcode: '1072', suburb: 'St Heliers / Glendowie', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland Eastern Bays' },
  { postcode: '0600', suburb: 'New Lynn / Avondale', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0602', suburb: 'Glen Eden / Kelston', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0604', suburb: 'Titirangi / Green Bay', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0610', suburb: 'Henderson / Te Atatu South', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0612', suburb: 'Henderson Valley', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0614', suburb: 'Massey / Westgate', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0618', suburb: 'Hobsonville / West Harbour', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland West Urban' },
  { postcode: '0620', suburb: 'Milford / Castor Bay', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0622', suburb: 'Takapuna', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0624', suburb: 'Devonport / Belmont', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0626', suburb: 'Birkenhead / Birkdale', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0627', suburb: 'Northcote', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0629', suburb: 'Glenfield', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0630', suburb: 'Browns Bay / Torbay', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0632', suburb: 'Albany / Greenhithe', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland North Shore' },
  { postcode: '0930', suburb: 'Whangaparaoa / Gulf Harbour', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Hibiscus Coast Urban' },
  { postcode: '0931', suburb: 'Orewa', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Hibiscus Coast Urban' },
  { postcode: '0932', suburb: 'Silverdale / Millwater', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Hibiscus Coast Urban' },
  { postcode: '2010', suburb: 'Pakuranga', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2012', suburb: 'Half Moon Bay / Farm Cove', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2013', suburb: 'East Tamaki Heights', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2014', suburb: 'Howick / Cockle Bay', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2016', suburb: 'Botany Downs / Flat Bush', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2019', suburb: 'Flat Bush / Ormiston', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland East Urban' },
  { postcode: '2022', suburb: 'Mangere / Favona', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2023', suburb: 'Otara', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2024', suburb: 'Mangere East', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2025', suburb: 'Papatoetoe', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2102', suburb: 'Manurewa', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2103', suburb: 'Manurewa East', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2104', suburb: 'Manukau Central / Wiri', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2105', suburb: 'The Gardens / Randwick Park', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Auckland South Urban' },
  { postcode: '2110', suburb: 'Papakura Central', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Papakura Urban' },
  { postcode: '2112', suburb: 'Takanini / Conifer Grove', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Papakura Urban' },
  { postcode: '2113', suburb: 'Papakura / Rosehill / Opaheke', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Papakura Urban' },
  { postcode: '2120', suburb: 'Pukekohe', city: 'Auckland', region: 'Auckland Region', area: 1, notes: 'Franklin Urban Area 1' },
  { postcode: '9300', suburb: 'Queenstown Central / Frankton', city: 'Queenstown', region: 'Otago Region', area: 1, notes: 'Queenstown Lakes Urban' },
  { postcode: '9302', suburb: 'Arrowtown', city: 'Queenstown', region: 'Otago Region', area: 1, notes: 'Queenstown Lakes Urban' },
  { postcode: '9305', suburb: 'Wanaka', city: 'Wanaka', region: 'Otago Region', area: 1, notes: 'Queenstown Lakes Urban' },
  { postcode: '9371', suburb: 'Frankton / Kelvin Heights', city: 'Queenstown', region: 'Otago Region', area: 1, notes: 'Queenstown Lakes Urban' },

  // ==========================================
  // AREA 2: Wellington, Christchurch, Tauranga,
  //         Hamilton, Nelson, Kapiti Coast
  // ==========================================
  { postcode: '6011', suburb: 'Wellington Central / Te Aro', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6012', suburb: 'Thorndon / Northland / Karori', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6021', suburb: 'Newtown / Mount Cook / Berhampore', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6022', suburb: 'Kilbirnie / Miramar / Seatoun', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6023', suburb: 'Island Bay / Houghton Bay', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6035', suburb: 'Khandallah / Ngaio', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '6037', suburb: 'Johnsonville / Churton Park / Newlands', city: 'Wellington', region: 'Wellington Region', area: 2, notes: 'Wellington Urban' },
  { postcode: '5010', suburb: 'Lower Hutt Central / Belmont', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5011', suburb: 'Waterloo / Woburn', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5012', suburb: 'Petone / Korokoro', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5013', suburb: 'Eastbourne / Days Bay', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5014', suburb: 'Wainuiomata', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5016', suburb: 'Naenae / Fairfield', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5018', suburb: 'Upper Hutt Central / Silverstream', city: 'Upper Hutt', region: 'Wellington Region', area: 2, notes: 'Upper Hutt Urban' },
  { postcode: '5019', suburb: 'Stokes Valley', city: 'Lower Hutt', region: 'Wellington Region', area: 2, notes: 'Hutt Valley Urban' },
  { postcode: '5022', suburb: 'Porirua Central / Titahi Bay', city: 'Porirua', region: 'Wellington Region', area: 2, notes: 'Porirua Urban' },
  { postcode: '5024', suburb: 'Elsdon / Takapuwahia', city: 'Porirua', region: 'Wellington Region', area: 2, notes: 'Porirua Urban' },
  { postcode: '5026', suburb: 'Whitby / Papakowhai', city: 'Porirua', region: 'Wellington Region', area: 2, notes: 'Porirua Urban' },
  { postcode: '5028', suburb: 'Cannons Creek / Waitangirua', city: 'Porirua', region: 'Wellington Region', area: 2, notes: 'Porirua Urban' },
  { postcode: '5032', suburb: 'Paraparaumu / Raumati Beach', city: 'Kapiti Coast', region: 'Wellington Region', area: 2, notes: 'Kapiti Coast Urban' },
  { postcode: '5034', suburb: 'Paekakariki', city: 'Kapiti Coast', region: 'Wellington Region', area: 2, notes: 'Kapiti Coast Urban' },
  { postcode: '5036', suburb: 'Waikanae', city: 'Kapiti Coast', region: 'Wellington Region', area: 2, notes: 'Kapiti Coast Urban' },
  { postcode: '8011', suburb: 'Christchurch Central', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8013', suburb: 'Shirley / Richmond', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8014', suburb: 'St Albans / Merivale', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8022', suburb: 'Cashmere / Huntsbury', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8023', suburb: 'Sydenham / Beckenham', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8024', suburb: 'Addington / Spreydon', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8025', suburb: 'Halswell', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8041', suburb: 'Riccarton / Ilam', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8042', suburb: 'Hornby / Sockburn', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8051', suburb: 'Belfast / Redwood', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8052', suburb: 'Papanui / Fendalton', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8053', suburb: 'Burnside / Avonhead', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8061', suburb: 'Wainoni / Aranui', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8062', suburb: 'Linwood / Woolston', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8081', suburb: 'Sumner / Redcliffs', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '8083', suburb: 'New Brighton / Parklands', city: 'Christchurch', region: 'Canterbury', area: 2, notes: 'Christchurch Urban' },
  { postcode: '7400', suburb: 'Rangiora', city: 'Waimakariri', region: 'Canterbury', area: 2, notes: 'North Canterbury Urban Area 2' },
  { postcode: '7614', suburb: 'Rolleston', city: 'Selwyn', region: 'Canterbury', area: 2, notes: 'Selwyn Urban Area 2' },
  { postcode: '3110', suburb: 'Tauranga Central / Otumoetai / Bethlehem', city: 'Tauranga', region: 'Bay of Plenty', area: 2, notes: 'Tauranga Urban' },
  { postcode: '3112', suburb: 'Greerton / Welcome Bay', city: 'Tauranga', region: 'Bay of Plenty', area: 2, notes: 'Tauranga Urban' },
  { postcode: '3116', suburb: 'Mount Maunganui', city: 'Tauranga', region: 'Bay of Plenty', area: 2, notes: 'Tauranga Urban' },
  { postcode: '3118', suburb: 'Papamoa Beach', city: 'Tauranga', region: 'Bay of Plenty', area: 2, notes: 'Tauranga Urban' },
  { postcode: '3119', suburb: 'Te Puke', city: 'Western Bay of Plenty', region: 'Bay of Plenty', area: 2, notes: 'Western Bay of Plenty Area 2' },
  { postcode: '3129', suburb: 'Katikati', city: 'Western Bay of Plenty', region: 'Bay of Plenty', area: 2, notes: 'Western Bay of Plenty Area 2' },
  { postcode: '3172', suburb: 'Omokoroa', city: 'Western Bay of Plenty', region: 'Bay of Plenty', area: 2, notes: 'Western Bay of Plenty Area 2' },
  { postcode: '3200', suburb: 'Frankton / Dinsdale / Nawton', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '3204', suburb: 'Hamilton Central / Whitiora', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '3206', suburb: 'Melville / Glenview', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '3210', suburb: 'Rototuna / Chartwell / Flagstaff', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '3214', suburb: 'Fairfield / Enderley', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '3216', suburb: 'Hamilton East / Hillcrest', city: 'Hamilton', region: 'Waikato', area: 2, notes: 'Hamilton Urban' },
  { postcode: '7010', suburb: 'Nelson Central / The Wood', city: 'Nelson', region: 'Nelson', area: 2, notes: 'Nelson Urban' },
  { postcode: '7011', suburb: 'Tahunanui / Stoke', city: 'Nelson', region: 'Nelson', area: 2, notes: 'Nelson Urban' },

  // ==========================================
  // AREA 3: Provincial & Regional Urban Centres
  // ==========================================
  { postcode: '0110', suburb: 'Whangārei Central / Regent', city: 'Whangārei', region: 'Northland', area: 3, notes: 'Whangārei Urban' },
  { postcode: '0112', suburb: 'Kamo / Tikipunga', city: 'Whangārei', region: 'Northland', area: 3, notes: 'Whangārei Urban' },
  { postcode: '3010', suburb: 'Rotorua Central / Glenholme', city: 'Rotorua', region: 'Bay of Plenty', area: 3, notes: 'Rotorua Urban' },
  { postcode: '3015', suburb: 'Fairy Springs / Ngongotaha', city: 'Rotorua', region: 'Bay of Plenty', area: 3, notes: 'Rotorua Urban' },
  { postcode: '3330', suburb: 'Taupō Central / Richmond Heights', city: 'Taupō', region: 'Waikato', area: 3, notes: 'Taupō Urban' },
  { postcode: '3434', suburb: 'Cambridge Central / Leamington', city: 'Waipa', region: 'Waikato', area: 3, notes: 'Cambridge Urban Area 3' },
  { postcode: '3800', suburb: 'Te Awamutu', city: 'Waipa', region: 'Waikato', area: 3, notes: 'Te Awamutu Urban Area 3' },
  { postcode: '4010', suburb: 'Gisborne Central / Whataupoko', city: 'Gisborne', region: 'Gisborne', area: 3, notes: 'Gisborne Urban' },
  { postcode: '4110', suburb: 'Napier Central / Ahuriri', city: 'Napier', region: 'Hawke\'s Bay', area: 3, notes: 'Napier Urban' },
  { postcode: '4112', suburb: 'Taradale / Greenmeadows', city: 'Napier', region: 'Hawke\'s Bay', area: 3, notes: 'Napier Urban' },
  { postcode: '4120', suburb: 'Hastings Central / Camberley', city: 'Hastings', region: 'Hawke\'s Bay', area: 3, notes: 'Hastings Urban' },
  { postcode: '4122', suburb: 'Havelock North', city: 'Hastings', region: 'Hawke\'s Bay', area: 3, notes: 'Hastings Urban' },
  { postcode: '4310', suburb: 'New Plymouth Central / Strandon', city: 'New Plymouth', region: 'Taranaki', area: 3, notes: 'New Plymouth Urban' },
  { postcode: '4312', suburb: 'Fitzroy / Merrilands / Bell Block', city: 'New Plymouth', region: 'Taranaki', area: 3, notes: 'New Plymouth Urban' },
  { postcode: '4410', suburb: 'Palmerston North Central / West End', city: 'Palmerston North', region: 'Manawatū-Whanganui', area: 3, notes: 'Palmerston North Urban' },
  { postcode: '4412', suburb: 'Terrace End / Roslyn', city: 'Palmerston North', region: 'Manawatū-Whanganui', area: 3, notes: 'Palmerston North Urban' },
  { postcode: '4414', suburb: 'Kelvin Grove / Hokowhitu', city: 'Palmerston North', region: 'Manawatū-Whanganui', area: 3, notes: 'Palmerston North Urban' },
  { postcode: '4500', suburb: 'Whanganui Central / College Estate', city: 'Whanganui', region: 'Manawatū-Whanganui', area: 3, notes: 'Whanganui Urban' },
  { postcode: '4501', suburb: 'Gonville / Castlecliff', city: 'Whanganui', region: 'Manawatū-Whanganui', area: 3, notes: 'Whanganui Urban' },
  { postcode: '5510', suburb: 'Levin Central', city: 'Horowhenua', region: 'Manawatū-Whanganui', area: 3, notes: 'Horowhenua Area 3' },
  { postcode: '5810', suburb: 'Masterton Central', city: 'Masterton', region: 'Wellington Region', area: 3, notes: 'Wairarapa Urban Area 3' },
  { postcode: '7020', suburb: 'Richmond', city: 'Tasman', region: 'Tasman', area: 3, notes: 'Tasman Urban Area 3' },
  { postcode: '7201', suburb: 'Blenheim Central / Springlands', city: 'Marlborough', region: 'Marlborough', area: 3, notes: 'Blenheim Urban' },
  { postcode: '7700', suburb: 'Ashburton Central / Netherby', city: 'Ashburton', region: 'Canterbury', area: 3, notes: 'Ashburton Urban Area 3' },
  { postcode: '7910', suburb: 'Timaru Central / Highfield', city: 'Timaru', region: 'Canterbury', area: 3, notes: 'Timaru Urban Area 3' },
  { postcode: '9010', suburb: 'North East Valley / Opoho', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Dunedin Urban' },
  { postcode: '9011', suburb: 'Roslyn / Maori Hill', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Dunedin Urban' },
  { postcode: '9012', suburb: 'South Dunedin / Saint Kilda', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Dunedin Urban' },
  { postcode: '9013', suburb: 'Saint Clair / Corstorphine', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Dunedin Urban' },
  { postcode: '9016', suburb: 'Dunedin Central / City Rise', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Dunedin Urban' },
  { postcode: '9024', suburb: 'Mosgiel', city: 'Dunedin', region: 'Otago', area: 3, notes: 'Mosgiel Urban Area 3' },
  { postcode: '9400', suburb: 'Oamaru Central', city: 'Waitaki', region: 'Otago', area: 3, notes: 'Waitaki Urban Area 3' },
  { postcode: '9810', suburb: 'Invercargill Central / Gladstone', city: 'Invercargill', region: 'Southland', area: 3, notes: 'Invercargill Urban' },
  { postcode: '9812', suburb: 'Waikiwi / Grasmere', city: 'Invercargill', region: 'Southland', area: 3, notes: 'Invercargill Urban' },

  // ==========================================
  // AREA 4: Rural, Towns & Rest of New Zealand
  // ==========================================
  { postcode: '0200', suburb: 'Paihia / Russell', city: 'Far North', region: 'Northland', area: 4, notes: 'Bay of Islands Rural' },
  { postcode: '0230', suburb: 'Kerikeri', city: 'Far North', region: 'Northland', area: 4, notes: 'Far North District' },
  { postcode: '0310', suburb: 'Dargaville', city: 'Kaipara', region: 'Northland', area: 4, notes: 'Kaipara District' },
  { postcode: '0405', suburb: 'Kaikohe', city: 'Far North', region: 'Northland', area: 4, notes: 'Far North District' },
  { postcode: '0410', suburb: 'Kaitaia', city: 'Far North', region: 'Northland', area: 4, notes: 'Far North District' },
  { postcode: '3122', suburb: 'Opotiki', city: 'Opotiki', region: 'Bay of Plenty', area: 4, notes: 'Eastern Bay of Plenty Rural' },
  { postcode: '3127', suburb: 'Kawerau', city: 'Kawerau', region: 'Bay of Plenty', area: 4, notes: 'Eastern Bay of Plenty Town' },
  { postcode: '3400', suburb: 'Matamata', city: 'Matamata-Piako', region: 'Waikato', area: 4, notes: 'Rural Waikato' },
  { postcode: '3420', suburb: 'Tokoroa', city: 'South Waikato', region: 'Waikato', area: 4, notes: 'South Waikato District' },
  { postcode: '3500', suburb: 'Thames', city: 'Thames-Coromandel', region: 'Waikato', area: 4, notes: 'Coromandel Peninsula' },
  { postcode: '3510', suburb: 'Whitianga', city: 'Thames-Coromandel', region: 'Waikato', area: 4, notes: 'Coromandel Peninsula' },
  { postcode: '3610', suburb: 'Waihi', city: 'Hauraki', region: 'Waikato', area: 4, notes: 'Hauraki District' },
  { postcode: '3620', suburb: 'Whangamata', city: 'Thames-Coromandel', region: 'Waikato', area: 4, notes: 'Coromandel Peninsula' },
  { postcode: '3700', suburb: 'Huntly', city: 'Waikato', region: 'Waikato', area: 4, notes: 'North Waikato Rural' },
  { postcode: '3720', suburb: 'Ngaruawahia', city: 'Waikato', region: 'Waikato', area: 4, notes: 'North Waikato Rural' },
  { postcode: '3900', suburb: 'Otorohanga', city: 'Otorohanga', region: 'Waikato', area: 4, notes: 'King Country Rural' },
  { postcode: '3910', suburb: 'Te Kuiti', city: 'Waitomo', region: 'Waikato', area: 4, notes: 'Waitomo District' },
  { postcode: '3920', suburb: 'Taumarunui', city: 'Ruapehu', region: 'Manawatū-Whanganui', area: 4, notes: 'Ruapehu District' },
  { postcode: '4160', suburb: 'Wairoa', city: 'Wairoa', region: 'Hawke\'s Bay', area: 4, notes: 'Northern Hawke\'s Bay' },
  { postcode: '4200', suburb: 'Waipukurau / Waipawa', city: 'Central Hawke\'s Bay', region: 'Hawke\'s Bay', area: 4, notes: 'Central Hawke\'s Bay' },
  { postcode: '4332', suburb: 'Stratford', city: 'Stratford', region: 'Taranaki', area: 4, notes: 'Central Taranaki' },
  { postcode: '4610', suburb: 'Hawera', city: 'South Taranaki', region: 'Taranaki', area: 4, notes: 'South Taranaki' },
  { postcode: '4625', suburb: 'Ohakune', city: 'Ruapehu', region: 'Manawatū-Whanganui', area: 4, notes: 'Ruapehu District' },
  { postcode: '4702', suburb: 'Feilding', city: 'Manawatū', region: 'Manawatū-Whanganui', area: 4, notes: 'Manawatū District' },
  { postcode: '4710', suburb: 'Marton', city: 'Rangitikei', region: 'Manawatū-Whanganui', area: 4, notes: 'Rangitikei District' },
  { postcode: '4720', suburb: 'Taihape', city: 'Rangitikei', region: 'Manawatū-Whanganui', area: 4, notes: 'Rangitikei District' },
  { postcode: '4818', suburb: 'Bulls', city: 'Rangitikei', region: 'Manawatū-Whanganui', area: 4, notes: 'Rangitikei District' },
  { postcode: '4910', suburb: 'Pahiatua', city: 'Tararua', region: 'Manawatū-Whanganui', area: 4, notes: 'Tararua District' },
  { postcode: '4920', suburb: 'Woodville', city: 'Tararua', region: 'Manawatū-Whanganui', area: 4, notes: 'Tararua District' },
  { postcode: '4930', suburb: 'Dannevirke', city: 'Tararua', region: 'Manawatū-Whanganui', area: 4, notes: 'Tararua District' },
  { postcode: '7300', suburb: 'Kaikoura', city: 'Kaikoura', region: 'Canterbury', area: 4, notes: 'Kaikoura District' },
  { postcode: '7310', suburb: 'Cheviot', city: 'Hurunui', region: 'Canterbury', area: 4, notes: 'Hurunui District' },
  { postcode: '7334', suburb: 'Hanmer Springs', city: 'Hurunui', region: 'Canterbury', area: 4, notes: 'Hurunui District' },
  { postcode: '7730', suburb: 'Methven', city: 'Ashburton', region: 'Canterbury', area: 4, notes: 'Mount Hutt / Rural Ashburton' },
  { postcode: '7805', suburb: 'Greymouth Central', city: 'Grey', region: 'West Coast', area: 4, notes: 'West Coast District' },
  { postcode: '7810', suburb: 'Hokitika', city: 'Westland', region: 'West Coast', area: 4, notes: 'Westland District' },
  { postcode: '7825', suburb: 'Westport', city: 'Buller', region: 'West Coast', area: 4, notes: 'Buller District' },
  { postcode: '7830', suburb: 'Reefton', city: 'Buller', region: 'West Coast', area: 4, notes: 'Buller District' },
  { postcode: '7901', suburb: 'Twizel', city: 'Mackenzie', region: 'Canterbury', area: 4, notes: 'Mackenzie Basin' },
  { postcode: '7920', suburb: 'Temuka', city: 'Timaru', region: 'Canterbury', area: 4, notes: 'Rural Timaru District' },
  { postcode: '7924', suburb: 'Waimate', city: 'Waimate', region: 'Canterbury', area: 4, notes: 'Waimate District' },
  { postcode: '7930', suburb: 'Geraldine', city: 'Timaru', region: 'Canterbury', area: 4, notes: 'Rural Canterbury' },
  { postcode: '7999', suburb: 'Lake Tekapo', city: 'Mackenzie', region: 'Canterbury', area: 4, notes: 'Mackenzie District' },
  { postcode: '8942', suburb: 'Chatham Islands', city: 'Chatham Islands', region: 'Offshore', area: 4, notes: 'Chatham Islands Territory' },
  { postcode: '9220', suburb: 'Milton', city: 'Clutha', region: 'Otago', area: 4, notes: 'Clutha District' },
  { postcode: '9230', suburb: 'Balclutha', city: 'Clutha', region: 'Otago', area: 4, notes: 'Clutha District' },
  { postcode: '9310', suburb: 'Cromwell', city: 'Central Otago', region: 'Otago', area: 4, notes: 'Central Otago District' },
  { postcode: '9320', suburb: 'Alexandra', city: 'Central Otago', region: 'Otago', area: 4, notes: 'Central Otago District' },
  { postcode: '9330', suburb: 'Clyde', city: 'Central Otago', region: 'Otago', area: 4, notes: 'Central Otago District' },
  { postcode: '9500', suburb: 'Roxburgh', city: 'Central Otago', region: 'Otago', area: 4, notes: 'Teviot Valley' },
  { postcode: '9600', suburb: 'Te Anau', city: 'Southland', region: 'Southland', area: 4, notes: 'Fiordland / Southland District' },
  { postcode: '9610', suburb: 'Otautau', city: 'Southland', region: 'Southland', area: 4, notes: 'Western Southland' },
  { postcode: '9710', suburb: 'Gore', city: 'Gore', region: 'Southland', area: 4, notes: 'Gore District' },
  { postcode: '9712', suburb: 'Mataura', city: 'Gore', region: 'Southland', area: 4, notes: 'Gore District' },
  { postcode: '9720', suburb: 'Winton', city: 'Southland', region: 'Southland', area: 4, notes: 'Central Southland' },
  { postcode: '9818', suburb: 'Stewart Island / Oban', city: 'Southland', region: 'Southland', area: 4, notes: 'Stewart Island / Rakiura' },
  { postcode: '9822', suburb: 'Riverton / Aparima', city: 'Southland', region: 'Southland', area: 4, notes: 'Southland Coast' },
];

export async function seed() {
  console.log('🌱 Starting database seeding for Turso DB...');

  // 1. Seed or Upsert Rate Tables (2026 Active Rates & 2024 Baseline)
  console.log('📊 Seeding 2026 statutory rate table...');
  await db
    .insert(rateTables)
    .values({
      id: 'nz_rates_2026',
      name: 'NZ Statutory Rates 2026 (IRD 2026 Rules)',
      effectiveFrom: '2026-04-01',
      effectiveTo: null,
      isCurrent: true,
      wffConfig: WFF_CONSTANTS_2026,
      accommodationSupplementConfig: {
        caps: AS_MAX_CAPS_2024,
        entryThresholds: AS_ENTRY_THRESHOLDS_2024,
        assetLimits: AS_ASSET_LIMITS,
      },
      familyBoostConfig: FAMILYBOOST_CONSTANTS_2026,
    })
    .onConflictDoUpdate({
      target: rateTables.id,
      set: {
        wffConfig: WFF_CONSTANTS_2026,
        familyBoostConfig: FAMILYBOOST_CONSTANTS_2026,
        isCurrent: true,
      },
    });

  await db
    .insert(rateTables)
    .values({
      id: 'nz_rates_2024_2025',
      name: 'NZ Statutory Rates 2024/2025 (Historical Baseline)',
      effectiveFrom: '2024-07-01',
      effectiveTo: '2026-03-31',
      isCurrent: false,
      wffConfig: WFF_CONSTANTS_2024,
      accommodationSupplementConfig: {
        caps: AS_MAX_CAPS_2024,
        entryThresholds: AS_ENTRY_THRESHOLDS_2024,
        assetLimits: AS_ASSET_LIMITS,
      },
      familyBoostConfig: FAMILYBOOST_CONSTANTS_2024,
    })
    .onConflictDoUpdate({
      target: rateTables.id,
      set: {
        wffConfig: WFF_CONSTANTS_2024,
        familyBoostConfig: FAMILYBOOST_CONSTANTS_2024,
        isCurrent: false,
      },
    });

  // 2. Seed MSD Postcode Areas
  console.log(`📮 Seeding ${NZ_POSTCODE_SEED_DATA.length} New Zealand postcodes into msd_postcode_areas...`);

  let insertedCount = 0;
  // Batch insert in chunks of 50 to avoid any SQLite parameter limits
  const CHUNK_SIZE = 50;
  for (let i = 0; i < NZ_POSTCODE_SEED_DATA.length; i += CHUNK_SIZE) {
    const chunk = NZ_POSTCODE_SEED_DATA.slice(i, i + CHUNK_SIZE);
    await db
      .insert(msdPostcodeAreas)
      .values(chunk)
      .onConflictDoUpdate({
        target: msdPostcodeAreas.postcode,
        set: {
          suburb: sql`excluded.suburb`,
          city: sql`excluded.city`,
          region: sql`excluded.region`,
          area: sql`excluded.area`,
          notes: sql`excluded.notes`,
        },
      });
    insertedCount += chunk.length;
  }

  // Summary by Area
  const countsByArea = NZ_POSTCODE_SEED_DATA.reduce((acc, curr) => {
    acc[curr.area] = (acc[curr.area] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log(`✅ Successfully seeded ${insertedCount} NZ postcodes into msd_postcode_areas:`);
  console.log(`   - Area 1 (Auckland & Queenstown Lakes): ${countsByArea[1] || 0} postcodes`);
  console.log(`   - Area 2 (Wellington, Christchurch, Tauranga, Hamilton, Nelson, Kapiti): ${countsByArea[2] || 0} postcodes`);
  console.log(`   - Area 3 (Provincial Urban & Regional Centres): ${countsByArea[3] || 0} postcodes`);
  console.log(`   - Area 4 (Rural Districts, Smaller Towns & Islands): ${countsByArea[4] || 0} postcodes`);
  console.log('🎉 Seeding completed successfully!');
}

// Execute if run directly via tsx
if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed with error:', err);
      process.exit(1);
    });
}
