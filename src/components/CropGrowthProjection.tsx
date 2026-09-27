import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  Wheat,
  Droplets,
  Award,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Leaf,
  Clock,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Language } from '../types';

interface CropGrowthProjectionProps {
  language: Language;
}

type CropKey = 'wheat' | 'rice' | 'mustard' | 'maize' | 'sugarcane' | 'cotton';
type ScenarioType = 'ai' | 'traditional' | 'adverse';

interface CropDataset {
  nameEn: string;
  nameHi: string;
  variety: string;
  seasonEn: string;
  seasonHi: string;
  mspRatePerQuintal: number;
  durationDays: number;
  historicalTrends: Array<{
    year: string;
    traditional: number;
    aiOptimized: number;
    rainfall: number;
    upperBound?: number;
    lowerBound?: number;
  }>;
  growthStages: Array<{
    stage: string;
    stageHi: string;
    dayRange: string;
    ndvi: number;
    biomass: number; // in kg/acre
    status: string;
    statusHi: string;
    active?: boolean;
  }>;
  optimalHarvestWindowEn: string;
  optimalHarvestWindowHi: string;
  nextBestActionEn: string;
  nextBestActionHi: string;
}

const CROPS_DATA: Record<CropKey, CropDataset> = {
  wheat: {
    nameEn: 'Wheat (गेहूं)',
    nameHi: 'गेहूं (Wheat)',
    variety: 'HD-2967 / PBW-343',
    seasonEn: 'Rabi Season',
    seasonHi: 'रबी सीजन',
    mspRatePerQuintal: 2275,
    durationDays: 135,
    historicalTrends: [
      { year: '2021', traditional: 17.8, aiOptimized: 19.4, rainfall: 42 },
      { year: '2022', traditional: 16.5, aiOptimized: 20.1, rainfall: 28 },
      { year: '2023', traditional: 18.2, aiOptimized: 21.6, rainfall: 48 },
      { year: '2024', traditional: 17.9, aiOptimized: 22.4, rainfall: 35 },
      { year: '2025', traditional: 18.4, aiOptimized: 23.2, rainfall: 50 },
      { year: '2026 (Est)', traditional: 18.5, aiOptimized: 24.1, rainfall: 45, upperBound: 25.5, lowerBound: 22.8 },
    ],
    growthStages: [
      { stage: 'Germination', stageHi: 'अंकुरण', dayRange: '0-10 DAS', ndvi: 0.18, biomass: 180, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'CRI & Rooting', stageHi: 'सीआरआई / ताज जड़', dayRange: '21-25 DAS', ndvi: 0.38, biomass: 620, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Active Tillering', stageHi: 'कल्ले फूटना', dayRange: '35-45 DAS', ndvi: 0.65, biomass: 1650, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Booting / Jointing', stageHi: 'गांठ बनना व बूटिंग', dayRange: '60-70 DAS', ndvi: 0.82, biomass: 3200, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Heading & Flowering', stageHi: 'बालियां व फूल', dayRange: '80-90 DAS', ndvi: 0.85, biomass: 4800, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Grain Filling', stageHi: 'दूधिया व दाना भराव', dayRange: '100-115 DAS', ndvi: 0.72, biomass: 5600, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Maturity / Harvest', stageHi: 'परिपक्वता व कटाई', dayRange: '125-135 DAS', ndvi: 0.35, biomass: 5900, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'March 25 - April 10 (Target moisture 12-14%)',
    optimalHarvestWindowHi: '25 मार्च - 10 अप्रैल (नमी 12-14% होने पर)',
    nextBestActionEn: 'Apply 2nd top-dressing of Urea (45 kg/acre) post 2nd irrigation with light soil moisture.',
    nextBestActionHi: 'दूसरी सिंचाई के बाद नमी में 45 किलो यूरिया प्रति एकड़ का दूसरा टॉप ड्रेसिंग करें।',
  },
  rice: {
    nameEn: 'Paddy / Rice (धान)',
    nameHi: 'धान / चावल (Paddy)',
    variety: 'Pusa Basmati 1121 / PR-126',
    seasonEn: 'Kharif Season',
    seasonHi: 'खरीफ सीजन',
    mspRatePerQuintal: 2320,
    durationDays: 125,
    historicalTrends: [
      { year: '2021', traditional: 22.0, aiOptimized: 24.5, rainfall: 620 },
      { year: '2022', traditional: 20.8, aiOptimized: 24.8, rainfall: 510 },
      { year: '2023', traditional: 22.5, aiOptimized: 26.2, rainfall: 710 },
      { year: '2024', traditional: 23.1, aiOptimized: 27.5, rainfall: 590 },
      { year: '2025', traditional: 23.4, aiOptimized: 28.6, rainfall: 680 },
      { year: '2026 (Est)', traditional: 23.8, aiOptimized: 29.8, rainfall: 650, upperBound: 31.2, lowerBound: 28.2 },
    ],
    growthStages: [
      { stage: 'Nursery / Transplanting', stageHi: 'नर्सरी व रोपाई', dayRange: '0-25 DAT', ndvi: 0.22, biomass: 320, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Active Tillering', stageHi: 'कल्ले फूटना', dayRange: '30-45 DAT', ndvi: 0.68, biomass: 1850, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Panicle Initiation', stageHi: 'बालियां बनना', dayRange: '55-65 DAT', ndvi: 0.86, biomass: 3900, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Flowering', stageHi: 'फूल आना', dayRange: '75-85 DAT', ndvi: 0.88, biomass: 5400, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Dough / Ripening', stageHi: 'दाना पकना', dayRange: '95-110 DAT', ndvi: 0.60, biomass: 6200, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Harvest Ready', stageHi: 'कटाई योग्य', dayRange: '115-125 DAT', ndvi: 0.28, biomass: 6500, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'October 20 - November 5 (Golden straw color, 14% grain moisture)',
    optimalHarvestWindowHi: '20 अक्टूबर - 5 नवंबर (बालियां सुनहरी होने पर, 14% नमी)',
    nextBestActionEn: 'Maintain 2-3 cm shallow water layer and monitor for leaf folder or stem borer moths.',
    nextBestActionHi: 'खेत में 2-3 सेमी हल्का पानी बनाए रखें और तना छेदक व पत्ता लपेटक कीट की निगरानी करें।',
  },
  mustard: {
    nameEn: 'Mustard (सरसों)',
    nameHi: 'सरसों (Mustard)',
    variety: 'Pusa Bold / Giriraj RH-749',
    seasonEn: 'Rabi Season',
    seasonHi: 'रबी सीजन',
    mspRatePerQuintal: 5650,
    durationDays: 130,
    historicalTrends: [
      { year: '2021', traditional: 7.8, aiOptimized: 9.2, rainfall: 35 },
      { year: '2022', traditional: 7.2, aiOptimized: 9.6, rainfall: 22 },
      { year: '2023', traditional: 8.1, aiOptimized: 10.4, rainfall: 40 },
      { year: '2024', traditional: 8.4, aiOptimized: 10.9, rainfall: 30 },
      { year: '2025', traditional: 8.6, aiOptimized: 11.5, rainfall: 38 },
      { year: '2026 (Est)', traditional: 8.8, aiOptimized: 12.2, rainfall: 35, upperBound: 13.0, lowerBound: 11.4 },
    ],
    growthStages: [
      { stage: 'Germination', stageHi: 'अंकुरण', dayRange: '0-10 DAS', ndvi: 0.15, biomass: 120, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Rosette & Branching', stageHi: 'शाखाएं निकलना', dayRange: '25-35 DAS', ndvi: 0.52, biomass: 950, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Flowering', stageHi: 'पीले फूल खिलना', dayRange: '50-65 DAS', ndvi: 0.84, biomass: 2600, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Siliqua / Podding', stageHi: 'फलियां बनना', dayRange: '75-90 DAS', ndvi: 0.78, biomass: 3800, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Seed Filling', stageHi: 'दाना भराव', dayRange: '100-115 DAS', ndvi: 0.55, biomass: 4400, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Maturity', stageHi: 'कटाई', dayRange: '120-130 DAS', ndvi: 0.25, biomass: 4600, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'February 20 - March 5 (Pod yellowing stage to avoid seed shattering)',
    optimalHarvestWindowHi: '20 फरवरी - 5 मार्च (फलियां 75% पीली होने पर सुबह के समय कटाई)',
    nextBestActionEn: 'Foliar spray of Sulphur 80% WDG @ 3g/liter to boost oil content and ward off powdery mildew.',
    nextBestActionHi: 'तेल की मात्रा बढ़ाने और सफेद रतुआ से बचाव के लिए 80% घुलनशील सल्फर (3 ग्राम/लीटर) का छिड़काव करें।',
  },
  maize: {
    nameEn: 'Maize / Corn (मक्का)',
    nameHi: 'मक्का (Maize)',
    variety: 'Pioneer 3396 / Bio 9681',
    seasonEn: 'Kharif / Spring',
    seasonHi: 'खरीफ / जायद',
    mspRatePerQuintal: 2090,
    durationDays: 105,
    historicalTrends: [
      { year: '2021', traditional: 24.0, aiOptimized: 27.5, rainfall: 450 },
      { year: '2022', traditional: 22.8, aiOptimized: 28.0, rainfall: 380 },
      { year: '2023', traditional: 25.2, aiOptimized: 30.4, rainfall: 520 },
      { year: '2024', traditional: 25.8, aiOptimized: 31.8, rainfall: 470 },
      { year: '2025', traditional: 26.5, aiOptimized: 33.2, rainfall: 490 },
      { year: '2026 (Est)', traditional: 27.0, aiOptimized: 34.6, rainfall: 480, upperBound: 36.5, lowerBound: 32.5 },
    ],
    growthStages: [
      { stage: 'Seedling', stageHi: 'अंकुरण व पौधा', dayRange: '0-15 DAS', ndvi: 0.20, biomass: 250, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Knee-high (V6)', stageHi: 'घुटने तक ऊंचाई', dayRange: '30-40 DAS', ndvi: 0.62, biomass: 1700, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Tasseling', stageHi: 'नर मंजरी (टैसल)', dayRange: '50-60 DAS', ndvi: 0.88, biomass: 4200, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Silking & Ear formation', stageHi: 'सिल्क व भुट्टे का बनना', dayRange: '65-75 DAS', ndvi: 0.90, biomass: 5900, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Dent / Dough Stage', stageHi: 'दाना सख्त होना', dayRange: '85-95 DAS', ndvi: 0.65, biomass: 7200, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Harvesting', stageHi: 'कटाई', dayRange: '100-105 DAS', ndvi: 0.30, biomass: 7500, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'September 15 - September 30 (Black layer formation at kernel base)',
    optimalHarvestWindowHi: '15 सितंबर - 30 सितंबर (दाने के आधार पर काली परत दिखने पर)',
    nextBestActionEn: 'Side dress 35 kg Urea per acre before knee-high stage and inspect for Fall Armyworm.',
    nextBestActionHi: 'घुटने की ऊंचाई से पहले 35 किलो यूरिया का छिड़काव करें और फॉल आर्मीवर्म कीट की जांच करें।',
  },
  sugarcane: {
    nameEn: 'Sugarcane (गन्ना)',
    nameHi: 'गन्ना (Sugarcane)',
    variety: 'Co-0238 / Co-0118',
    seasonEn: 'Annual Crop',
    seasonHi: 'वार्षिक फसल',
    mspRatePerQuintal: 340,
    durationDays: 330,
    historicalTrends: [
      { year: '2021', traditional: 340, aiOptimized: 390, rainfall: 820 },
      { year: '2022', traditional: 325, aiOptimized: 405, rainfall: 710 },
      { year: '2023', traditional: 350, aiOptimized: 430, rainfall: 910 },
      { year: '2024', traditional: 360, aiOptimized: 450, rainfall: 850 },
      { year: '2025', traditional: 365, aiOptimized: 470, rainfall: 890 },
      { year: '2026 (Est)', traditional: 375, aiOptimized: 495, rainfall: 860, upperBound: 520, lowerBound: 470 },
    ],
    growthStages: [
      { stage: 'Germination', stageHi: 'अंकुरण', dayRange: '0-45 DAS', ndvi: 0.25, biomass: 1200, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Tillering', stageHi: 'कल्ले फूटना', dayRange: '60-120 DAS', ndvi: 0.70, biomass: 7500, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Grand Growth', stageHi: 'तीव्र बढ़वार', dayRange: '130-240 DAS', ndvi: 0.92, biomass: 24000, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Ripening / Sugar Accumulation', stageHi: 'शर्करा भराव', dayRange: '250-330 DAS', ndvi: 0.75, biomass: 38000, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'December 1 - February 28 (Brix index > 18%)',
    optimalHarvestWindowHi: '1 दिसंबर - 28 फरवरी (ब्रिक्स मिठास > 18% होने पर)',
    nextBestActionEn: 'Apply earthing up to support tall stalks against strong winds and broadcast 50 kg Urea.',
    nextBestActionHi: 'गन्ने की जड़ों में मिट्टी चढ़ाएं (Earthing up) और 50 किलो यूरिया का दूसरा छिड़काव करें।',
  },
  cotton: {
    nameEn: 'Cotton (कपास)',
    nameHi: 'कपास (Cotton)',
    variety: 'RCH 659 BG II Hybrid',
    seasonEn: 'Kharif Season',
    seasonHi: 'खरीफ सीजन',
    mspRatePerQuintal: 7122,
    durationDays: 165,
    historicalTrends: [
      { year: '2021', traditional: 8.5, aiOptimized: 10.2, rainfall: 540 },
      { year: '2022', traditional: 7.8, aiOptimized: 10.5, rainfall: 430 },
      { year: '2023', traditional: 8.9, aiOptimized: 11.4, rainfall: 610 },
      { year: '2024', traditional: 9.1, aiOptimized: 12.0, rainfall: 520 },
      { year: '2025', traditional: 9.4, aiOptimized: 12.8, rainfall: 570 },
      { year: '2026 (Est)', traditional: 9.6, aiOptimized: 13.5, rainfall: 550, upperBound: 14.5, lowerBound: 12.6 },
    ],
    growthStages: [
      { stage: 'Vegetative Phase', stageHi: 'वानस्पतिक बढ़वार', dayRange: '0-40 DAS', ndvi: 0.35, biomass: 600, status: 'Completed', statusHi: 'पूर्ण' },
      { stage: 'Squaring / Budding', stageHi: 'चौकोर व कलियां', dayRange: '45-65 DAS', ndvi: 0.72, biomass: 1900, status: 'Current Stage', statusHi: 'वर्तमान अवस्था', active: true },
      { stage: 'Flowering & Boll formation', stageHi: 'फूल व टिंडे बनना', dayRange: '70-110 DAS', ndvi: 0.88, biomass: 3800, status: 'Upcoming', statusHi: 'आगामी' },
      { stage: 'Boll Bursting & Picking', stageHi: 'टिंडे खिलना व चुगाई', dayRange: '120-165 DAS', ndvi: 0.45, biomass: 4500, status: 'Upcoming', statusHi: 'आगामी' },
    ],
    optimalHarvestWindowEn: 'November 10 - December 15 (Dry sunny days, pick mature fluffy bolls)',
    optimalHarvestWindowHi: '10 नवंबर - 15 दिसंबर (साफ धूप वाले दिनों में खिले हुए टिंडों की चुगाई)',
    nextBestActionEn: 'Foliar spray of 1% Magnesium Sulphate + 19:19:19 to prevent red leaf disease (Lal Patti).',
    nextBestActionHi: 'लाल पत्ती रोग से बचाव के लिए 1% मैग्नीशियम सल्फेट और 19:19:19 का फोलियर स्प्रे करें।',
  },
};

export const CropGrowthProjection: React.FC<CropGrowthProjectionProps> = ({ language }) => {
  const [selectedCrop, setSelectedCrop] = useState<CropKey>('wheat');
  const [scenario, setScenario] = useState<ScenarioType>('ai');
  const [activeTab, setActiveTab] = useState<'trends' | 'biomass' | 'table'>('trends');

  const crop = CROPS_DATA[selectedCrop];

  // Dynamic scenario multipliers
  const scenarioMultiplier = scenario === 'ai' ? 1.0 : scenario === 'traditional' ? 0.77 : 0.65;
  const currentEstYield = (crop.historicalTrends[5].aiOptimized * scenarioMultiplier).toFixed(1);
  const baselineYield = crop.historicalTrends[5].traditional.toFixed(1);
  const gainPercentage = (((Number(currentEstYield) - Number(baselineYield)) / Number(baselineYield)) * 100).toFixed(1);

  // Financial gain calculation
  const extraQuintals = Math.max(0, Number(currentEstYield) - Number(baselineYield));
  const extraRevenuePerAcre = Math.round(extraQuintals * crop.mspRatePerQuintal);

  // Customized Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-xl text-white text-xs">
          <p className="font-bold text-amber-300 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{label} {language === 'hi' ? 'सीजन डेटा' : 'Season Data'}</span>
          </p>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}:
                </span>
                <span className="font-bold text-white">
                  {item.value} {language === 'hi' ? 'क्विंटल/एकड़' : 'Qtl/Acre'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'एआई फसल विकास व उपज पूर्वानुमान' : 'AI Crop Growth & Yield Projection'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {language === 'hi'
              ? `${crop.nameHi} - स्थानीय ऐतिहासिक डेटा आधारित उपज अनुमान`
              : `${crop.nameEn} - Predictive Yield Dashboard`}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
            {language === 'hi'
              ? 'क्षेत्रीय मौसम, मिट्टी नमी और पिछले 5 वर्षों के स्थानीय उत्पादन डेटा के आधार पर आगामी कटाई के लिए सटीक उपज पूर्वानुमान।'
              : 'Multi-year local historical yield trends calibrated with satellite NDVI vegetation indices and regional agronomic benchmarks.'}
          </p>
        </div>

        {/* Crop Selection Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(CROPS_DATA) as CropKey[]).map((cKey) => {
            const isSelected = selectedCrop === cKey;
            return (
              <button
                key={cKey}
                type="button"
                onClick={() => setSelectedCrop(cKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-extrabold scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                <Wheat className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? CROPS_DATA[cKey].nameHi.split(' ')[0] : CROPS_DATA[cKey].nameEn.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Estimated Yield */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>{language === 'hi' ? 'अनुमानित उपज' : 'Projected Yield'}</span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
              <Award className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{currentEstYield}</span>
            <span className="text-xs text-slate-600 font-bold">{language === 'hi' ? 'क्विंटल/एकड़' : 'Qtl/Acre'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>
              {Number(gainPercentage) >= 0 ? `+${gainPercentage}%` : `${gainPercentage}%`} {language === 'hi' ? 'पारंपरिक से अधिक' : 'vs Baseline'}
            </span>
          </div>
        </div>

        {/* Card 2: Financial Revenue Boost */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>{language === 'hi' ? 'संभावित अतिरिक्त आय' : 'Est. Added Income'}</span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-700">
              <IndianRupee className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">₹{extraRevenuePerAcre.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500 font-medium">/{language === 'hi' ? 'एकड़' : 'Acre'}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500 truncate">
            {language === 'hi' ? `सरकारी MSP दर: ₹${crop.mspRatePerQuintal}/क्विंटल` : `Calculated @ MSP ₹${crop.mspRatePerQuintal}/Qtl`}
          </p>
        </div>

        {/* Card 3: Canopy Health (NDVI) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>{language === 'hi' ? 'कैनोपी स्वास्थ्य (NDVI)' : 'Canopy Health (NDVI)'}</span>
            <span className="p-1 rounded-lg bg-teal-50 text-teal-700">
              <Leaf className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">0.82</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {language === 'hi' ? 'उत्कृष्ट' : 'Optimal'}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {language === 'hi' ? 'बायोमास व प्रकाश संश्लेषण सक्रिय' : 'High chlorophyll density index'}
          </p>
        </div>

        {/* Card 4: Optimal Harvest Window */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span>{language === 'hi' ? 'कटाई का सही समय' : 'Target Harvest'}</span>
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-700">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-indigo-950 mt-1 leading-snug">
            {language === 'hi' ? crop.optimalHarvestWindowHi : crop.optimalHarvestWindowEn}
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            {language === 'hi' ? `फसल अवधि: ${crop.durationDays} दिन` : `Total duration: ${crop.durationDays} days`}
          </p>
        </div>
      </div>

      {/* Main Chart Section with Scenario Control */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Controls Bar: Sub-tabs and Scenarios */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi' ? 'उपज रुझान (2021-2026)' : 'Historical Yield Trend'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('biomass')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'biomass' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              <span>{language === 'hi' ? 'बायोमास व अवस्थाएं' : 'Growth Stages & Biomass'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'hi' ? 'डेटा तालिका' : 'Data Table'}</span>
            </button>
          </div>

          {/* Scenario Simulator Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden lg:inline">
              {language === 'hi' ? 'सिमुलेशन परिदृश्य:' : 'Simulation Scenario:'}
            </span>

            <button
              type="button"
              onClick={() => setScenario('ai')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                scenario === 'ai'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Full FieldNerve AI nutritional & irrigation guidance"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{language === 'hi' ? '✨ फील्डनर्व AI विधि (+25%)' : '✨ FieldNerve AI (+25%)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setScenario('traditional')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                scenario === 'traditional'
                  ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Typical conventional regional farmer practice"
            >
              <span>{language === 'hi' ? 'पारंपरिक विधि' : 'Baseline Practice'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Historical Area Chart */}
        {activeTab === 'trends' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {language === 'hi'
                  ? `स्थानीय उपज रुझान (क्विंटल प्रति एकड़) - विविधता: ${crop.variety}`
                  : `Local Yield Trends (Quintals per Acre) - Variety: ${crop.variety}`}
              </span>
              <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
                {language === 'hi' ? '🎯 2026 AI अनुमानित लक्ष्य: 24.1 क्विंटल' : '🎯 2026 Target: 24.1 Qtl/Acre'}
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crop.historicalTrends} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="tradGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#475569', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: '#475569', fontSize: 12 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit={selectedCrop === 'sugarcane' ? ' q' : ' q'}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }}
                  />
                  <ReferenceLine
                    y={crop.historicalTrends[3].traditional}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: language === 'hi' ? '5-वर्षीय औसत' : '5-Yr Avg', fill: '#d97706', fontSize: 11 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="aiOptimized"
                    name={language === 'hi' ? 'फील्डनर्व AI अनुशंसित उपज' : 'FieldNerve AI Yield'}
                    stroke="#059669"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#aiGradient)"
                    dot={{ r: 4, stroke: '#059669', strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="traditional"
                    name={language === 'hi' ? 'स्थानीय पारंपरिक औसत' : 'Traditional Regional Avg'}
                    stroke="#64748b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#tradGradient)"
                    strokeDasharray="3 3"
                    dot={{ r: 3, fill: '#94a3b8' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Growth Stages & Biomass Accumulation */}
        {activeTab === 'biomass' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {language === 'hi' ? 'फसल अवस्था अनुसार बायोमास वृद्धि (किलो/एकड़) व NDVI' : 'Biomass Accumulation by Growth Stage (kg/acre)'}
              </span>
              <span className="text-[11px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-bold border border-teal-200">
                {language === 'hi' ? 'सक्रिय अवस्था: कल्ले फूटना' : 'Active Stage: Tillering'}
              </span>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={crop.growthStages} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey={language === 'hi' ? 'stageHi' : 'stage'}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'biomass' ? `${val} kg/acre` : val,
                      name === 'biomass' ? (language === 'hi' ? 'बायोमास' : 'Biomass') : (language === 'hi' ? 'NDVI सूचकांक' : 'NDVI Index')
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '12px', paddingBottom: '12px' }} />
                  <Bar
                    dataKey="biomass"
                    name={language === 'hi' ? 'बायोमास (किलो/एकड़)' : 'Biomass (kg/acre)'}
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="ndvi"
                    name="NDVI Canopy Index"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#0284c7' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Detailed Historical Data Table */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">{language === 'hi' ? 'वर्ष / सीजन' : 'Year / Season'}</th>
                  <th className="p-3">{language === 'hi' ? 'पारंपरिक उपज (क्विंटल)' : 'Baseline Yield (Qtl)'}</th>
                  <th className="p-3 text-emerald-800">{language === 'hi' ? 'फील्डनर्व AI उपज' : 'FieldNerve AI Yield'}</th>
                  <th className="p-3">{language === 'hi' ? 'उपज लाभ (%)' : 'Yield Gain (%)'}</th>
                  <th className="p-3">{language === 'hi' ? 'औसत वर्षा' : 'Seasonal Rainfall'}</th>
                  <th className="p-3">{language === 'hi' ? 'संभावित मूल्य (₹)' : 'Value per Acre (₹)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crop.historicalTrends.map((row, idx) => {
                  const gain = (((row.aiOptimized - row.traditional) / row.traditional) * 100).toFixed(1);
                  const isEstimated = row.year.includes('Est');
                  return (
                    <tr key={idx} className={isEstimated ? 'bg-emerald-50/60 font-bold' : 'hover:bg-slate-50'}>
                      <td className="p-3 flex items-center gap-1.5">
                        {isEstimated && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                        <span>{row.year}</span>
                      </td>
                      <td className="p-3">{row.traditional} qtl/acre</td>
                      <td className="p-3 text-emerald-700 font-bold">{row.aiOptimized} qtl/acre</td>
                      <td className="p-3 text-emerald-800">+{gain}%</td>
                      <td className="p-3">{row.rainfall} mm</td>
                      <td className="p-3 font-semibold text-slate-900">
                        ₹{Math.round(row.aiOptimized * crop.mspRatePerQuintal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Actionable Next Best Agronomic Step */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">
                {language === 'hi' ? 'अगला सर्वोत्तम कृषि कदम (Next Best Action):' : 'Next Recommended Agronomic Action:'}
              </h4>
              <p className="text-xs text-emerald-900 mt-0.5">
                {language === 'hi' ? crop.nextBestActionHi : crop.nextBestActionEn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              {language === 'hi' ? `अनुशंसित चक्र: ${crop.durationDays} दिन` : `Cycle: ${crop.durationDays} Days`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
