// Source: Aswath Damodaran, NYU Stern — January 2025
// https://pages.stern.nyu.edu/~adamodar/New_Home_Page/data.html

export interface IndustryVolatility {
  industry: string;
  numFirms: number;
  stdDevEquity: number;
  stdDevFirmValue: number;
  equityRatio: number;
  debtRatio: number;
}

export const DAMODARAN_PARAMS = {
  relativeStdDevBonds: 0.4,
  correlationStocksBonds: 0.5,
  dataYear: 2025,
  source: "Aswath Damodaran, NYU Stern",
};

export const INDUSTRY_VOLATILITY_DATA: IndustryVolatility[] = [
  { industry: "Advertising", numFirms: 54, stdDevEquity: 0.671857, stdDevFirmValue: 0.562361, equityRatio: 0.792413, debtRatio: 0.207587 },
  { industry: "Aerospace/Defense", numFirms: 67, stdDevEquity: 0.427424, stdDevFirmValue: 0.364988, equityRatio: 0.814375, debtRatio: 0.185625 },
  { industry: "Air Transport", numFirms: 24, stdDevEquity: 0.652716, stdDevFirmValue: 0.400422, equityRatio: 0.483498, debtRatio: 0.516502 },
  { industry: "Apparel", numFirms: 37, stdDevEquity: 0.509264, stdDevFirmValue: 0.385133, equityRatio: 0.685456, debtRatio: 0.314544 },
  { industry: "Auto & Truck", numFirms: 34, stdDevEquity: 0.775911, stdDevFirmValue: 0.664154, equityRatio: 0.81702, debtRatio: 0.18298 },
  { industry: "Auto Parts", numFirms: 33, stdDevEquity: 0.526237, stdDevFirmValue: 0.394456, equityRatio: 0.676438, debtRatio: 0.323562 },
  { industry: "Bank (Money Center)", numFirms: 15, stdDevEquity: 0.304694, stdDevFirmValue: 0.162096, equityRatio: 0.353123, debtRatio: 0.646877 },
  { industry: "Banks (Regional)", numFirms: 591, stdDevEquity: 0.2996, stdDevFirmValue: 0.213033, equityRatio: 0.623764, debtRatio: 0.376236 },
  { industry: "Beverage (Alcoholic)", numFirms: 18, stdDevEquity: 0.630764, stdDevFirmValue: 0.515463, equityRatio: 0.766489, debtRatio: 0.233511 },
  { industry: "Beverage (Soft)", numFirms: 29, stdDevEquity: 0.476703, stdDevFirmValue: 0.41475, equityRatio: 0.835205, debtRatio: 0.164795 },
  { industry: "Broadcasting", numFirms: 22, stdDevEquity: 0.525952, stdDevFirmValue: 0.294759, equityRatio: 0.400701, debtRatio: 0.599299 },
  { industry: "Brokerage & Investment Banking", numFirms: 30, stdDevEquity: 0.404909, stdDevFirmValue: 0.214429, equityRatio: 0.348935, debtRatio: 0.651065 },
  { industry: "Building Materials", numFirms: 39, stdDevEquity: 0.347475, stdDevFirmValue: 0.303752, equityRatio: 0.840527, debtRatio: 0.159473 },
  { industry: "Business & Consumer Services", numFirms: 152, stdDevEquity: 0.453932, stdDevFirmValue: 0.402385, equityRatio: 0.856305, debtRatio: 0.143695 },
  { industry: "Cable TV", numFirms: 9, stdDevEquity: 0.497328, stdDevFirmValue: 0.291553, equityRatio: 0.441785, debtRatio: 0.558215 },
  { industry: "Chemical (Basic)", numFirms: 31, stdDevEquity: 0.500216, stdDevFirmValue: 0.35863, equityRatio: 0.631899, debtRatio: 0.368101 },
  { industry: "Chemical (Diversified)", numFirms: 4, stdDevEquity: 0.469704, stdDevFirmValue: 0.283719, equityRatio: 0.469215, debtRatio: 0.530785 },
  { industry: "Chemical (Specialty)", numFirms: 60, stdDevEquity: 0.481494, stdDevFirmValue: 0.400888, equityRatio: 0.78663, debtRatio: 0.21337 },
  { industry: "Coal & Related Energy", numFirms: 16, stdDevEquity: 0.537782, stdDevFirmValue: 0.500827, equityRatio: 0.9135, debtRatio: 0.0865 },
  { industry: "Computer Services", numFirms: 63, stdDevEquity: 0.443963, stdDevFirmValue: 0.371323, equityRatio: 0.791577, debtRatio: 0.208423 },
  { industry: "Computers/Peripherals", numFirms: 35, stdDevEquity: 0.52622, stdDevFirmValue: 0.506942, equityRatio: 0.954042, debtRatio: 0.045958 },
  { industry: "Construction Supplies", numFirms: 46, stdDevEquity: 0.475248, stdDevFirmValue: 0.408848, equityRatio: 0.822606, debtRatio: 0.177394 },
  { industry: "Diversified", numFirms: 21, stdDevEquity: 0.593497, stdDevFirmValue: 0.528459, equityRatio: 0.861401, debtRatio: 0.138599 },
  { industry: "Drugs (Biotechnology)", numFirms: 535, stdDevEquity: 0.868278, stdDevFirmValue: 0.768133, equityRatio: 0.854019, debtRatio: 0.145981 },
  { industry: "Drugs (Pharmaceutical)", numFirms: 231, stdDevEquity: 0.800485, stdDevFirmValue: 0.709082, equityRatio: 0.8555, debtRatio: 0.1445 },
  { industry: "Education", numFirms: 29, stdDevEquity: 0.558227, stdDevFirmValue: 0.486547, equityRatio: 0.837209, debtRatio: 0.162791 },
  { industry: "Electrical Equipment", numFirms: 101, stdDevEquity: 0.721157, stdDevFirmValue: 0.647393, equityRatio: 0.870747, debtRatio: 0.129253 },
  { industry: "Electronics (Consumer & Office)", numFirms: 11, stdDevEquity: 0.73199, stdDevFirmValue: 0.663878, equityRatio: 0.882546, debtRatio: 0.117454 },
  { industry: "Electronics (General)", numFirms: 122, stdDevEquity: 0.616086, stdDevFirmValue: 0.554621, equityRatio: 0.873968, debtRatio: 0.126032 },
  { industry: "Engineering/Construction", numFirms: 42, stdDevEquity: 0.47332, stdDevFirmValue: 0.416514, equityRatio: 0.848009, debtRatio: 0.151991 },
  { industry: "Entertainment", numFirms: 96, stdDevEquity: 0.626979, stdDevFirmValue: 0.543455, equityRatio: 0.831004, debtRatio: 0.168996 },
  { industry: "Environmental & Waste Services", numFirms: 50, stdDevEquity: 0.544758, stdDevFirmValue: 0.475166, equityRatio: 0.838058, debtRatio: 0.161942 },
  { industry: "Farming/Agriculture", numFirms: 35, stdDevEquity: 0.695913, stdDevFirmValue: 0.509227, equityRatio: 0.65219, debtRatio: 0.34781 },
  { industry: "Financial Svcs. (Non-bank & Insurance)", numFirms: 166, stdDevEquity: 0.419585, stdDevFirmValue: 0.201892, equityRatio: 0.258627, debtRatio: 0.741373 },
  { industry: "Food Processing", numFirms: 77, stdDevEquity: 0.462696, stdDevFirmValue: 0.366192, equityRatio: 0.732484, debtRatio: 0.267516 },
  { industry: "Food Wholesalers", numFirms: 14, stdDevEquity: 0.39167, stdDevFirmValue: 0.299836, equityRatio: 0.697932, debtRatio: 0.302068 },
  { industry: "Furn/Home Furnishings", numFirms: 28, stdDevEquity: 0.548015, stdDevFirmValue: 0.422232, equityRatio: 0.704561, debtRatio: 0.295439 },
  { industry: "Green & Renewable Energy", numFirms: 18, stdDevEquity: 0.719303, stdDevFirmValue: 0.386423, equityRatio: 0.362081, debtRatio: 0.637919 },
  { industry: "Healthcare Products", numFirms: 218, stdDevEquity: 0.674053, stdDevFirmValue: 0.61347, equityRatio: 0.886591, debtRatio: 0.113409 },
  { industry: "Healthcare Support Services", numFirms: 113, stdDevEquity: 0.539968, stdDevFirmValue: 0.43713, equityRatio: 0.756423, debtRatio: 0.243577 },
  { industry: "Heathcare Information and Technology", numFirms: 116, stdDevEquity: 0.645438, stdDevFirmValue: 0.574315, equityRatio: 0.86062, debtRatio: 0.13938 },
  { industry: "Homebuilding", numFirms: 30, stdDevEquity: 0.41432, stdDevFirmValue: 0.365577, equityRatio: 0.851054, debtRatio: 0.148946 },
  { industry: "Hospitals/Healthcare Facilities", numFirms: 33, stdDevEquity: 0.508099, stdDevFirmValue: 0.33983, equityRatio: 0.564485, debtRatio: 0.435515 },
  { industry: "Hotel/Gaming", numFirms: 65, stdDevEquity: 0.450953, stdDevFirmValue: 0.345332, equityRatio: 0.69827, debtRatio: 0.30173 },
  { industry: "Household Products", numFirms: 101, stdDevEquity: 0.566704, stdDevFirmValue: 0.507468, equityRatio: 0.86788, debtRatio: 0.13212 },
  { industry: "Information Services", numFirms: 16, stdDevEquity: 0.396581, stdDevFirmValue: 0.315736, equityRatio: 0.738731, debtRatio: 0.261269 },
  { industry: "Insurance (General)", numFirms: 22, stdDevEquity: 0.510072, stdDevFirmValue: 0.450487, equityRatio: 0.852121, debtRatio: 0.147879 },
  { industry: "Insurance (Life)", numFirms: 19, stdDevEquity: 0.343127, stdDevFirmValue: 0.241695, equityRatio: 0.614523, debtRatio: 0.385477 },
  { industry: "Insurance (Prop/Cas.)", numFirms: 53, stdDevEquity: 0.336884, stdDevFirmValue: 0.301198, equityRatio: 0.866086, debtRatio: 0.133914 },
  { industry: "Investments & Asset Management", numFirms: 231, stdDevEquity: 0.22941, stdDevFirmValue: 0.18295, equityRatio: 0.740498, debtRatio: 0.259502 },
  { industry: "Machinery", numFirms: 109, stdDevEquity: 0.460733, stdDevFirmValue: 0.411291, equityRatio: 0.864312, debtRatio: 0.135688 },
  { industry: "Metals & Mining", numFirms: 64, stdDevEquity: 0.723723, stdDevFirmValue: 0.641625, equityRatio: 0.856457, debtRatio: 0.143543 },
  { industry: "Office Equipment & Services", numFirms: 14, stdDevEquity: 0.49892, stdDevFirmValue: 0.376241, equityRatio: 0.682563, debtRatio: 0.317437 },
  { industry: "Oil/Gas (Integrated)", numFirms: 4, stdDevEquity: 0.255595, stdDevFirmValue: 0.231185, equityRatio: 0.879413, debtRatio: 0.120587 },
  { industry: "Oil/Gas (Production and Exploration)", numFirms: 147, stdDevEquity: 0.476589, stdDevFirmValue: 0.397887, equityRatio: 0.789598, debtRatio: 0.210402 },
  { industry: "Oil/Gas Distribution", numFirms: 24, stdDevEquity: 0.381742, stdDevFirmValue: 0.281493, equityRatio: 0.659899, debtRatio: 0.340101 },
  { industry: "Oilfield Svcs/Equip.", numFirms: 97, stdDevEquity: 0.494884, stdDevFirmValue: 0.387724, equityRatio: 0.721899, debtRatio: 0.278101 },
  { industry: "Packaging & Container", numFirms: 22, stdDevEquity: 0.339754, stdDevFirmValue: 0.249053, equityRatio: 0.653964, debtRatio: 0.346036 },
  { industry: "Paper/Forest Products", numFirms: 6, stdDevEquity: 0.606575, stdDevFirmValue: 0.518677, equityRatio: 0.815887, debtRatio: 0.184113 },
  { industry: "Power", numFirms: 48, stdDevEquity: 0.273143, stdDevFirmValue: 0.180782, equityRatio: 0.55452, debtRatio: 0.44548 },
  { industry: "Precious Metals", numFirms: 60, stdDevEquity: 0.70972, stdDevFirmValue: 0.620703, equityRatio: 0.84105, debtRatio: 0.15895 },
  { industry: "Publishing & Newspapers", numFirms: 19, stdDevEquity: 0.410005, stdDevFirmValue: 0.338356, equityRatio: 0.777032, debtRatio: 0.222968 },
  { industry: "R.E.I.T.", numFirms: 192, stdDevEquity: 0.320771, stdDevFirmValue: 0.210181, equityRatio: 0.544998, debtRatio: 0.455002 },
  { industry: "Real Estate (Development)", numFirms: 15, stdDevEquity: 0.496822, stdDevFirmValue: 0.303348, equityRatio: 0.479135, debtRatio: 0.520865 },
  { industry: "Real Estate (General/Diversified)", numFirms: 11, stdDevEquity: 0.265278, stdDevFirmValue: 0.204384, equityRatio: 0.704528, debtRatio: 0.295472 },
  { industry: "Real Estate (Operations & Services)", numFirms: 60, stdDevEquity: 0.565339, stdDevFirmValue: 0.466308, equityRatio: 0.776484, debtRatio: 0.223516 },
  { industry: "Recreation", numFirms: 50, stdDevEquity: 0.530623, stdDevFirmValue: 0.370402, equityRatio: 0.605697, debtRatio: 0.394303 },
  { industry: "Reinsurance", numFirms: 1, stdDevEquity: 0.198658, stdDevFirmValue: 0.157181, equityRatio: 0.732196, debtRatio: 0.267804 },
  { industry: "Restaurant/Dining", numFirms: 62, stdDevEquity: 0.415043, stdDevFirmValue: 0.353689, equityRatio: 0.812106, debtRatio: 0.187894 },
  { industry: "Retail (Automotive)", numFirms: 29, stdDevEquity: 0.473945, stdDevFirmValue: 0.351225, equityRatio: 0.664898, debtRatio: 0.335102 },
  { industry: "Retail (Building Supply)", numFirms: 13, stdDevEquity: 0.52126, stdDevFirmValue: 0.45223, equityRatio: 0.832022, debtRatio: 0.167978 },
  { industry: "Retail (Distributors)", numFirms: 66, stdDevEquity: 0.438886, stdDevFirmValue: 0.357091, equityRatio: 0.761793, debtRatio: 0.238207 },
  { industry: "Retail (General)", numFirms: 24, stdDevEquity: 0.466899, stdDevFirmValue: 0.437107, equityRatio: 0.919725, debtRatio: 0.080275 },
  { industry: "Retail (Grocery and Food)", numFirms: 17, stdDevEquity: 0.271282, stdDevFirmValue: 0.199421, equityRatio: 0.656784, debtRatio: 0.343216 },
  { industry: "Retail (REITs)", numFirms: 28, stdDevEquity: 0.235572, stdDevFirmValue: 0.171328, equityRatio: 0.646099, debtRatio: 0.353901 },
  { industry: "Retail (Special Lines)", numFirms: 98, stdDevEquity: 0.569961, stdDevFirmValue: 0.469734, equityRatio: 0.775597, debtRatio: 0.224403 },
  { industry: "Rubber& Tires", numFirms: 3, stdDevEquity: 0.720369, stdDevFirmValue: 0.328894, equityRatio: 0.205284, debtRatio: 0.794716 },
  { industry: "Semiconductor", numFirms: 63, stdDevEquity: 0.560486, stdDevFirmValue: 0.54373, equityRatio: 0.962521, debtRatio: 0.037479 },
  { industry: "Semiconductor Equip", numFirms: 30, stdDevEquity: 0.510931, stdDevFirmValue: 0.480225, equityRatio: 0.924422, debtRatio: 0.075578 },
  { industry: "Shipbuilding & Marine", numFirms: 8, stdDevEquity: 0.451893, stdDevFirmValue: 0.394683, equityRatio: 0.839536, debtRatio: 0.160464 },
  { industry: "Shoe", numFirms: 12, stdDevEquity: 0.517524, stdDevFirmValue: 0.479334, equityRatio: 0.907058, debtRatio: 0.092942 },
  { industry: "Software (Entertainment)", numFirms: 81, stdDevEquity: 0.66629, stdDevFirmValue: 0.653363, equityRatio: 0.975704, debtRatio: 0.024296 },
  { industry: "Software (Internet)", numFirms: 29, stdDevEquity: 0.556167, stdDevFirmValue: 0.510514, equityRatio: 0.896518, debtRatio: 0.103482 },
  { industry: "Software (System & Application)", numFirms: 333, stdDevEquity: 0.636285, stdDevFirmValue: 0.612614, equityRatio: 0.953329, debtRatio: 0.046671 },
  { industry: "Steel", numFirms: 27, stdDevEquity: 0.467903, stdDevFirmValue: 0.392325, equityRatio: 0.794302, debtRatio: 0.205698 },
  { industry: "Telecom (Wireless)", numFirms: 11, stdDevEquity: 0.667327, stdDevFirmValue: 0.500717, equityRatio: 0.677459, debtRatio: 0.322541 },
  { industry: "Telecom. Equipment", numFirms: 61, stdDevEquity: 0.560934, stdDevFirmValue: 0.510475, equityRatio: 0.886492, debtRatio: 0.113508 },
  { industry: "Telecom. Services", numFirms: 32, stdDevEquity: 0.637091, stdDevFirmValue: 0.397685, equityRatio: 0.499583, debtRatio: 0.500417 },
  { industry: "Tobacco", numFirms: 12, stdDevEquity: 0.683433, stdDevFirmValue: 0.566332, equityRatio: 0.781493, debtRatio: 0.218507 },
  { industry: "Transportation", numFirms: 21, stdDevEquity: 0.516753, stdDevFirmValue: 0.404489, equityRatio: 0.720949, debtRatio: 0.279051 },
  { industry: "Transportation (Railroads)", numFirms: 4, stdDevEquity: 0.2656, stdDevFirmValue: 0.219557, equityRatio: 0.778862, debtRatio: 0.221138 },
  { industry: "Trucking", numFirms: 24, stdDevEquity: 0.321801, stdDevFirmValue: 0.274593, equityRatio: 0.813567, debtRatio: 0.186433 },
  { industry: "Utility (General)", numFirms: 14, stdDevEquity: 0.182145, stdDevFirmValue: 0.121458, equityRatio: 0.561622, debtRatio: 0.438378 },
  { industry: "Utility (Water)", numFirms: 15, stdDevEquity: 0.291678, stdDevFirmValue: 0.208793, equityRatio: 0.630361, debtRatio: 0.369639 },
  { industry: "Total Market", numFirms: 6062, stdDevEquity: 0.525326, stdDevFirmValue: 0.410229, equityRatio: 0.718487, debtRatio: 0.281513 },
  { industry: "Total Market (without financials)", numFirms: 4935, stdDevEquity: 0.573963, stdDevFirmValue: 0.500744, equityRatio: 0.838291, debtRatio: 0.161709 },
];

export function lookupIndustryVolatility(industryName: string): IndustryVolatility | undefined {
  return INDUSTRY_VOLATILITY_DATA.find((d) => d.industry === industryName);
}

export function getIndustryVolatilityValue(industryName: string | null): number {
  if (!industryName) return 0;
  const industry = lookupIndustryVolatility(industryName);
  return industry?.stdDevFirmValue ?? 0;
}
