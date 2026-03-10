import React, { useState, useMemo, useRef, useEffect } from 'react';
import TeolaLogo from './TeolaLogo';
import { ChevronRight, Check, Globe, MapPin, Navigation, ChevronDown, X, Search, Sparkles, Map } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (username: string, gender: string, nationality: string, location: string, stateOrCity: string) => void;
}

// Exhaustive Global Country List
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Congo (Congo-Kinshasa)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Holy See", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

const STATES_BY_COUNTRY: Record<string, string[]> = {
  "United States of America": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  "Nigeria": ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"],
  "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland", "Greater London", "Greater Manchester", "West Midlands", "West Yorkshire", "South Yorkshire", "Kent", "Essex", "Hampshire", "Surrey", "Hertfordshire", "Aberdeenshire", "Cornwall", "Devon", "Dorset", "Glasgow"],
  "India": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"],
  "Australia": ["New South Wales", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia", "Northern Territory", "Australian Capital Territory"],
  "Brazil": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"],
  "Germany": ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  "France": ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"],
  "Italy": ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"],
  "Spain": ["Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria", "Castilla-La Mancha", "Castilla y León", "Cataluña", "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja", "Valencia"],
  "Japan": ["Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"],
  "South Africa": ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"],
  "Saudi Arabia": ["Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Tabuk", "Hail", "Northern Borders", "Jazan", "Najran", "Baha", "Jouf", "Qassim"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Machakos", "Kiambu", "Kajiado", "Kilifi", "Garissa"],
  "Ghana": ["Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern", "Volta", "Upper East", "Upper West", "Bono"],
  "Malaysia": ["Johor", "Kedah", "Kelantan", "Malacca", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur"],
  "Philippines": ["Metro Manila", "Cebu", "Davao", "Iloilo", "Cavite", "Laguna", "Pampanga", "Batangas", "Bulacan", "Rizal"],
  "Argentina": ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Dakahlia", "Red Sea", "Beheira", "Faiyum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "Sharqia", "Sohag", "South Sinai", "Suez", "Luxor", "Aswan"],
  "Mexico": ["Aguascalientes", "Baja California", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas", "Ciudad de México"],
  "China": ["Beijing", "Shanghai", "Guangdong", "Zhejiang", "Jiangsu", "Sichuan", "Hubei", "Hunan", "Fujian", "Shandong", "Anhui", "Chongqing", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Jiangxi", "Jilin", "Liaoning", "Shaanxi", "Shanxi", "Yunnan"],
  "Russia": ["Moscow", "Saint Petersburg", "Moscow Oblast", "Sverdlovsk Oblast", "Republic of Tatarstan", "Krasnodar Krai", "Novosibirsk Oblast", "Nizhny Novgorod Oblast", "Samara Oblast", "Rostov Oblast"],
  "Indonesia": ["Jakarta", "West Java", "Central Java", "East Java", "Bali", "Banten", "Yogyakarta", "North Sumatra", "South Sulawesi", "Riau"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Mersin", "Diyarbakir"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Gyeonggi-do", "Gangwon-do", "Chungcheongbuk-do", "Jeju-do"],
  "Thailand": ["Bangkok", "Chiang Mai", "Phuket", "Chon Buri", "Nakhon Ratchasima", "Khon Kaen", "Samut Prakan", "Nonthaburi", "Pathum Thani"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang", "Hai Phong", "Can Tho", "Bac Ninh", "Binh Duong", "Dong Nai", "Khanh Hoa", "Quang Ninh"],
  "Netherlands": ["North Holland", "South Holland", "Utrecht", "North Brabant", "Gelderland", "Overijssel", "Limburg", "Groningen", "Friesland", "Drenthe", "Zeeland", "Flevoland"],
  "Switzerland": ["Zurich", "Geneva", "Bern", "Vaud", "Basel-Stadt", "Ticino", "Lucerne", "Zug", "Aargau", "Valais"],
  "Sweden": ["Stockholm", "Västra Götaland", "Skåne", "Östergötland", "Uppsala", "Jönköping", "Halland", "Örebro", "Västmanland", "Dalarna"],
  "Ireland": ["Dublin", "Cork", "Galway", "Limerick", "Waterford", "Kildare", "Meath", "Wicklow", "Tipperary", "Donegal"],
  "Pakistan": ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Jammu and Kashmir"],
  "New Zealand": ["Auckland", "Wellington", "Canterbury", "Waikato", "Bay of Plenty", "Otago", "Manawatu-Wanganui", "Taranaki", "Hawke's Bay", "Northland"],
  "Portugal": ["Lisbon", "Porto", "Setúbal", "Braga", "Aveiro", "Leiria", "Santarém", "Faro", "Coimbra", "Viseu", "Madeira", "Azores"],
  "Greece": ["Attica", "Central Macedonia", "Thessaly", "Western Greece", "Peloponnese", "Crete", "Epirus", "Central Greece", "South Aegean", "Ionian Islands"],
  "Belgium": ["Brussels", "Antwerp", "East Flanders", "Flemish Brabant", "Limburg", "West Flanders", "Hainaut", "Liège", "Luxembourg", "Namur", "Walloon Brabant"],
  "Austria": ["Vienna", "Lower Austria", "Upper Austria", "Styria", "Tyrol", "Carinthia", "Salzburg", "Vorarlberg", "Burgenland"],
  "Denmark": ["Capital Region", "Central Denmark", "North Denmark", "Region Zealand", "Southern Denmark"],
  "Norway": ["Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder", "Rogaland", "Vestland", "Møre og Romsdal", "Trøndelag", "Nordland", "Troms og Finnmark"],
  "Finland": ["Uusimaa", "Pirkanmaa", "Southwest Finland", "North Ostrobothnia", "Central Finland", "Satakunta", "Savonia", "Lapland"],
  "Poland": ["Masovian", "Lesser Poland", "Greater Poland", "Silesian", "Pomeranian", "Lower Silesian", "Łódź", "West Pomeranian", "Lublin", "Subcarpathian"],
  "Israel": ["Jerusalem", "Northern", "Haifa", "Central", "Tel Aviv", "Southern", "Judea and Samaria"],
  "Singapore": ["Central", "North", "Northeast", "East", "West"],
  "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Lviv", "Zaporizhzhia", "Vinnytsia", "Poltava", "Ivano-Frankivsk", "Chernihiv"]
};

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [nationality, setNationality] = useState('');
  const [location, setLocation] = useState('');
  const [stateOrCity, setStateOrCity] = useState('');
  
  const [step, setStep] = useState(1);
  
  const [countrySearch, setCountrySearch] = useState('');
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showNationalityPicker, setShowNationalityPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const genders = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const filteredNationalities = useMemo(() => {
    return COUNTRIES.filter(c => c.toLowerCase().includes(nationalitySearch.toLowerCase()));
  }, [nationalitySearch]);

  const availableStates = useMemo(() => STATES_BY_COUNTRY[location] || [], [location]);

  const filteredStates = useMemo(() => {
    return availableStates.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [availableStates, stateSearch]);

  const handleNext = () => {
    if (step === 1 && username.trim().length >= 3) {
      setStep(2);
    } else if (step === 2 && gender) {
      setStep(3);
    } else if (step === 3 && nationality && location && stateOrCity) {
      onComplete(username, gender, nationality, location, stateOrCity);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCountryPicker(false);
        setShowNationalityPicker(false);
        setShowStatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Helper to safely select nationality
  const handleSelectNationality = (c: string) => {
    setNationality(c);
    setNationalitySearch('');
    setShowNationalityPicker(false);
  };

  // Helper to safely select country of residence
  const handleSelectLocation = (c: string) => {
    setLocation(c);
    setCountrySearch('');
    setShowCountryPicker(false);
    // Reset state when country changes
    setStateOrCity('');
    setStateSearch('');
  };

  // Helper to safely select state/city
  const handleSelectState = (s: string) => {
    setStateOrCity(s);
    setStateSearch('');
    setShowStatePicker(false);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-white dark:bg-neutral-950 px-6 z-[600] overflow-y-auto no-scrollbar pt-4 pb-20 md:pt-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-100 dark:bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-100 dark:bg-purple-900/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div ref={containerRef} className="relative max-w-sm w-full space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 z-10">
        <div className="flex flex-col items-center space-y-1">
          <TeolaLogo className="w-10 h-10 text-black dark:text-white" />
          <div className="text-center space-y-0.5">
            <h2 className="serif text-xl md:text-2xl font-bold dark:text-white">Style Profile</h2>
            <p className="text-[7px] uppercase tracking-[0.4em] font-black text-neutral-400">Calibration Stage {step} of 3</p>
          </div>
        </div>

        <div className="min-h-[220px]">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 p-5 rounded-[2rem] rounded-tl-none relative mb-6 shadow-sm">
                 <div className="absolute -top-3 -left-3 p-2 bg-blue-600 text-white rounded-full shadow-lg">
                    <Sparkles size={12} fill="currentColor" />
                 </div>
                 <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed font-bold italic">
                   Great to have you here! Let's build your style identity together. This quick tour will help me understand you better.
                 </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold dark:text-neutral-200">Maison Alias</h3>
                <p className="text-[10px] text-neutral-500 leading-relaxed italic">"How shall the archive identify you?"</p>
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">@</span>
                <input 
                  autoFocus
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full pl-12 pr-6 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold dark:text-neutral-200">Sartorial Identity</h3>
                <p className="text-[10px] text-neutral-500 leading-relaxed italic">"Calibrates silhouette rendering logic."</p>
              </div>
              <div className="grid gap-1.5">
                {genders.map(g => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                      gender === g 
                        ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-lg scale-[1.01]' 
                        : 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest">{g}</span>
                    {gender === g && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold dark:text-neutral-200">Geographic Intelligence</h3>
                <p className="text-[10px] text-neutral-500 leading-relaxed italic">"Climate and regional aesthetic alignment."</p>
              </div>

              <div className="space-y-3">
                {/* Nationality Picker */}
                <div className="space-y-1.5 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-neutral-400 ml-4">Nationality</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input 
                      type="text" 
                      value={showNationalityPicker ? nationalitySearch : nationality}
                      onFocus={() => { 
                        setShowNationalityPicker(true); 
                        setShowCountryPicker(false); 
                        setShowStatePicker(false);
                        setNationalitySearch(nationality);
                      }}
                      onChange={(e) => { 
                        setNationalitySearch(e.target.value); 
                        if (nationality) setNationality(''); 
                      }}
                      placeholder="Search Nationality"
                      className="w-full pl-12 pr-10 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    />
                    {showNationalityPicker && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-2xl z-[1000] max-h-48 overflow-y-auto no-scrollbar py-2 glass animate-in fade-in zoom-in-95 duration-200">
                        {filteredNationalities.length > 0 ? (
                          filteredNationalities.map(c => (
                            <button 
                              key={c} 
                              onClick={() => handleSelectNationality(c)}
                              className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-between"
                            >
                              {c}
                              {nationality === c && <Check size={12} />}
                            </button>
                          ))
                        ) : (
                          <div className="px-6 py-4 text-[10px] text-neutral-400 uppercase font-black text-center">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Country of Residence Picker */}
                <div className="space-y-1.5 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-neutral-400 ml-4">Country of Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input 
                      type="text" 
                      value={showCountryPicker ? countrySearch : location}
                      onFocus={() => { 
                        setShowCountryPicker(true); 
                        setShowNationalityPicker(false); 
                        setShowStatePicker(false);
                        setCountrySearch(location);
                      }}
                      onChange={(e) => { 
                        setCountrySearch(e.target.value); 
                        if (location) setLocation(''); 
                      }}
                      placeholder="Search Country"
                      className="w-full pl-12 pr-10 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    />
                    {showCountryPicker && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-2xl z-[1000] max-h-48 overflow-y-auto no-scrollbar py-2 glass animate-in fade-in zoom-in-95 duration-200">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map(c => (
                            <button 
                              key={c} 
                              onClick={() => handleSelectLocation(c)}
                              className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-between"
                            >
                              {c}
                              {location === c && <Check size={12} />}
                            </button>
                          ))
                        ) : (
                          <div className="px-6 py-4 text-[10px] text-neutral-400 uppercase font-black text-center">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* State/Region Picker */}
                <div className="space-y-1.5 relative">
                  <label className="text-[8px] font-black uppercase tracking-widest text-neutral-400 ml-4">State / Province / Region</label>
                  <div className="relative">
                    <Navigation className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                    <input 
                      type="text" 
                      value={showStatePicker ? stateSearch : stateOrCity}
                      onFocus={() => { 
                        if (availableStates.length > 0) {
                          setShowStatePicker(true);
                          setStateSearch(stateOrCity);
                        }
                        setShowCountryPicker(false); 
                        setShowNationalityPicker(false); 
                      }}
                      onChange={(e) => { 
                        const val = e.target.value;
                        if (availableStates.length > 0) {
                          setStateSearch(val);
                          if (stateOrCity) setStateOrCity('');
                        } else {
                          setStateOrCity(val);
                        }
                      }}
                      placeholder={location ? (availableStates.length > 0 ? "Search State" : "Enter City/Region") : "Select Country First"}
                      disabled={!location}
                      className="w-full pl-12 pr-10 py-3.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm disabled:opacity-40"
                    />
                    {showStatePicker && availableStates.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-2xl z-[1000] max-h-48 overflow-y-auto no-scrollbar py-2 glass animate-in fade-in zoom-in-95 duration-200">
                        {filteredStates.length > 0 ? (
                          filteredStates.map(s => (
                            <button 
                              key={s} 
                              onClick={() => handleSelectState(s)}
                              className="w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-between"
                            >
                              {s}
                              {stateOrCity === s && <Check size={12} />}
                            </button>
                          ))
                        ) : (
                          <div className="px-6 py-4 text-[10px] text-neutral-400 uppercase font-black text-center">No results found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={handleNext}
            disabled={(step === 1 && username.trim().length < 3) || (step === 2 && !gender) || (step === 3 && (!nationality || !location || !stateOrCity))}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {step === 3 ? 'Deploy Sequence' : 'Next Step'}
            <ChevronRight size={14} />
          </button>
          
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="w-full py-1 text-neutral-400 font-bold text-[9px] uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
            >
              Back
            </button>
          )}
        </div>

        <div className="flex justify-center gap-3 pt-4">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-neutral-200 dark:bg-neutral-800'}`} />
           ))}
        </div>
      </div>

      <footer className="mt-auto pt-8 text-center opacity-30">
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-neutral-400">Maison Calibration Protocol v6.3</p>
      </footer>
    </div>
  );
};

export default OnboardingView;